const express = require('express');
const router = express.Router();

// GET /api/deployments - List recent deployments
router.get('/', async (req, res) => {
  try {
    const deployments = await req.prisma.deployment.findMany({
      include: {
        volunteer: true,
        sector: true,
      },
      orderBy: { deployedAt: 'desc' },
      take: 50,
    });

    res.json(deployments);
  } catch (err) {
    console.error('Error fetching deployments:', err);
    res.status(500).json({ error: 'Failed to fetch deployments' });
  }
});

// POST /api/deployments/:id/complete - Mark deployment as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;

    const deployment = await req.prisma.deployment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    if (deployment.status === 'Completed') {
      return res.status(400).json({ error: 'Deployment already completed' });
    }

    // Use transaction to update deployment, volunteer, and sector atomically
    const result = await req.prisma.$transaction(async (tx) => {
      // Mark deployment as completed
      const updatedDeployment = await tx.deployment.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Completed',
          completedAt: new Date(),
        },
        include: {
          volunteer: true,
          sector: true,
        },
      });

      // Update volunteer status back to Available
      await tx.volunteer.update({
        where: { id: deployment.volunteerId },
        data: { status: 'Available' },
      });

      // Decrement sector volunteersDeployed (ensure it doesn't go below 0)
      const sector = await tx.sector.findUnique({
        where: { id: deployment.sectorId },
      });

      await tx.sector.update({
        where: { id: deployment.sectorId },
        data: {
          volunteersDeployed: Math.max(0, sector.volunteersDeployed - 1),
        },
      });

      return updatedDeployment;
    });

    // Emit socket events
    req.io.emit('deployment:completed', result);
    req.io.emit('volunteer:updated', result.volunteer);
    req.io.emit('sector:updated', result.sector);
    req.io.emit('stats:refresh');

    res.json(result);
  } catch (err) {
    console.error('Error completing deployment:', err);
    res.status(500).json({ error: 'Failed to complete deployment' });
  }
});

module.exports = router;
