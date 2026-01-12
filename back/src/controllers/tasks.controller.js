// importar instancia de supabase
import { supabase } from '../config/db.js'

// obtener tareas
export const getTasks = async (_, res) => { // res para responder y req para pedir
                                            // en este caso se coloca _ porque no necesitamos req
  const { data, error } = await supabase
    .from('tasks')
    .select('*')

  if (error) return res.status(500).json(error)
  res.json(data)
}

// crear tarea
export const createTask = async (req, res) => { // esta instancia si necesita req y res
  const { title, description, due_date } = req.body // toma los atributos de la bd
  // crear una fila
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title,
      description,
      due_date
    }])
    .select()

  if (error) return res.status(500).json(error)
  res.status(201).json(data[0])
}

// XXXXX actualizar tarea XXXXX ¡¡¡EDITAR!!!
export const updateTask = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('tasks')
    .update(req.body)
    .eq('id', id)
    .select()

  if (error) return res.status(500).json(error)
  res.json(data[0])
}

// eliminar tarea
export const deleteTask = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json(error)
  res.sendStatus(204)
}