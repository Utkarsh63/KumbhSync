/**
 * Socket.io connection handler
 * Manages real-time WebSocket connections for KumbhSync dashboard.
 */

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send welcome event with connection info
    socket.emit('welcome', {
      message: 'Connected to KumbhSync server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // Handle client requesting a stats refresh
    socket.on('request:stats', () => {
      io.emit('stats:refresh');
    });

    // Handle client requesting sector data refresh
    socket.on('request:sectors', () => {
      io.emit('sectors:refresh');
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error for ${socket.id}:`, err);
    });
  });
}

module.exports = { setupSocket };
