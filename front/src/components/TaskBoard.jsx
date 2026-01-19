import { useEffect, useState } from 'react' // importar hooks
// useState guarda las tareas en una lista
import { getTasks, createTask, deleteTask, updateTask } from '../services/tasksApi' // importar servicios (funciones)
import TaskCard from './TaskCard' // importar TaskCard (tarea individual)
import TaskForm from './TaskForm' // importar TaskForm (formulario)
import EditTaskModal from './EditTaskModal' // importar modal de edición

export default function TaskBoard() { // tablero de tareas
  const [tasks, setTasks] = useState([]) // estado inicial de tareas
  const [editingTask, setEditingTask] = useState(null) // tarea en edición
  const [filterDateFrom, setFilterDateFrom] = useState('') // filtro de fecha desde
  const [filterDateTo, setFilterDateTo] = useState('') // filtro de fecha hasta
  const [showFilter, setShowFilter] = useState(false) // mostrar/ocultar filtro

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

  // filtrar tareas por rango de fecha
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (!task.due_date) return true // si no tiene fecha, mostrar siempre

      const taskDate = new Date(task.due_date)
      
      // si hay fecha desde, verificar que la tarea sea >= a esa fecha
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom)
        if (taskDate < fromDate) return false
      }

      // si hay fecha hasta, verificar que la tarea sea <= a esa fecha
      if (filterDateTo) {
        const toDate = new Date(filterDateTo)
        if (taskDate > toDate) return false
      }

      return true
    })
  }

  const filteredTasks = getFilteredTasks()

  // limpiar filtros
  const clearFilters = () => {
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  return ( // diseño de tablero
    <div>
      <div className="stats">
        <div className="stat-item">🎯 Misiones Activas: {filteredTasks.filter(t => t.status !== 'Completed').length}</div>
        <div className="stat-item">✅ Completadas: {filteredTasks.filter(t => t.status === 'Completed').length}</div>
        <div className="stat-item">🏆 Progreso: {filteredTasks.length > 0 ? Math.round((filteredTasks.filter(t => t.status === 'Completed').length / filteredTasks.length) * 100) : 0}%</div>
      </div>
      
      {/* Botón de filtro */}
      <div className="filter-header">
        <button 
          className={`filter-toggle-btn ${showFilter ? 'active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
          title={showFilter ? 'Ocultar filtros' : 'Mostrar filtros'}
        >
          ⚙️ Filtros
        </button>
      </div>

      <TaskForm onCreate={handleCreate} />

      {/* Modal de filtro */}
      {showFilter && (
        <div className="filter-modal-overlay" onClick={() => setShowFilter(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3>Filtrar por fecha</h3>
              <button className="filter-modal-close" onClick={() => setShowFilter(false)}>✕</button>
            </div>
            
            <div className="filter-modal-content">
              <div className="filter-group">
                <label htmlFor="filter-from">Desde:</label>
                <input
                  id="filter-from"
                  type="date"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="filter-to">Hasta:</label>
                <input
                  id="filter-to"
                  type="date"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-modal-actions">
              {(filterDateFrom || filterDateTo) && (
                <button className="clear-filter-btn" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
              <button className="filter-apply-btn" onClick={() => setShowFilter(false)}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="floating-board">
        {filteredTasks.map(task => (
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