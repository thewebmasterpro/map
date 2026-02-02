import { Router } from "express";
import { getPocketBase } from "../services/pocketbase.js";

export const staffRouter = Router();

// GET /api/staff - List available staff
staffRouter.get("/", async (req, res, next) => {
  try {
    const pb = getPocketBase();
    const result = await pb.collection("staff").getList(1, 100, {
      filter: "is_available=true",
      sort: "name",
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/staff/:id/location - Update staff GPS location
staffRouter.patch("/:id/location", async (req, res, next) => {
  try {
    const pb = getPocketBase();
    const { lat, lng } = req.body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "lat and lng must be numbers" });
    }

    const record = await pb.collection("staff").update(req.params.id, {
      current_location: { lat, lng },
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
});
