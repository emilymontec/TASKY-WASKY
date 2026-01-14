import "dotenv/config";
import express from "express";
import cors from "cors";
import tasksRoutes from './routes/tasks.routes.js'

const app = express();

app.use(cors());
app.use(express.json());

// Middleware de logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.get("/", (_, res) => {
  res.json("Tasky backend running...");
});

app.use('/tasks', tasksRoutes)

app.listen(4000, () => {
  console.log("Server → http://localhost:4000");
});
