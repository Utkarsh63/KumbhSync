const express = require('express');
const router = express.Router();

// GET /api/sectors - List all sectors
router.get('/', async (req, res) => {
  try {
    const sectors = await req.prisma.sector.findMany({
      orderBy: { id: 'asc' },
      include: {
        deployments: {
          where: { status: 'Active' },
          include: {
            volunteer: true,
          },
        },
      },
    });
    res.json(sectors);
  } catch (err) {
    console.error('Error fetching sectors:', err);
    res.status(500).json({ error: 'Failed to fetch sectors' });
  }
});

// GET /api/sectors/:id - Single sector with deployed volunteers
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await req.prisma.sector.findUnique({
      where: { id: parseInt(id) },
      include: {
        deployments: {
          where: { status: 'Active' },
          include: {
            volunteer: true,
          },
          orderBy: { deployedAt: 'desc' },
        },
      },
    });

    if (!sector) {
      return res.status(404).json({ error: 'Sector not found' });
    }

    res.json(sector);
  } catch (err) {
    console.error('Error fetching sector:', err);
    res.status(500).json({ error: 'Failed to fetch sector' });
  }
});

// PATCH /api/sectors/reset - Reset all sectors
router.patch('/reset', async (req, res) => {
  try {
    await req.prisma.sector.updateMany({
      data: {
        priorityLevel: 'Low',
        activeIncident: false,
        incidentType: null,
        volunteersDeployed: 0,
      }
    });

    await req.prisma.volunteer.updateMany({
      where: { status: 'Deployed' },
      data: { status: 'Available' }
    });

    await req.prisma.deployment.deleteMany();

    const [sectors, volunteers] = await Promise.all([
      req.prisma.sector.findMany({ orderBy: { id: 'asc' } }),
      req.prisma.volunteer.findMany({ orderBy: { id: 'desc' } })
    ]);

    res.json({ success: true, sectors, volunteers });
  } catch (err) {
    console.error('Error resetting system:', err);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

// PATCH /api/sectors/:id - Update sector fields
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be directly updated
    delete updateData.id;

    const sector = await req.prisma.sector.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    req.io.emit('sector:updated', sector);
    res.json(sector);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Sector not found' });
    }
    console.error('Error updating sector:', err);
    res.status(500).json({ error: 'Failed to update sector' });
  }
});

module.exports = router;
