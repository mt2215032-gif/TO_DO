import { update, remove } from '../_store.js';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    const { title, completed } = req.body || {};
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    const task = update(id, { title, completed });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.status(200).json(task);
  }

  if (req.method === 'DELETE') {
    const removed = remove(id);
    if (!removed) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.status(204).end();
  }

  res.setHeader('Allow', 'PATCH, DELETE');
  res.status(405).json({ error: 'Method not allowed' });
}
