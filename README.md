# To-Do App

A full-stack to-do application: a React (Vite) frontend and a Vercel serverless API, deployed as a single zero-config Vercel project.

## Features

- Add, edit, delete, and mark tasks as complete
- Filter by all / active / completed
- Clean, modern UI

## Project Structure

```
TO_DO/
├── api/            Serverless functions (Vercel Node runtime)
│   ├── _store.js       shared in-memory store (not a route — underscore-prefixed)
│   ├── health.js        GET  /api/health
│   └── tasks/
│       ├── index.js     GET/POST /api/tasks
│       └── [id].js      PATCH/DELETE /api/tasks/:id
├── src/            React app
├── index.html
└── vite.config.js
```

There's no separate backend server or `vercel.json` — Vercel auto-detects the Vite frontend and the `api/` functions by convention.

## Getting Started

```bash
npm install
npm run dev       # frontend only, http://localhost:5173 (no working API)
```

To run the frontend and API together locally exactly as they behave in production, use the Vercel CLI instead:

```bash
npm install -g vercel   # if you don't have it
vercel dev              # serves the app + /api/* on one port
```

## API Endpoints

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/tasks`       | List all tasks             |
| POST   | `/api/tasks`       | Create a task (`{ title }`)|
| PATCH  | `/api/tasks/:id`   | Update a task's title/completed status |
| DELETE | `/api/tasks/:id`   | Delete a task              |

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this on the deployed branch).
2. In the [Vercel dashboard](https://vercel.com/new), import the repository. No custom project settings are needed — Vercel detects Vite for the frontend and `api/*.js` as serverless functions automatically.
3. Deploy.

Or from the CLI, after `vercel login`:

```bash
vercel        # preview deploy
vercel --prod # production deploy
```

### Important caveat: in-memory storage

`api/_store.js` keeps tasks in a plain JS array. That's fine for local dev, but on Vercel each API request may be served by a different, short-lived serverless instance — so **tasks can silently reset or fail to persist between requests**. This is fine for demos/screenshots, but for real persistence you'd want to swap `_store.js` for a real database (e.g. Vercel Postgres, Vercel KV, or any hosted DB) before relying on it day-to-day.
