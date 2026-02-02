import { Router } from "express";
import { getPocketBase } from "../services/pocketbase.js";

export const tasksRouter = Router();

// GET /api/tasks - List tasks for the authenticated client
tasksRouter.get("/", async (req, res, next) => {
  try {
    const pb = getPocketBase();
    const { page = 1, perPage = 50, status, type } = req.query;

    let filter = `client_id="${req.client.id}"`;
    if (status) filter += ` && status="${status}"`;
    if (type) filter += ` && type="${type}"`;

    const result = await pb.collection("tasks").getList(Number(page), Number(perPage), {
      filter,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks - Create a new task
tasksRouter.post("/", async (req, res, next) => {
  try {
    const pb = getPocketBase();
    const record = await pb.collection("tasks").create({
      ...req.body,
      client_id: req.client.id,
      status: "pending",
    });

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id - Update task status
tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const pb = getPocketBase();

    // Verify task belongs to client
    const existing = await pb.collection("tasks").getOne(req.params.id);
    if (existing.client_id !== req.client.id) {
      return res.status(403).json({ error: "Not your task" });
    }

    const record = await pb.collection("tasks").update(req.params.id, req.body);
    res.json(record);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id
tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const pb = getPocketBase();

    const existing = await pb.collection("tasks").getOne(req.params.id);
    if (existing.client_id !== req.client.id) {
      return res.status(403).json({ error: "Not your task" });
    }

    await pb.collection("tasks").delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
