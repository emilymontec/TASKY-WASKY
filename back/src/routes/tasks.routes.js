// rutas para las tareas
import { Router } from 'express'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js'

const router = Router() // crear router

// definir rutas y sus controladores
router.get('/', getTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

// exportar router
export default router
