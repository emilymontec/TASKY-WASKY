import { useEffect, useState } from "react";

// API
import {
  getTasks,
  createTask,
  updateTask
} from "./api/tasks";

// COMPONENTES
import World from "./components/World";
import TopBar from "./components/TopBar";
import AddTaskButton from "./components/AddTaskButton";

function App() {
  const [tasks, setTasks] = useState([]);

  // 🔄 Cargar tareas al iniciar
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (e) {
      console.error("Error cargando tareas", e);
    }
  };

  // ✅ Toggle completar / reactivar
  const toggleTask = async (task) => {
    try {
      const updated = await updateTask(task.id, {
        status: task.status === "done" ? "active" : "done"
      });

      setTasks(prev =>
        prev.map(t => (t.id === task.id ? updated : t))
      );
    } catch (e) {
      console.error("Error actualizando tarea", e);
    }
  };

  // ➕ Agregar tarea (FAB)
  const addTaskQuick = async () => {
    const title = prompt("Nueva tarea 👀");
    if (!title) return;

    try {
      const newTask = await createTask(title);
      setTasks(prev => [...prev, newTask]);
    } catch (e) {
      console.error("Error creando tarea", e);
    }
  };

  return (
    <>
      {/* HUD */}
      <TopBar tasks={tasks} />

      {/* MUNDO */}
      <World
        tasks={tasks.filter(t => t.status !== "hidden")}
        onToggle={toggleTask}
      />

      {/* BOTÓN FLOTANTE */}
      <AddTaskButton onAdd={addTaskQuick} />
    </>
  );
}

export default App;
