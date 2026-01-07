export default function TaskCard({ task, onDelete, onToggle }) {
  const formattedDate = new Date(task.created_at).toLocaleDateString()

  const isCompleted = task.status?.toLowerCase() === 'completed'

  return (
    <div
      className={`task-card 
        ${isCompleted ? 'completed' : ''}
        ${task.personality || 'calm'}
      `}
    >
      <div className="task-title"><strong>{task.title}</strong>
      {task.description && (
        <div className="task-description">{task.description}</div>
        )}
        

        <div className="task-meta">
          <span>{task.status}</span> · <span>{formattedDate}</span>
        </div>
      </div>

      <div className="task-actions">
        <button onClick={() => onToggle(task)}>
          {isCompleted ? '↩️' : '✅'}
        </button>

        <button onClick={() => onDelete(task.id)}>❌</button>
      </div>
    </div>
  )
}
