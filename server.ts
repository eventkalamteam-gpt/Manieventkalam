import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend build from /dist if built
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Render / Cloud Run
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EventKalam Backend Server',
    organization: 'Robokalam Technologies',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application fallback routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`EventKalam server running on port ${PORT}`);
});
