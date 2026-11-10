import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

// Health check endpoint for Cloud Run container probes
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static assets from dist with cache headers
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // Don't cache index.html or service worker so updates are picked up immediately
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// SPA fallback: send index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, host, () => {
  console.log(`Nur al-Salat production server running on http://${host}:${port}`);
});
