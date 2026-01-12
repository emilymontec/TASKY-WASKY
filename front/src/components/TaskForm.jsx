import { useState } from 'react'

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')

  const submit = (e) => {
    e.preventDefault() // evita que el navegador recargue la pagina al enviar el formulario
    if (!title.trim()) return // no crear tarea si el título está vacio
// creacion de tarea
    onCreate({ title, description, due_date: dueDate || null })
    setTitle('')
    setDescription('')
    setDueDate('')
  }

  return ( // diseño formulario
    <form className="task-form" onSubmit={submit}>
      <input
        placeholder="Nueva tarea"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      
      <input
      type="date"
      value={dueDate}
      onChange={e => setDueDate(e.target.value)}
      />

      <button>+</button>
      
    </form>
  )
}
