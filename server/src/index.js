const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { setupSocket } = require('./socket/handler');
const volunteerRoutes = require('./routes/volunteers');
const sectorRoutes = require('./routes/sectors');
const deploymentRoutes = require('./routes/deployments');
const { deploy } = require('./services/matchmaker');
const { simulateIncident } = require('./services/incidentSimulator');
const path = require('path');

const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.join(__dirname, '..', 'prisma', 'dev.db') });
const prisma = new PrismaClient({ adapter });
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://kumbh-sync.vercel.app',
  'https://kumbh-sync-1y64fu6i4-utkarsh63s-projects.vercel.app',
  /https:\/\/kumbh-sync.*\.vercel\.app$/
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Attach prisma and io to request for use in routes
app.use((req, res, next) => {
  req.prisma = prisma;
  req.io = io;
  next();
});

// Routes
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/deployments', deploymentRoutes);

// Deploy endpoint
app.post('/api/deploy', async (req, res) => {
  try {
    const { sectorId, count, task } = req.body;

    if (!sectorId || !count) {
      return res.status(400).json({ error: 'sectorId and count are required' });
    }

    const result = await deploy(sectorId, count, prisma, io, true, task);
    res.json(result);
  } catch (err) {
    console.error('Deploy error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Incident simulation endpoint
app.post('/api/simulate-incident', async (req, res) => {
  try {
    const { sectorId, incidentType, volunteersNeeded } = req.body;

    if (!sectorId || !incidentType || !volunteersNeeded) {
      return res.status(400).json({
        error: 'sectorId, incidentType, and volunteersNeeded are required',
      });
    }

    const result = await simulateIncident(
      sectorId,
      incidentType,
      volunteersNeeded,
      prisma,
      io
    );
    res.json(result);
  } catch (err) {
    console.error('Incident simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Emergency endpoint
app.post('/api/sectors/:id/incident', async (req, res) => {
  try {
    const sectorId = parseInt(req.params.id) || 1;
    const incidentType = req.body.incidentType || 'Crowd Surge';
    const volunteersNeeded = req.body.volunteersNeeded ? parseInt(req.body.volunteersNeeded) : 30;

    const sector = await prisma.sector.update({
      where: { id: sectorId },
      data: {
        activeIncident: true,
        incidentType,
        priorityLevel: 'Critical',
      },
    });

    io.emit('incident:triggered', {
      sectorId,
      sectorName: sector.name,
      incidentType,
      priorityLevel: 'Critical',
      volunteersNeeded,
      timestamp: new Date().toISOString(),
    });

    const result = await deploy(sectorId, volunteersNeeded, prisma, io, false, incidentType);

    io.emit('sector:update', sector);
    io.emit('sector:updated', sector);

    const topDeployments = result.deployments.slice(0, 5);
    res.json({ message: 'Emergency simulated', result });

    topDeployments.forEach((d, index) => {
      setTimeout(() => {
        if (d.rerouted) {
          io.emit('volunteer:rerouted', d);
        } else {
          io.emit('deployment:issued', {
            id: d.id,
            volunteerId: d.volunteerId,
            volunteerName: d.volunteerName,
            volunteerPhone: d.volunteer?.phone,
            volunteerSkill: d.volunteer?.primarySkill,
            sectorName: sector.name,
            sectorId: sector.id,
            incidentType: incidentType,
            matchScore: d.matchScore,
            message: `⚡ ${d.volunteerName} dispatched S${d.fromSector} → ${sector.name} (Score: ${d.matchScore})`,
            timestamp: new Date().toISOString(),
          });
        }
      }, index * 800);
    });
  } catch (err) {
    console.error('Simulate incident error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reset endpoint
app.post('/api/reset', async (req, res) => {
  try {
    await prisma.sector.updateMany({
      data: {
        priorityLevel: 'Low',
        activeIncident: false,
        incidentType: null,
        volunteersDeployed: 0,
      }
    });

    await prisma.volunteer.updateMany({
      where: { status: 'Deployed' },
      data: { status: 'Available' }
    });

    await prisma.deployment.deleteMany();

    io.emit('system:reset');
    io.emit('stats:refresh');
    
    const sectors = await prisma.sector.findMany();
    sectors.forEach(s => io.emit('sector:updated', s));

    res.json({ message: 'System reset' });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const counts = await prisma.volunteer.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    const result = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      volunteerCounts: counts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id;
        return acc;
      }, { Available: 0, Deployed: 0, Resting: 0 })
    };
    res.json(result);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io setup
setupSocket(io);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 KumbhSync server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
