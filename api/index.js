import express from 'express';
import cors from 'cors';
import { getAll, create, update, remove } from './_store.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', (req, res) => {
  res.json(getAll());
});

app.post('/api/tasks', (req, res) => {
  const title = (req.body?.title || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  res.status(201).json(create(title));
});

app.put('/api/tasks/:id', (req, res) => {
  const { title, completed } = req.body || {};
  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  const task = update(req.params.id, { title, completed });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const removed = remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).end();
});

// Unmatched routes under /api
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler: malformed JSON bodies, and anything an
// upstream handler throws, land here instead of crashing the function.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`To-Do API listening on http://localhost:${PORT}`);
  });
}

export default app;
