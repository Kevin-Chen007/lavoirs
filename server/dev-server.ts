import express from 'express';
import tokenHandler from '../api/livekit/token.js';

process.env.NODE_ENV ??= 'development';

const app = express();
app.use(express.json({ limit: '10kb' }));
app.get('/api/health', (_request, response) => response.json({ ok: true }));
app.post('/api/livekit/token', (request, response) => {
  void tokenHandler(request, response);
});

const port = Number(process.env.API_PORT ?? 3001);
app.listen(port, '127.0.0.1', () => {
  console.log(`Local API listening on http://127.0.0.1:${port}`);
});
