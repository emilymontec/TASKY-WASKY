import { useEffect, useState } from 'react'
import { getTasks, createTask, deleteTask, updateTask } from '../services/tasksApi'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

export default function TaskBoard() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await getTasks()
    setTasks(data)
  }

  const handleCreate = async ({ title, description }) => {
    const newTask = await createTask({
      title,
      description,
      status: 'Pending'
    })
    setTasks([...tasks, newTask])
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  const handleToggleStatus = async (task) => {
  const updatedTask = await updateTask(task.id, {
    status: task.status === 'Pending' ? 'Completed' : 'Pending'
  })

  setTasks(tasks.map(t =>
    t.id === task.id ? updatedTask : t
  ))
}

  return (
    <div>
      <TaskForm onCreate={handleCreate} />

      <div className="task-list">
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
