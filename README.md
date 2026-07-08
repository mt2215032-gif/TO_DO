# To-Do App

A full-stack to-do application with a React frontend and an Express backend.

## Features

- Add, edit, delete, and mark tasks as complete
- Filter by all / active / completed
- Clean, modern UI

## Project Structure

```
TO_DO/
├── backend/    Express API (in-memory storage)
└── frontend/   React app (Vite)
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm start        # runs on http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev       # runs on http://localhost:5173
```

The frontend dev server proxies `/api` requests to the backend, so run both at the same time.

## API Endpoints

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/tasks`       | List all tasks             |
| POST   | `/api/tasks`       | Create a task (`{ title }`)|
| PATCH  | `/api/tasks/:id`   | Update a task's title/completed status |
| DELETE | `/api/tasks/:id`   | Delete a task              |

## Deploying to Vercel

The repo ships with a root `vercel.json` that builds both halves of the app into one Vercel project:

- `backend/server.js` is built with `@vercel/node` and exported as a serverless function (requests to `/api/*` are routed to it).
- `frontend/` is built with `@vercel/static-build` (`vite build` → `frontend/dist`) and served as the static site.

### Steps

1. Push this repo to GitHub (already done if you're reading this on the deployed branch).
2. In the [Vercel dashboard](https://vercel.com/new), import the repository. Leave **Root Directory** as the repo root — `vercel.json` handles the rest, no other project settings are required.
3. Deploy. Vercel will run `npm install` + `vite build` for the frontend and bundle `backend/server.js` as a function.

Or from the CLI, after `vercel login`:

```bash
vercel        # preview deploy
vercel --prod # production deploy
```

### Important caveat: in-memory storage

The backend stores tasks in a plain JS array (`backend/store.js`). That's fine for local dev, but on Vercel each API request may be served by a different, short-lived serverless instance — so **tasks can silently reset or fail to persist between requests**. This deployment is fine for demos/screenshots, but for real persistence you'd want to swap `store.js` for a real database (e.g. Vercel Postgres, Vercel KV, or any hosted DB) before relying on it day-to-day.
