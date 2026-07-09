import express from 'express';
import cors from 'cors';
import { supabase } from './_supabase.js';

const app = express();

app.use(cors());
app.use(express.json());

// The tasks table uses `text`/`created_at`; the API keeps the frontend's
// existing `title`/`createdAt` shape so no frontend changes are needed.
function toApiShape(row) {
  return {
    id: row.id,
    title: row.text,
    completed: row.completed,
    createdAt: row.created_at,
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/tasks', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, text, completed, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(data.map(toApiShape));
  } catch (err) {
    next(err);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const title = (req.body?.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ text: title, completed: false }])
      .select('id, text, completed, created_at')
      .single();

    if (error) throw error;
    res.status(201).json(toApiShape(data));
  } catch (err) {
    next(err);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const { title, completed } = req.body || {};
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    const changes = {};
    if (title !== undefined) changes.text = title;
    if (completed !== undefined) changes.completed = completed;
    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(changes)
      .eq('id', req.params.id)
      .select('id, text, completed, created_at')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(toApiShape(data));
  } catch (err) {
    next(err);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Unmatched routes under /api
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler: malformed JSON bodies, Supabase errors, and
// anything an upstream handler throws land here instead of crashing the
// function.
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
