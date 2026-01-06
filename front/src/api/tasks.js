const API_URL = "http://localhost:3001/tasks";

// READ
export const getTasks = async () => {
  const res = await fetch(API_URL);
  return res.json();
};

// CREATE
export const createTask = async (title) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  return res.json();
};

// UPDATE
export const updateTask = async (id, updates) => {
  const res = await fetch(`http://localhost:3001/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
  return res.json();
};
// DELETE
export const deleteTask = async (id) => {
  await fetch(`http://localhost:3001/tasks/${id}`, {
    method: "DELETE"
  });
};
