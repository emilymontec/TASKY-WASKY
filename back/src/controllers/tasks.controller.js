// importar instancia de supabase
import { supabase } from '../config/db.js'

// obtener tareas
export const getTasks = async (_, res) => {
  // res para responder y req para pedir
  // en este caso se coloca _ porque no necesitamos req
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')

    if (error) {
      console.error('Error en Supabase getTasks:', error)
      return res.status(500).json({ error: error.message })
    }
    res.json(data)
  } catch (err) {
    console.error('Error en getTasks:', err)
    res.status(500).json({ error: err.message })
  }
}

// crear tarea
export const createTask = async (req, res) => {
  // esta instancia si necesita req y res
  try {
    const { title, description, due_date, status } = req.body // toma los atributos de la bd

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' })
    }

    console.log('Creando tarea:', { title, description, due_date, status })

    // crear una fila
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        description,
        due_date,
        status
      }])
      .select()

    if (error) {
      console.error('Error en Supabase createTask:', error)
      return res.status(500).json({ error: error.message })
    }

    console.log('Tarea creada:', data[0])
    res.status(201).json(data[0])
  } catch (err) {
    console.error('Error en createTask:', err)
    res.status(500).json({ error: err.message })
  }
}

// actualizar tarea
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('tasks')
      .update(req.body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error en Supabase updateTask:', error)
      return res.status(500).json({ error: error.message })
    }
    res.json(data[0])
  } catch (err) {
    console.error('Error en updateTask:', err)
    res.status(500).json({ error: err.message })
  }
}

// eliminar tarea
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error en Supabase deleteTask:', error)
      return res.status(500).json({ error: error.message })
    }
    res.sendStatus(204)
  } catch (err) {
    console.error('Error en deleteTask:', err)
    res.status(500).json({ error: err.message })
  }
}