const { deploy } = require('./matchmaker');

/**
 * Simulate an incident at a sector and auto-deploy volunteers.
 * @param {number} sectorId - The sector where the incident occurs
 * @param {string} incidentType - Type/description of the incident
 * @param {number} volunteersNeeded - How many volunteers to deploy
 * @param {PrismaClient} prisma - Prisma client
 * @param {Server} io - Socket.io server
 */
async function simulateIncident(sectorId, incidentType, volunteersNeeded, prisma, io) {
  // 1. Update sector to reflect active incident
  const sector = await prisma.sector.update({
    where: { id: sectorId },
    data: {
      activeIncident: true,
      incidentType,
      priorityLevel: 'Critical',
    },
  });

  // 2. Emit incident triggered event
  io.emit('incident:triggered', {
    sectorId,
    sectorName: sector.name,
    incidentType,
    priorityLevel: 'Critical',
    volunteersNeeded,
    timestamp: new Date().toISOString(),
  });

  // 3. Deploy volunteers using matchmaker
  const result = await deploy(sectorId, volunteersNeeded, prisma, io, true, incidentType);

  // 4. Build human-readable feed messages
  const feedMessages = result.deployments.map((d) => ({
    message: `🚨 Rerouting ${d.volunteerName} from Sector ${d.fromSector} → Sector ${d.toSector} (score: ${d.matchScore})`,
    volunteerName: d.volunteerName,
    fromSector: d.fromSector,
    toSector: d.toSector,
    matchScore: d.matchScore,
    timestamp: new Date().toISOString(),
  }));

  // 5. Emit deployment feed
  io.emit('deployment:feed', {
    incidentType,
    sectorId,
    sectorName: sector.name,
    messages: feedMessages,
  });

  // 6. Emit updated sector
  io.emit('sector:updated', sector);

  return {
    incident: {
      sectorId,
      sectorName: sector.name,
      incidentType,
      priorityLevel: 'Critical',
    },
    deploymentResult: result,
    feed: feedMessages,
  };
}

module.exports = { simulateIncident };
