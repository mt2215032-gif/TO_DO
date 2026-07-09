# To-Do App

A full-stack to-do application: a React (Vite) frontend and an Express API, deployed together as a single zero-config Vercel project.

## Features

- Add, edit, delete, and mark tasks as complete
- Filter by all / active / completed
- Clean, modern UI

## Project Structure

```
TO_DO/
├── api/
│   ├── _store.js        shared in-memory store (not a route — underscore-prefixed)
│   └── index.js          Express app (all routes + error handling)
├── src/                 React app
├── index.html
├── vite.config.js
└── vercel.json          rewrites /api/:path* -> /api (routes every /api/* request to api/index.js)
```

The whole API is one Express app in `api/index.js`, exported as the default handler — Vercel runs an exported Express app directly as a serverless function. It's deliberately kept as a *single* function (not split into one file per route): Vercel bundles each API file as an independent function with its own module state, so if routes lived in separate files they'd each get a separate copy of the in-memory store — a task you just created or loaded would 404 when you tried to update or delete it. `vercel.json` only defines `rewrites` (not `builds`), so it doesn't disable Vercel's zero-config project detection.

## Getting Started

```bash
npm install
npm run dev       # frontend only, http://localhost:5173 (no working API)
```

To run the API locally:

```bash
node api/index.js   # http://localhost:4000 — app.listen only runs when NOT on Vercel
```

Then point the frontend at it with `VITE_API_URL=http://localhost:4000` (see `.env.example`), or use the Vercel CLI to run both together on one port exactly as in production:

```bash
npm install -g vercel   # if you don't have it
vercel dev
```

## API Endpoints

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/health`      | Health check                |
| GET    | `/api/tasks`       | List all tasks             |
| POST   | `/api/tasks`       | Create a task (`{ title }`)|
| PUT    | `/api/tasks/:id`   | Update a task — toggle `completed` and/or edit `title` |
| DELETE | `/api/tasks/:id`   | Delete a task              |

### Error handling

- Invalid input (empty title, empty title on rename) → `400`
- Updating/deleting an ID that doesn't exist → `404`
- Any other unmatched route under `/api` → `404`
- Malformed JSON request body, or anything thrown inside a route handler → caught by a centralized Express error-handling middleware and returned as a clean `400`/`500` JSON response instead of crashing the function

## Frontend → API wiring

`src/api.js` is the only place that talks to the network (`fetch`, no extra HTTP client needed for an app this size). It reads the API's base URL from `VITE_API_URL` (see `.env.example`) — leave it unset for same-origin requests (correct for a normal Vercel deploy or `vercel dev`); set it only if the frontend and API are ever hosted on different origins. Because of that, the Express app also has `cors()` enabled.

- `TaskForm` calls `createTask()` → `POST /api/tasks`.
- `TaskList`/`App` load tasks via `fetchTasks()` → `GET /api/tasks`, with a loading state while the initial fetch is in flight, and a dedicated error state with a **Retry** button if it fails.
- Checking a task off calls `toggleTask()` → `PUT /api/tasks/:id` with `{ completed }`; renaming calls `updateTask()` → `PUT /api/tasks/:id` with `{ title }`; both live in `App.jsx`'s `handleToggle`/`handleEdit`.
- Deleting calls `deleteTask()` → `DELETE /api/tasks/:id`.
- Every mutation (`handleAdd`/`handleToggle`/`handleEdit`/`handleDelete` in `App.jsx`) is wrapped in `try/catch`: on failure it shows a dismissible error banner *and* rethrows, so `TaskForm` keeps your typed text instead of clearing it, and `TaskItem` stays in edit mode instead of silently discarding your edit.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this on the deployed branch).
2. In the [Vercel dashboard](https://vercel.com/new), import the repository. No custom project settings are needed — Vercel detects Vite for the frontend and `api/index.js` as a serverless function automatically.
3. Deploy.

Or from the CLI, after `vercel login`:

```bash
vercel        # preview deploy
vercel --prod # production deploy
```

### Important caveat: in-memory storage

`api/_store.js` keeps tasks in a plain JS array. That's fine for local dev, and since the whole API is one function instance, it also works reliably within a single warm session in production. But **a cold start (the function spinning up fresh, e.g. after a period of inactivity or during a traffic spike) resets the store back to the three seed tasks**. This is fine for demos/screenshots, but for real persistence you'd want to swap `_store.js` for a real database (e.g. Vercel Postgres, Vercel KV, or any hosted DB) before relying on it day-to-day.
