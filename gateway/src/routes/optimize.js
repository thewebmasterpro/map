import { Router } from "express";
import { getPocketBase } from "../services/pocketbase.js";
import { solveVroom } from "../services/vroom.js";
import { buildVroomPayload, parseSolution } from "../mappers/taskToVroom.js";
import { expensiveLimiter } from "../middleware/rateLimiter.js";
import { log } from "../utils/logger.js";

export const optimizeRoutes = Router();

/**
 * POST /api/optimize
 * Fetches pending tasks + available staff, builds VROOM payload,
 * sends to VROOM, then updates sort_order & status in PocketBase.
 */
optimizeRoutes.post("/", expensiveLimiter, async (req, res, next) => {
  try {
    const pb = getPocketBase();
    const clientId = req.client.id;

    log.optimize('Starting optimization', { clientId });

    // 1. Fetch pending tasks for this client
    const tasksResult = await pb.collection("tasks").getList(1, 500, {
      filter: `client_id="${clientId}" && (status="pending" || status="optimized")`,
    });

    if (tasksResult.items.length === 0) {
      log.optimize('No tasks to optimize', { clientId });
      return res.json({ message: "No tasks to optimize", routes: [] });
    }

    // 2. Fetch available staff
    const staffResult = await pb.collection("staff").getList(1, 100, {
      filter: "is_available=true",
    });

    if (staffResult.items.length === 0) {
      log.warn('No available staff for optimization', { clientId });
      return res.status(400).json({ error: "No available staff" });
    }

    // 3. Build VROOM payload (The Switch: service → job, shipment → shipment)
    const vroomPayload = buildVroomPayload(tasksResult.items, staffResult.items);

    log.optimize('Calling VROOM engine', {
      vehicles: vroomPayload.vehicles.length,
      jobs: vroomPayload.jobs.length,
      shipments: vroomPayload.shipments.length,
      clientId,
    });

    // 4. Call VROOM engine
    let vroomResult;
    try {
      vroomResult = await solveVroom(vroomPayload);
    } catch (err) {
      log.error('VROOM engine error', {
        error: err.message,
        clientId,
      });
      throw new Error('Optimization service temporarily unavailable');
    }

    // 5. Parse solution and update PocketBase
    const updates = parseSolution(vroomResult);

    log.optimize('Updating task assignments', {
      updateCount: updates.length,
      clientId,
    });

    const updatePromises = updates.map(({ taskId, staffId, sortOrder }) =>
      pb.collection("tasks").update(taskId, {
        sort_order: sortOrder,
        staff_id: staffId,
        status: "optimized",
      })
    );

    await Promise.all(updatePromises);

    log.optimize('Optimization completed successfully', {
      optimizedTasks: updates.length,
      unassignedTasks: vroomResult.unassigned?.length || 0,
      clientId,
    });

    // 6. Return result (excluding raw VROOM data in production)
    const response = {
      summary: vroomResult.summary,
      unassigned: vroomResult.unassigned || [],
      routes: updates,
    };

    // Only include raw data in development
    if (process.env.NODE_ENV === 'development') {
      response.raw = vroomResult;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});
