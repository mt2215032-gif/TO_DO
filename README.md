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
│   ├── _supabase.js      Supabase client (reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)
│   └── index.js          Express app (all routes + error handling)
├── supabase/
│   └── schema.sql         run once in the Supabase SQL editor to create the tasks table
├── src/                 React app
├── index.html
├── vite.config.js
└── vercel.json          rewrites /api/:path* -> /api (routes every /api/* request to api/index.js)
```

The whole API is one Express app in `api/index.js`, exported as the default handler — Vercel runs an exported Express app directly as a serverless function. It's deliberately kept as a *single* function (not split into one file per route): Vercel bundles each API file as an independent function, and splitting routes across files caused real bugs earlier in this project. `vercel.json` only defines `rewrites` (not `builds`), so it doesn't disable Vercel's zero-config project detection.

Data is stored in Postgres via Supabase (see **Database setup** below) instead of in-memory, so it now survives cold starts and redeploys.

## Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) if you don't have one.
2. Open **SQL Editor** in the Supabase dashboard, paste in `supabase/schema.sql`, and run it. This creates the `tasks` table (`id bigint identity`, `text`, `completed`, `created_at`) with RLS enabled and no policies — the anon key gets no access, only the service role key (used server-side below) can reach it — and seeds the three starter tasks.
3. In **Settings -> API**, copy the **Project URL** and the **`service_role` secret key** (not the `anon` key — the server needs full access, and RLS blocks the anon key by design).
4. Set both as environment variables:
   - **Locally**: create a `.env` file (see `.env.example`) with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
   - **On Vercel**: add the same two variables in Project Settings -> Environment Variables, then redeploy.

`SUPABASE_SERVICE_ROLE_KEY` is a secret with full table access — never prefix it with `VITE_` (that would ship it to the browser) and never commit a `.env` file containing it (`.gitignore` already excludes `.env`).

## Getting Started

```bash
npm install
npm run dev       # frontend only, http://localhost:5173 (no working API)
```

To run the API locally (after completing **Database setup** above):

```bash
node api/index.js   # http://localhost:4000 — app.listen only runs when NOT on Vercel
                     # requires SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY to be set in your shell
```

Then point the frontend at it with `VITE_API_URL=http://localhost:4000` (see `.env.example`), or use the Vercel CLI to run both together on one port exactly as in production (it also loads `.env` automatically, for both the frontend and the API):

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

- Invalid input (empty title, empty title on rename, no fields on update) → `400`
- Updating/deleting an ID that doesn't exist → `404` (checked via Supabase's `.maybeSingle()`, not by parsing PostgREST error codes)
- Any other unmatched route under `/api` → `404`
- Malformed JSON request body, a Supabase/network error, or anything else thrown inside a route handler → caught by a centralized Express error-handling middleware and returned as a clean `400`/`500` JSON response instead of crashing the function. Verified this directly: pointed the API at an unreachable Supabase URL and confirmed requests fail with a clean `500` while the server stays up and `/api/health` keeps responding.
- Missing `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` fails fast with a clear startup error instead of a cryptic one at request time.

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

### Storage

Tasks are stored in Postgres via Supabase (`supabase/schema.sql`), not in-memory — data now survives cold starts, redeploys, and traffic spikes. See **Database setup** above for the one-time setup. Both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be set wherever the API runs (locally and on Vercel) or every request will fail with a clear startup error.
