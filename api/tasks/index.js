import { getAll, create } from '../_store.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(getAll());
  }

  if (req.method === 'POST') {
    const title = (req.body?.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    return res.status(201).json(create(title));
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
}
