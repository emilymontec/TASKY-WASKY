import { useEffect, useState, useRef } from 'react'

export default function TaskCard({ task, onDelete, onToggle, onEdit }) { // funciones de la tarjeta
  
  const formattedDate = task.created_at // fecha de creacion
    ? new Date(task.created_at).toLocaleDateString()
    : '—'

  const isCompleted = task.status?.toLowerCase() === 'completed' // estado de tarea

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let daysLeft = null // fecha de vencimiento

  if (task.due_date) { // calcula cuántos dias faltan desde hoy hasta la fecha de vencimiento
    const dueDate = new Date(task.due_date + 'T00:00:00')
    dueDate.setHours(0, 0, 0, 0)

    daysLeft = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  }

  const isOverdue = !isCompleted && daysLeft !== null && daysLeft < 0 // tarea vencida

  const isDueSoon = // tarea por vencer pronto (dentro de 2 dias)
    !isCompleted &&
    daysLeft !== null &&
    daysLeft >= 0 &&
    daysLeft <= 2
// personalidad de tareas basada en urgencia
  let personality = 'calm'
  if (isDueSoon) personality = 'energetic'

  const personalityIcons = {
    calm: '🤗',
    energetic: '😨',
    lazy: '😴'
  }

  // Movimiento constante de las tarjetas
  const speed = personality === 'energetic' ? 3 : 1; // velocidad basada en personalidad
  const [position, setPosition] = useState({
    top: Math.random() * 350,
    left: Math.random() * 1350
  });
  const velocityRef = useRef({
    x: (Math.random() - 0.5) * speed * 2,
    y: (Math.random() - 0.5) * speed * 2
  });

  useEffect(() => {
    if (isCompleted) return; // tareas completadas no se mueven

    // intervalo para cambiar direccion de movimiento
    const directionIntervalTime = personality === 'energetic' ? 2000 : 5000;

    const changeDirection = () => {
      velocityRef.current = {
        x: (Math.random() - 0.5) * speed * 2,
        y: (Math.random() - 0.5) * speed * 2
      };
    };

    const directionInterval = setInterval(changeDirection, directionIntervalTime);

    // animacion continua usando requestAnimationFrame
    let animationId;
    const animate = () => {
      setPosition(prev => {
        let newX = prev.left + velocityRef.current.x;
        let newY = prev.top + velocityRef.current.y;

        // rebote en bordes
        if (newX < 0) { // izquierda
          velocityRef.current.x = -velocityRef.current.x;
          newX = -newX;
        }
        if (newX > 1350) { // derecha
          velocityRef.current.x = -velocityRef.current.x;
          newX = 2700 - newX;
        }
        if (newY < 0) { // arriba
          velocityRef.current.y = -velocityRef.current.y;
          newY = -newY;
        }
        if (newY > 350) { // abajo
          velocityRef.current.y = -velocityRef.current.y;
          newY = 700 - newY;
        }

        return { top: newY, left: newX };
      });
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearInterval(directionInterval);
      cancelAnimationFrame(animationId);
    };
  }, [speed, isCompleted]);

  return ( // diseño de tarjeta de tarea
    <div
      className={`task-card
        ${isCompleted ? 'completed' : ''}
        ${isOverdue ? 'overdue' : ''}
        ${isDueSoon ? 'due-soon' : ''}
        ${personality}
      `}
      style={{
        top: position.top + 'px',
        left: position.left + 'px'
      }}
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
        <button onClick={() => onEdit(task)}>✏️</button>
        <button onClick={() => onToggle(task)}>
          {isCompleted ? '↩️' : '✅'}
        </button>

        <button onClick={() => onDelete(task.id)}>❌</button>
      </div>
    </div>
  )
}
