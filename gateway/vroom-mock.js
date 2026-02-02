/**
 * Mock VROOM Service - Development Only
 * 
 * This provides a basic mock for route optimization testing.
 * For production, implement the real VROOM engine.
 */

import express from 'express';

const app = express();
app.use(express.json());

// Mock VROOM response for optimization requests
app.post('/', (req, res) => {
  const { vehicles = [], jobs = [], shipments = [] } = req.body;
  
  console.log(`[VROOM Mock] Optimizing ${jobs.length} jobs and ${shipments.length} shipments for ${vehicles.length} vehicles`);
  
  // Simple mock response - assign jobs round-robin to vehicles
  const routes = [];
  const totalTasks = jobs.length + shipments.length;
  
  if (totalTasks === 0) {
    return res.json({
      summary: {
        cost: 0,
        routes: 0,
        unassigned: 0,
        delivery: [],
        amount: [],
        duration: 0,
        distance: 0
      },
      routes: [],
      unassigned: []
    });
  }
  
  // Create mock routes for each vehicle
  vehicles.forEach((vehicle, vehicleIndex) => {
    const tasksPerVehicle = Math.ceil(totalTasks / vehicles.length);
    const startIndex = vehicleIndex * tasksPerVehicle;
    const endIndex = Math.min(startIndex + tasksPerVehicle, totalTasks);
    
    const steps = [];
    let arrivalTime = 0;
    
    // Add steps for assigned jobs
    for (let i = startIndex; i < Math.min(endIndex, jobs.length); i++) {
      const job = jobs[i];
      steps.push({
        type: 'job',
        id: job.id,
        description: job.description,
        location: job.location,
        service: job.service,
        arrival: arrivalTime,
        duration: job.service || 300,
        distance: 1000
      });
      arrivalTime += (job.service || 300) + 300; // Add 5 min travel time
    }
    
    // Add steps for assigned shipments
    const shipmentStart = Math.max(0, startIndex - jobs.length);
    for (let i = shipmentStart; i < Math.min(endIndex - jobs.length, shipments.length); i++) {
      const shipment = shipments[i];
      
      // Pickup step
      steps.push({
        type: 'pickup',
        id: shipment.pickup.id,
        description: shipment.pickup.description,
        location: shipment.pickup.location,
        service: shipment.pickup.service,
        arrival: arrivalTime,
        duration: shipment.pickup.service || 120,
        distance: 1000
      });
      arrivalTime += (shipment.pickup.service || 120) + 300;
      
      // Delivery step
      steps.push({
        type: 'delivery',
        id: shipment.delivery.id,
        description: shipment.delivery.description,
        location: shipment.delivery.location,
        service: shipment.delivery.service,
        arrival: arrivalTime,
        duration: shipment.delivery.service || 120,
        distance: 1000
      });
      arrivalTime += (shipment.delivery.service || 120) + 300;
    }
    
    if (steps.length > 0) {
      routes.push({
        vehicle: vehicle.id,
        description: vehicle.description,
        steps,
        geometry: 'mock_geometry',
        distance: steps.length * 1000,
        duration: arrivalTime
      });
    }
  });
  
  // Calculate unassigned
  const assignedCount = routes.reduce((sum, route) => sum + route.steps.length, 0);
  const unassignedCount = totalTasks - assignedCount;
  
  res.json({
    summary: {
      cost: routes.reduce((sum, r) => sum + r.distance, 0),
      routes: routes.length,
      unassigned: unassignedCount,
      delivery: [],
      amount: [],
      duration: routes.reduce((max, r) => Math.max(max, r.duration), 0),
      distance: routes.reduce((sum, r) => sum + r.distance, 0)
    },
    routes,
    unassigned: []
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vroom-mock' });
});

const PORT = process.env.VROOM_PORT || 3000;
app.listen(PORT, () => {
  console.log(`[VROOM Mock Service] Running on http://localhost:${PORT}`);
  console.log(`[VROOM Mock Service] For production, replace with real VROOM engine`);
});
