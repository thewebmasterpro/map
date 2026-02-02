/// <reference path="../pb_data/types.d.ts" />

// Hook: Auto-set status to "pending" on task creation
onRecordBeforeCreateRequest((e) => {
  if (!e.record.get("status")) {
    e.record.set("status", "pending");
  }
}, "tasks");

// Hook: Set completed_at timestamp when task is marked completed
onRecordBeforeUpdateRequest((e) => {
  const oldStatus = e.record.originalCopy().get("status");
  const newStatus = e.record.get("status");

  if (oldStatus !== "completed" && newStatus === "completed") {
    e.record.set("completed_at", new Date().toISOString());
  }
}, "tasks");

// Hook: Validate task data based on type
onRecordBeforeCreateRequest((e) => {
  const type = e.record.get("type");
  const data = e.record.get("data");

  if (type === "service") {
    if (!data.location || !data.duration) {
      throw new BadRequestError(
        "Service tasks require data.location {lat, lng} and data.duration (seconds)"
      );
    }
  }

  if (type === "shipment") {
    if (!data.pickup_lat || !data.pickup_lng || !data.delivery_lat || !data.delivery_lng) {
      throw new BadRequestError(
        "Shipment tasks require data.pickup_lat, pickup_lng, delivery_lat, delivery_lng"
      );
    }
  }
}, "tasks");
