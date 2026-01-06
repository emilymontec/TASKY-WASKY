import "dotenv/config";
import express from "express";
import cors from "cors";
import tasksRoutes from "./routes/tasks.js";
import { supabase } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Tasky backend running...");
});

app.use("/tasks", tasksRoutes(supabase));

app.listen(3001, () => {
  console.log(`Server → http://localhost:3001`);
});
