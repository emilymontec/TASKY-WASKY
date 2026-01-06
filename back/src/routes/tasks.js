import express from "express";

export default function tasksRoutes(supabase) {
  const router = express.Router();

  // GET
  router.get("/", async (req, res) => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) return res.status(500).json(error);
    res.json(data);
  });

  // POST
  router.post("/", async (req, res) => {
    const { title, personality } = req.body;
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title, personality }])
      .select();

    if (error) return res.status(500).json(error);
    res.json(data[0]);
  });

  // PUT
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) return res.status(500).json(error);
    res.json(data[0]);
  });

  // DELETE
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) return res.status(500).json(error);
    res.json({ success: true });
  });

  return router;
}
