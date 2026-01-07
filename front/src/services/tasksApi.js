const API_URL = 'http://localhost:4000/tasks'

export const getTasks = async () => {
  const res = await fetch(API_URL)
  return res.json()
}

export const createTask = async (task) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
  return res.json()
}

export const deleteTask = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  })
}

export const updateTask = async (id, data) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}
