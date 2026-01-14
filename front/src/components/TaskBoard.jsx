import { useEffect, useState } from 'react' // importar hooks
// useState guarda las tareas en una lista
import { getTasks, createTask, deleteTask, updateTask } from '../services/tasksApi' // importar servicios (funciones)
import TaskCard from './TaskCard' // importar TaskCard (tarea individual)
import TaskForm from './TaskForm' // importar TaskForm (formulario)
import EditTaskModal from './EditTaskModal' // importar modal de edición

export default function TaskBoard() { // tablero de tareas
  const [tasks, setTasks] = useState([]) // estado inicial de tareas
  const [editingTask, setEditingTask] = useState(null) // tarea en edición

  const loadTasks = async () => { // cargar tareas
    try {
      const data = await getTasks() // obtener tareas desde el servicio
      setTasks(data || [])
    } catch (error) {
      console.error('Error cargando tareas:', error)
      setTasks([])
    }
  }

  useEffect(() => {
    loadTasks() // mostrar tareas al cargar el componente
  }, [])

  // crear tarea
  const handleCreate = async ({ title, description, due_date }) => {
    try {
      const newTask = await createTask({
        title,
        description,
        due_date,
        status: 'Pending'
      })
      if (newTask) {
        setTasks(prev => [...prev, newTask]) // agregar tarea a la lista
      }
    } catch (error) {
      console.error('Error creando tarea:', error)
      alert('Error al crear la tarea')
    }
  }

  // eliminar tarea
  const handleDelete = async (id) => {
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error eliminando tarea:', error)
      alert('Error al eliminar la tarea')
    }
  }

  // cambiar estado
  const handleToggleStatus = async (task) => {
    try {
      const newStatus =
        task.status?.toLowerCase() === 'pending'
          ? 'Completed'
          : 'Pending'

      const updated = await updateTask(task.id, {
        status: newStatus
      })

      setTasks(prev =>
        prev.map(t => (t.id === task.id ? updated : t))
      )
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error al actualizar el estado')
    }
  }

  // editar tarea
  const handleEdit = (task) => {
    setEditingTask(task)
  }

  // actualizar tarea
  const handleUpdate = async (id, data) => {
    try {
      const updated = await updateTask(id, data)
      setTasks(prev =>
        prev.map(t => (t.id === id ? updated : t))
      )
      setEditingTask(null)
    } catch (error) {
      console.error('Error actualizando tarea:', error)
      alert('Error al actualizar la tarea')
    }
  }

  return ( // diseño de tablero
    <div>
      <div className="stats">
        <div className="stat-item">🎯 Misiones Activas: {tasks.filter(t => t.status !== 'Completed').length}</div>
        <div className="stat-item">✅ Completadas: {tasks.filter(t => t.status === 'Completed').length}</div>
        <div className="stat-item">🏆 Progreso: {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}%</div>
      </div>
      <TaskForm onCreate={handleCreate} />

      <div className="floating-board">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onToggle={handleToggleStatus}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onUpdate={handleUpdate}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}