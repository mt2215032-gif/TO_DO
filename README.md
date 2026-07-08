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
