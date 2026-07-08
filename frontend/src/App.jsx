import { useEffect, useMemo, useState } from 'react';
import TaskForm from './components/TaskForm.jsx';
import TaskList from './components/TaskList.jsx';
import * as api from './api.js';

const FILTERS = {
  all: () => true,
  active: (task) => !task.completed,
  completed: (task) => task.completed,
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .fetchTasks()
      .then(setTasks)
      .catch(() => setError('Could not load tasks. Is the API running?'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(title) {
    const task = await api.createTask(title);
    setTasks((prev) => [...prev, task]);
  }

  async function handleToggle(id, completed) {
    const updated = await api.updateTask(id, { completed });
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
  }

  async function handleEdit(id, title) {
    const updated = await api.updateTask(id, { title });
    setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
  }

  async function handleDelete(id) {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  const visibleTasks = useMemo(() => tasks.filter(FILTERS[filter]), [tasks, filter]);
  const remaining = useMemo(() => tasks.filter((task) => !task.completed).length, [tasks]);

  return (
    <div className="app">
      <div className="app__card">
        <header className="app__header">
          <h1>My Tasks</h1>
          <p className="app__subtitle">Stay on top of what matters today.</p>
        </header>

        <TaskForm onAdd={handleAdd} />

        {error && <p className="app__error">{error}</p>}

        <div className="app__toolbar">
          <div className="app__filters">
            {Object.keys(FILTERS).map((key) => (
              <button
                key={key}
                className={`app__filter-btn ${filter === key ? 'app__filter-btn--active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <span className="app__count">{remaining} remaining</span>
        </div>

        {loading ? (
          <p className="app__loading">Loading tasks...</p>
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
