/**
 * Matchmaker Engine
 * Scores and deploys volunteers to sectors based on skill match,
 * proximity, fatigue, and fitness criteria.
 */

/**
 * Calculate a match score for a volunteer against a target sector.
 * Higher scores indicate better matches.
 */
function calculateScore(volunteer, sector, isReroute = false) {
  if (volunteer.status !== 'Available' && !isReroute) return { score: -999, reasons: [] };

  let score = 0;
  const reasons = [];
  const adjacentIds = sector.adjacentSectors.split(',').map(Number);

  // Skill match (+10)
  if (volunteer.primarySkill === sector.requiredSkill) {
    score += 10;
    reasons.push(`Skill match (${volunteer.primarySkill}) +10`);
  }

  // Proximity: same sector (+8) or adjacent (+5)
  if (volunteer.currentSector === sector.id) {
    score += 8;
    reasons.push(`Same sector +8`);
  } else if (adjacentIds.includes(volunteer.currentSector)) {
    score += 5;
    reasons.push(`Adjacent sector +5`);
  }

  // Fatigue penalties
  if (volunteer.fatigueScore > 60) {
    score -= 10;
    reasons.push(`High fatigue (${volunteer.fatigueScore}) -10`);
  } else if (volunteer.fatigueScore > 30) {
    score -= 4;
    reasons.push(`Moderate fatigue (${volunteer.fatigueScore}) -4`);
  }

  // Fitness bonuses
  if (volunteer.fitnessLevel === 'High' && sector.type === 'Ghat') {
    score += 5;
    reasons.push(`High fitness for Ghat +5`);
  }
  if (volunteer.fitnessLevel === 'Low' && sector.type === 'Helpdesk') {
    score += 3;
    reasons.push(`Low fitness suited for Helpdesk +3`);
  }
  if (volunteer.fitnessLevel === 'Low' && sector.type === 'Ghat') {
    score -= 5;
    reasons.push(`Low fitness penalty for Ghat -5`);
  }

  return { score, reasons };
}

/**
 * Deploy volunteers to a sector using the matchmaker scoring algorithm.
 * @param {number} sectorId - Target sector ID
 * @param {number} count - Number of volunteers to deploy
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {Server} io - Socket.io server instance
 * @param {string} task - Task description for the deployment
 * @param {boolean} emitEvents - Whether to emit socket events automatically
 * @returns {Array} Array of deployment results
 */
async function deploy(sectorId, count, prisma, io, emitEvents = true, task = null) {
  // 1. Fetch the target sector
  const sector = await prisma.sector.findUnique({
    where: { id: sectorId },
  });

  if (!sector) {
    throw new Error(`Sector ${sectorId} not found`);
  }

  if (sector.volunteersDeployed >= sector.volunteersRequired) {
    console.warn(`[Matchmaker] Sector ${sector.name} is already at or over capacity (${sector.volunteersDeployed}/${sector.volunteersRequired}). Deploying anyway.`);
  }

  // 2. Fetch all available volunteers
  const volunteers = await prisma.volunteer.findMany({
    where: { status: 'Available' },
  });

  if (volunteers.length === 0) {
    throw new Error('No available volunteers to deploy');
  }

  // 3. Score each available volunteer and sort descending
  const scored = volunteers
    .map((v) => {
      const { score, reasons } = calculateScore(v, sector, false);
      return { volunteer: v, score, reasons, rerouted: false };
    })
    .filter((s) => s.score > -999)
    .sort((a, b) => b.score - a.score);

  // Take top `count` volunteers
  let topCandidates = scored.slice(0, count);

  // Fallback: If we don't have enough Available volunteers
  if (topCandidates.length < count) {
    const shortfall = count - topCandidates.length;
    
    // Find Deployed volunteers in Low priority sectors
    const lowPrioritySectors = await prisma.sector.findMany({
      where: { priorityLevel: 'Low' },
      select: { id: true }
    });
    const lowPrioritySectorIds = lowPrioritySectors.map(s => s.id);
    
    const potentialReroutes = await prisma.volunteer.findMany({
      where: { 
        status: 'Deployed', 
        currentSector: { in: lowPrioritySectorIds } 
      }
    });

    const scoredReroutes = potentialReroutes
      .map((v) => {
        const { score, reasons } = calculateScore(v, sector, true);
        return { volunteer: v, score, reasons, rerouted: true };
      })
      .filter((s) => s.score > -999)
      .sort((a, b) => b.score - a.score);

    const selectedReroutes = scoredReroutes.slice(0, shortfall);
    topCandidates = [...topCandidates, ...selectedReroutes];
  }

  if (topCandidates.length === 0) {
    throw new Error('No suitable volunteers found for this sector, even with re-routing');
  }

  // 4. Execute deployment in a transaction
  const deployments = await prisma.$transaction(async (tx) => {
    const results = [];

    for (const candidate of topCandidates) {
      const { volunteer, score, reasons, rerouted } = candidate;
      const reasonStr = reasons.length > 0
        ? `${reasons.join(', ')}, Total: ${score}`
        : `Total: ${score}`;

      // Create deployment record
      const deployment = await tx.deployment.create({
        data: {
          volunteerId: volunteer.id,
          sectorId: sector.id,
          fromSector: volunteer.currentSector,
          matchScore: score,
          reason: reasonStr,
          task: task,
        },
        include: {
          volunteer: true,
          sector: true,
        },
      });

      // Update volunteer: status → Deployed, move to target sector, increase fatigue
      await tx.volunteer.update({
        where: { id: volunteer.id },
        data: {
          status: 'Deployed',
          currentSector: sector.id,
          fatigueScore: Math.min(100, volunteer.fatigueScore + 10),
        },
      });

      // If rerouted, we must decrement the original sector's deployed count
      if (rerouted) {
        await tx.sector.update({
          where: { id: volunteer.currentSector },
          data: {
            volunteersDeployed: {
              decrement: 1,
            },
          },
        });
      }

      results.push({ ...deployment, rerouted });
    }

    // Increment sector's volunteersDeployed count
    await tx.sector.update({
      where: { id: sector.id },
      data: {
        volunteersDeployed: {
          increment: topCandidates.length,
        },
      },
    });

    return results;
  });

  // 5. Emit socket events
  if (emitEvents) {
    for (const dep of deployments) {
      if (dep.rerouted) {
        io.emit('volunteer:rerouted', dep);
      } else {
        io.emit('deployment:new', dep);
      }
    }
  }

  // Fetch updated sector for broadcast
  const updatedSector = await prisma.sector.findUnique({
    where: { id: sectorId },
  });
  io.emit('sector:updated', updatedSector);
  io.emit('stats:refresh');

  // 6. Return deployment results with readable info
  return {
    sectorId,
    sectorName: sector.name,
    deploymentsCreated: deployments.length,
    deployments: deployments.map((d) => ({
      id: d.id,
      volunteerId: d.volunteerId,
      volunteerName: d.volunteer.name,
      fromSector: d.fromSector,
      toSector: d.sectorId,
      matchScore: d.matchScore,
      reason: d.reason,
      rerouted: d.rerouted,
      fitnessPenalty: d.volunteer.fitnessLevel === 'Low' && sector.type === 'Ghat',
    })),
  };
}

module.exports = { calculateScore, deploy };
