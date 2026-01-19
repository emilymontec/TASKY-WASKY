import { useState } from 'react'

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState({})

  const submit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // validar titulo
    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio'
    }

    // validar fecha
    if (!dueDate.trim()) {
      newErrors.dueDate = 'La fecha es obligatoria'
    }

    // si hay errores, mostrarlos
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // limpiar errores si todo es válido
    setErrors({})

    // creacion de tarea
    onCreate({ title, description, due_date: dueDate || null })
    setTitle('')
    setDescription('')
    setDueDate('')
  }

  return ( // diseño formulario
    <form className="task-form" onSubmit={submit}>
      <div className="form-group">
        <input
          placeholder="Nueva tarea"
          value={title}
          onChange={e => {
            setTitle(e.target.value)
            if (e.target.value.trim()) {
              setErrors(prev => ({ ...prev, title: '' }))
            }
          }}
          className={errors.title ? 'input-error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <div className="form-group">
        <input
          type="date"
          value={dueDate}
          onChange={e => {
            setDueDate(e.target.value)
            if (e.target.value.trim()) {
              setErrors(prev => ({ ...prev, dueDate: '' }))
            }
          }}
          className={errors.dueDate ? 'input-error' : ''}
        />
        {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
      </div>

      <button>+</button>
    </form>
  )
}
