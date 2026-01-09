export default function TaskCard({ task, onDelete, onToggle }) {
  const formattedDate = task.created_at
    ? new Date(task.created_at).toLocaleDateString()
    : '—'

  const isCompleted = task.status?.toLowerCase() === 'completed'

  // --- FECHAS NORMALIZADAS ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let daysLeft = null

  if (task.due_date) {
    const dueDate = new Date(task.due_date + 'T00:00:00')
    dueDate.setHours(0, 0, 0, 0)

    daysLeft = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const isOverdue = !isCompleted && daysLeft !== null && daysLeft < 0
  const isDueSoon =
    !isCompleted &&
    daysLeft !== null &&
    daysLeft >= 0 &&
    daysLeft <= 2

  let personality = 'calm'
  if (isOverdue) personality = 'lazy'
  else if (isDueSoon) personality = 'energetic'

  const personalityIcons = {
    calm: '🤗',
    energetic: '😨',
    lazy: '😴'
  }

  return (
    <div
      className={`task-card
        ${isCompleted ? 'completed' : ''}
        ${isOverdue ? 'overdue' : ''}
        ${isDueSoon ? 'due-soon' : ''}
        ${personality}
      `}
    >
      <div className="task-info">
        <div className="task-title">
          <strong>{task.title}</strong>
        </div>

        {task.description && (
          <div className="task-description">
            {task.description}
          </div>
        )}

        <div className="task-meta">
          <span>{task.status}</span> · <span>{formattedDate}</span>
          {task.due_date && (
            <>
              {' '}·{' '}
              <span>
                Fin: {new Date(task.due_date + 'T00:00:00').toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="task-status">{isCompleted ? '🤩' : personalityIcons[personality]}</div>

      <div className="task-actions">
        <button onClick={() => onToggle(task)}>
          {isCompleted ? '↩️' : '✅'}
        </button>

        <button onClick={() => onDelete(task.id)}>❌</button>
      </div>
    </div>
  )
}
