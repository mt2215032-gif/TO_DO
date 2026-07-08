import { Router } from 'express';
import * as store from '../store.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(store.getAll());
});

router.post('/', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = store.create(title);
  res.status(201).json(task);
});

router.patch('/:id', (req, res) => {
  const { title, completed } = req.body;
  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }
  const task = store.update(req.params.id, { title, completed });
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const removed = store.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).end();
});

export default router;
