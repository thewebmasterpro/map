/**
 * Maps PocketBase tasks into VROOM-compatible objects.
 *
 * The "Switch":
 *  - type === "service"  → VROOM `job`     (1 location, 1 duration)
 *  - type === "shipment" → VROOM `shipment` (pickup + delivery locations)
 */

/**
 * Map a single service-type task to a VROOM job.
 */
function mapServiceToJob(task, index) {
  const { data } = task;
  return {
    id: index + 1,
    description: `task:${task.id}`,
    location: [data.location.lng, data.location.lat],
    service: data.duration || 300, // default 5 min
    skills: data.skills || [],
  };
}

/**
 * Map a single shipment-type task to a VROOM shipment.
 */
function mapShipmentToVroom(task, index) {
  const { data } = task;
  return {
    amount: [data.weight || 1],
    skills: data.skills || [],
    pickup: {
      id: index + 1,
      description: `pickup:${task.id}`,
      location: [data.pickup_lng, data.pickup_lat],
      service: data.pickup_duration || 120,
    },
    delivery: {
      id: index + 1,
      description: `delivery:${task.id}`,
      location: [data.delivery_lng, data.delivery_lat],
      service: data.delivery_duration || 120,
    },
  };
}

/**
 * Map staff members to VROOM vehicles.
 */
function mapStaffToVehicles(staffList) {
  return staffList.map((member, index) => ({
    id: index + 1,
    description: `staff:${member.id}`,
    start: [member.start_location.lng, member.start_location.lat],
    end: [member.start_location.lng, member.start_location.lat],
    capacity: [member.capacity?.weight || 100],
    skills: member.skills || [],
  }));
}

/**
 * Build a complete VROOM payload from tasks and staff.
 * @param {Array} tasks - PocketBase task records
 * @param {Array} staff - PocketBase staff records
 * @returns {object} VROOM-compatible request body
 */
export function buildVroomPayload(tasks, staff) {
  const jobs = [];
  const shipments = [];

  tasks.forEach((task, index) => {
    if (task.type === "service") {
      jobs.push(mapServiceToJob(task, index));
    } else if (task.type === "shipment") {
      shipments.push(mapShipmentToVroom(task, index));
    }
  });

  return {
    vehicles: mapStaffToVehicles(staff),
    jobs,
    shipments,
  };
}

/**
 * Parse VROOM solution back and return a sort_order mapping.
 * @param {object} vroomResult - VROOM response
 * @returns {Array<{taskId: string, sortOrder: number, staffId: string}>}
 */
export function parseSolution(vroomResult) {
  const updates = [];

  if (!vroomResult.routes) return updates;

  for (const route of vroomResult.routes) {
    const staffDesc = route.description || "";
    const staffId = staffDesc.replace("staff:", "");

    for (const step of route.steps) {
      if (step.type === "job" || step.type === "pickup" || step.type === "delivery") {
        const desc = step.description || "";
        const taskId = desc.split(":")[1];

        if (taskId) {
          updates.push({
            taskId,
            staffId,
            sortOrder: updates.length + 1,
            arrival: step.arrival,
            duration: step.duration,
          });
        }
      }
    }
  }

  return updates;
}
