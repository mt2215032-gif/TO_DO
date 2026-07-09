import { useState } from 'react';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  function startEdit() {
    setDraft(task.title);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setDraft(task.title);
  }

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (trimmed !== task.title) {
      try {
        await onEdit(task.id, trimmed);
      } catch {
        return; // keep editing open; the failure is surfaced via the app-level error banner
      }
    }
    setIsEditing(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  return (
    <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
      <label className="task-item__checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, !task.completed).catch(() => {})}
        />
        <span className="task-item__checkmark" />
      </label>

      {isEditing ? (
        <input
          type="text"
          className="task-item__edit-input"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
        />
      ) : (
        <span className="task-item__title" onDoubleClick={startEdit}>
          {task.title}
        </span>
      )}

      <div className="task-item__actions">
        {isEditing ? (
          <button className="task-item__btn" onClick={saveEdit} aria-label="Save task">
            Save
          </button>
        ) : (
          <button className="task-item__btn" onClick={startEdit} aria-label="Edit task">
            Edit
          </button>
        )}
        <button
          className="task-item__btn task-item__btn--danger"
          onClick={() => onDelete(task.id).catch(() => {})}
          aria-label="Delete task"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
