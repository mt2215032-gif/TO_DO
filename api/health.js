import { applyCors, handlePreflight } from './_cors.js';

export default function handler(req, res) {
  if (handlePreflight(req, res)) return;
  applyCors(req, res);
  res.status(200).json({ status: 'ok' });
}
