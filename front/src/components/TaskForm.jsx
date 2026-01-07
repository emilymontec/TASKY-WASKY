import { useState } from 'react'

export default function TaskForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [personality, setPersonality] = useState('calm')

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onCreate({ title, description, personality })
    setTitle('')
    setDescription('')
  }

  return (
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
      
      <button>+</button>

      <select
      value={personality}
      onChange={e => setPersonality(e.target.value)}
      >
        <option value="calm">😌 Calm</option>
        <option value="energetic">⚡ Energetic</option>
        <option value="lazy">😴 Lazy</option>
        </select>

    </form>
  )
}
