// ============================================================
// Anonymous — Backend: Express Server
// ============================================================
// Main entry point. Mounts all routes and starts the API.
// ============================================================

const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scanRoutes');
const resultRoutes = require('./routes/resultRoutes');
const recheckJob = require('../../scheduler/jobs/recheckJob');
const actionJob = require('../../scheduler/jobs/actionJob');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/scans', scanRoutes);
app.use('/api/results', resultRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Privix API',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// ── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║   🔒 Privix API Server                       ║`);
  console.log(`║   Running on http://localhost:${PORT}            ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);
  
  // Start background jobs
  recheckJob.start();
  actionJob.start();
});

module.exports = app;
