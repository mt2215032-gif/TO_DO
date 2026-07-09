import { randomUUID } from 'node:crypto';

let tasks = [
  { id: randomUUID(), title: 'Welcome to your To-Do app', completed: false, createdAt: Date.now() },
  { id: randomUUID(), title: 'Click the checkbox to complete a task', completed: false, createdAt: Date.now() },
  { id: randomUUID(), title: 'Try editing or deleting this task', completed: true, createdAt: Date.now() },
];

export function getAll() {
  return [...tasks].sort((a, b) => a.createdAt - b.createdAt);
}

export function getById(id) {
  return tasks.find((task) => task.id === id);
}

export function create(title) {
  const task = { id: randomUUID(), title, completed: false, createdAt: Date.now() };
  tasks.push(task);
  return task;
}

export function update(id, changes) {
  const task = getById(id);
  if (!task) return null;
  if (typeof changes.title === 'string') task.title = changes.title;
  if (typeof changes.completed === 'boolean') task.completed = changes.completed;
  return task;
}

export function remove(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
}
