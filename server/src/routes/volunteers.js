const express = require('express');
const router = express.Router();

// GET /api/volunteers - List all volunteers with optional filters
router.get('/', async (req, res) => {
  try {
    const { status, skill } = req.query;
    const where = {};

    if (status) where.status = status;
    if (skill) where.primarySkill = skill;

    const volunteers = await req.prisma.volunteer.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        deployments: {
          where: { status: 'Active' },
          include: { sector: true },
        },
      },
    });

    res.json(volunteers);
  } catch (err) {
    console.error('Error fetching volunteers:', err);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// GET /api/volunteers/stats - Aggregate stats
// IMPORTANT: This must be defined BEFORE /:id to prevent Express
// from matching "stats" as a numeric :id parameter.
router.get('/stats', async (req, res) => {
  try {
    const [
      total,
      available,
      deployed,
      resting,
      bySkill,
      avgFatigue,
    ] = await Promise.all([
      req.prisma.volunteer.count(),
      req.prisma.volunteer.count({ where: { status: 'Available' } }),
      req.prisma.volunteer.count({ where: { status: 'Deployed' } }),
      req.prisma.volunteer.count({ where: { status: 'Resting' } }),
      req.prisma.volunteer.groupBy({
        by: ['primarySkill'],
        _count: { id: true },
      }),
      req.prisma.volunteer.aggregate({
        _avg: { fatigueScore: true },
      }),
    ]);

    const skillCounts = {};
    bySkill.forEach((s) => {
      skillCounts[s.primarySkill] = s._count.id;
    });

    res.json({
      total,
      byStatus: { available, deployed, resting },
      bySkill: skillCounts,
      averageFatigue: Math.round(avgFatigue._avg.fatigueScore || 0),
    });
  } catch (err) {
    console.error('Error fetching volunteer stats:', err);
    res.status(500).json({ error: 'Failed to fetch volunteer stats' });
  }
});

// GET /api/volunteers/:id - Single volunteer with full history
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(parseInt(id))) return res.status(400).json({ error: 'Invalid ID' });
    
    const volunteer = await req.prisma.volunteer.findUnique({
      where: { id: parseInt(id) },
      include: {
        deployments: {
          orderBy: { deployedAt: 'desc' },
          take: 3,
          include: { sector: true }
        }
      }
    });

    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(volunteer);
  } catch (err) {
    console.error('Error fetching volunteer:', err);
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

// POST /api/volunteers - Create a new volunteer
router.post('/', async (req, res) => {
  try {
    const { name, phone, age, primarySkill, fitnessLevel, currentSector, shiftTiming } = req.body;

    // Validate required fields
    if (!name || !phone || !age || !primarySkill) {
      return res.status(400).json({
        error: 'Missing required fields: name, phone, age, primarySkill',
      });
    }

    // Validate enum values
    const validSkills = ['Medical', 'CrowdControl', 'Translation', 'Swimmer', 'Sanitation', 'General'];

    if (!validSkills.includes(primarySkill)) {
      return res.status(400).json({ error: `Invalid primarySkill. Must be one of: ${validSkills.join(', ')}` });
    }
    if (typeof age !== 'number' || age < 18 || age > 100) {
      return res.status(400).json({ error: 'Age must be a number between 18 and 100' });
    }

    const volunteer = await req.prisma.volunteer.create({
      data: {
        name,
        phone,
        age,
        primarySkill,
        fitnessLevel: fitnessLevel || 'Medium',
        currentSector: currentSector || 1,
        shiftTiming: shiftTiming || '06:00 AM - 02:00 PM',
      },
    });

    req.io.emit('volunteer:created', volunteer);
    res.status(201).json(volunteer);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Phone number already registered' });
    }
    console.error('Error creating volunteer:', err);
    res.status(500).json({ error: 'Failed to create volunteer' });
  }
});

// PATCH /api/volunteers/:id - Update volunteer fields
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be directly updated
    delete updateData.id;
    delete updateData.createdAt;

    const volunteer = await req.prisma.volunteer.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    req.io.emit('volunteer:updated', volunteer);
    res.json(volunteer);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }
    console.error('Error updating volunteer:', err);
    res.status(500).json({ error: 'Failed to update volunteer' });
  }
});

// DELETE /api/volunteers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await req.prisma.deployment.deleteMany({ where: { volunteerId: parseInt(id) } });
    await req.prisma.volunteer.delete({ where: { id: parseInt(id) } });
    req.io.emit('volunteer:deleted', { id: parseInt(id) });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting volunteer:', err);
    res.status(500).json({ error: 'Failed to delete volunteer' });
  }
});

// POST /api/volunteers/:id/deploy
router.post('/:id/deploy', async (req, res) => {
  try {
    const { id } = req.params;
    const { sectorId, task } = req.body;
    
    const volunteer = await req.prisma.volunteer.findUnique({ where: { id: parseInt(id) } });
    const sector = await req.prisma.sector.findUnique({ where: { id: parseInt(sectorId) } });

    if (!volunteer || !sector) return res.status(404).json({ error: 'Not found' });

    const result = await req.prisma.$transaction(async (tx) => {
      const deployment = await tx.deployment.create({
        data: {
          volunteerId: volunteer.id,
          sectorId: sector.id,
          fromSector: volunteer.currentSector,
          matchScore: 100, // manual override
          reason: 'Manual deployment',
          task: task || volunteer.primarySkill,
        },
        include: { volunteer: true, sector: true }
      });

      await tx.volunteer.update({
        where: { id: volunteer.id },
        data: { status: 'Deployed', currentSector: sector.id, fatigueScore: Math.min(100, volunteer.fatigueScore + 5) }
      });

      await tx.sector.update({
        where: { id: sector.id },
        data: { volunteersDeployed: { increment: 1 } }
      });

      return deployment;
    });

    req.io.emit('deployment:new', result);
    req.io.emit('sector:updated', result.sector);
    req.io.emit('volunteer:updated', result.volunteer);
    req.io.emit('stats:refresh');
    
    res.json(result);
  } catch (err) {
    console.error('Error manually deploying:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
