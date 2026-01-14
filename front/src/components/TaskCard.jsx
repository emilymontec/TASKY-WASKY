import { useEffect, useState, useRef } from 'react'
import { updateTask } from '../services/tasksApi'

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
  const [position, setPosition] = useState(() => ({
    top: task.position?.top ?? Math.random() * 350,
    left: task.position?.left ?? Math.random() * 1350
  }));
  const velocityRef = useRef();
  
  // Estado para drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cornerZone, setCornerZone] = useState(null); // detecta esquina
  const cardRef = useRef(null);

  // Handlers para drag & drop
  const handleMouseDown = (e) => {
    if (isCompleted || isDragging) return;

    const rect = cardRef.current.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  // Handler para doble click - completar tarea
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onToggle(task);
  };

  // Función para posponer según la esquina
  const postponeTask = (corner) => {
    const currentDate = task.due_date ? new Date(task.due_date + 'T00:00:00') : new Date();
    currentDate.setHours(0, 0, 0, 0);
    let daysToAdd = 0;

    switch (corner) {
      case 'top-left':
        daysToAdd = 1; // +1 día
        break;
      case 'top-right':
        daysToAdd = 3; // +3 días
        break;
      case 'bottom-left':
        daysToAdd = 7; // +1 semana
        break;
      case 'bottom-right':
        daysToAdd = 30; // +1 mes
        break;
      default:
        return;
    }

    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + daysToAdd);
    const dateString = newDate.toISOString().split('T')[0];

    return dateString;
  };

  // Detectar qué esquina está más cerca
  const detectCorner = (x, y, boardWidth, boardHeight) => {
    const threshold = 100; // píxeles desde la esquina para activar
    const distances = {
      'top-left': Math.sqrt(x * x + y * y),
      'top-right': Math.sqrt((boardWidth - x) ** 2 + y * y),
      'bottom-left': Math.sqrt(x * x + (boardHeight - y) ** 2),
      'bottom-right': Math.sqrt((boardWidth - x) ** 2 + (boardHeight - y) ** 2)
    };
    
    const nearest = Object.entries(distances).reduce((min, [corner, dist]) => 
      dist < min.dist ? { corner, dist } : min, 
      { corner: null, dist: Infinity }
    );
    
    return nearest.dist <= threshold ? nearest.corner : null;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const boardRect = cardRef.current.parentElement.getBoundingClientRect();
      let newLeft = e.clientX - boardRect.left - dragOffset.x;
      let newTop = e.clientY - boardRect.top - dragOffset.y;

      // Mantener dentro del tablero
      newLeft = Math.max(0, Math.min(newLeft, boardRect.width - 250));
      newTop = Math.max(0, Math.min(newTop, boardRect.height - 80));

      setPosition({
        top: newTop,
        left: newLeft
      });

      // Detectar esquina
      const corner = detectCorner(newLeft, newTop, boardRect.width - 250, boardRect.height - 80);
      setCornerZone(corner);
    };

    const handleMouseUp = async () => {
      setIsDragging(false);
      
      // Si se suelta en una esquina, posponer la tarea
      if (cornerZone) {
        const newDueDate = postponeTask(cornerZone);
        if (newDueDate) {
          await updateTask(task.id, {
            due_date: newDueDate,
            position: {
              top: Math.round(position.top),
              left: Math.round(position.left)
            }
          });
        }
      } else {
        // Guardar la posición en la base de datos
        if (position.top !== null && position.left !== null) {
          await updateTask(task.id, {
            position: {
              top: Math.round(position.top),
              left: Math.round(position.left)
            }
          });
        }
      }
      
      setCornerZone(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, position, task.id, cornerZone, postponeTask]);

  useEffect(() => {
    if (isCompleted || isDragging) return; // tareas completadas no se mueven y tampoco mientras se arrastra

    // inicializar velocidad si no está
    if (!velocityRef.current) {
      velocityRef.current = {
        x: (Math.random() - 0.5) * speed * 2,
        y: (Math.random() - 0.5) * speed * 2
      };
    }

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

        // rebote en bordes (ahora envuelve alrededor del tablero)
        if (newX < 0) { // izquierda
          newX += 1350;
        }
        if (newX > 1350) { // derecha
          newX -= 1350;
        }
        if (newY < 0) { // arriba
          newY += 350;
        }
        if (newY > 350) { // abajo
          newY -= 350;
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
  }, [speed, isCompleted, personality, isDragging]);

  return ( // diseño de tarjeta de tarea
    <div
      ref={cardRef}
      className={`task-card
        ${isCompleted ? 'completed' : ''}
        ${isOverdue ? 'overdue' : ''}
        ${isDueSoon ? 'due-soon' : ''}
        ${personality}
        ${isDragging ? 'dragging' : ''}
      `}
      style={{
        top: position.top + 'px',
        left: position.left + 'px',
        cursor: isCompleted ? 'default' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
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