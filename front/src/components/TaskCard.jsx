export default function TaskCard({ task, onDelete, onToggle }) {
  const formattedDate = new Date(task.created_at).toLocaleDateString()

  return (
    <div className={`task-card ${task.status?.toLowerCase() === 'completed' ? 'completed' : ''}`}>
      <div className="task-info">
        <strong>{task.title}</strong>

        {task.description && (
          <span>{task.description}</span>
        )}

        <div className="task-meta">
          <span>{task.status}</span> · <span>{formattedDate}</span>
        </div>
      </div>

      <div>
        <button onClick={() => onToggle(task)}>
          {task.status?.toLowerCase() === 'pending' ? '✅' : '↩️'}
        </button>

        <button onClick={() => onDelete(task.id)}>
          ❌
        </button>
      </div>
    </div>
  )
}
