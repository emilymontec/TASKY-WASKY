import { supabase } from '../config/db.js'

export const getTasks = async (_, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')

  if (error) return res.status(500).json(error)
  res.json(data)
}

export const createTask = async (req, res) => {
  const { title, description, personality, pos_x, pos_y } = req.body

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title,
      description
    }])
    .select()

  if (error) return res.status(500).json(error)
  res.status(201).json(data[0])
}

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

export const deleteTask = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) return res.status(500).json(error)
  res.sendStatus(204)
}