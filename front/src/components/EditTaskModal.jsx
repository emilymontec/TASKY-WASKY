import { useState, useEffect } from 'react'

export default function EditTaskModal({ task, onUpdate, onClose }) {
  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState(task.due_date || '')

  useEffect(() => {
    setTitle(task.title || '')
    setDescription(task.description || '')
    setDueDate(task.due_date || '')
  }, [task])

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onUpdate(task.id, { title, description, due_date: dueDate || null })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Editar Tarea</h2>
        <form className="task-form" onSubmit={submit}>
          <div className="form-group">
            <label>Título:</label>
            <input
              placeholder="Título de la tarea"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Fecha de vencimiento:</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  )
}