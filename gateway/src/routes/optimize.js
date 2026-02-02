import { Router } from "express";
import { getPocketBase } from "../services/pocketbase.js";
import { solveVroom } from "../services/vroom.js";
import { buildVroomPayload, parseSolution } from "../mappers/taskToVroom.js";

export const optimizeRoutes = Router();

/**
 * POST /api/optimize
 * Fetches pending tasks + available staff, builds VROOM payload,
 * sends to VROOM, then updates sort_order & status in PocketBase.
 */
optimizeRoutes.post("/", async (req, res, next) => {
  try {
    const pb = getPocketBase();
    const clientId = req.client.id;

    // 1. Fetch pending tasks for this client
    const tasksResult = await pb.collection("tasks").getList(1, 500, {
      filter: `client_id="${clientId}" && (status="pending" || status="optimized")`,
    });

    if (tasksResult.items.length === 0) {
      return res.json({ message: "No tasks to optimize", routes: [] });
    }

    // 2. Fetch available staff
    const staffResult = await pb.collection("staff").getList(1, 100, {
      filter: "is_available=true",
    });

    if (staffResult.items.length === 0) {
      return res.status(400).json({ error: "No available staff" });
    }

    // 3. Build VROOM payload (The Switch: service → job, shipment → shipment)
    const vroomPayload = buildVroomPayload(tasksResult.items, staffResult.items);

    // 4. Call VROOM engine
    const vroomResult = await solveVroom(vroomPayload);

    // 5. Parse solution and update PocketBase
    const updates = parseSolution(vroomResult);

    const updatePromises = updates.map(({ taskId, staffId, sortOrder }) =>
      pb.collection("tasks").update(taskId, {
        sort_order: sortOrder,
        staff_id: staffId,
        status: "optimized",
      })
    );

    await Promise.all(updatePromises);

    // 6. Return result
    res.json({
      summary: vroomResult.summary,
      unassigned: vroomResult.unassigned || [],
      routes: updates,
      raw: vroomResult,
    });
  } catch (err) {
    next(err);
  }
});
