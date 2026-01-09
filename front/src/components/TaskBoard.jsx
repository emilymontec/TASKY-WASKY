import { useEffect, useState } from 'react'
import { getTasks, createTask, deleteTask, updateTask } from '../services/tasksApi'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

export default function TaskBoard() {
  const [tasks, setTasks] = useState([])

  const loadTasks = async () => {
    const data = await getTasks()
    setTasks(data || [])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks()
  }, [])

  const handleCreate = async ({ title, description, due_date }) => {
    const newTask = await createTask({
      title,
      description,
      due_date,
      status: 'Pending'
    })
    setTasks(prev => [...prev, newTask])
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleToggleStatus = async (task) => {
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
  }

  return (
    <div>
      <TaskForm onCreate={handleCreate} />

      <div className="floating-board">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={handleDelete}
            onToggle={handleToggleStatus}
          />
        ))}
      </div>
    </div>
  )
}