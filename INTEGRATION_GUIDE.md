# Guide d'Intégration - Map Service

Guide complet pour intégrer le **Map Service** dans vos SaaS Hagen Digital.

---

## 🎯 Vue d'ensemble

Le Map Service est un microservice interne qui fournit des fonctionnalités d'optimisation de routes pour tous les SaaS de Hagen Digital (Infi, Delivery, Field Service, etc.).

**Ce guide est destiné aux développeurs** qui souhaitent intégrer le Map Service dans leur application.

---

## 📋 Prérequis

### 1. Obtenir une API Key

Contactez l'équipe infrastructure pour obtenir votre API key dédiée:

- Email: infrastructure@hagendigital.com
- Vous recevrez: `sk_[votre_saas]_[env]_xxxxxxxxxxxxx`

**Exemple**:

```
sk_infi_prod_abc123xyz789
sk_delivery_dev_def456uvw012
```

### 2. Configuration

Ajoutez l'API key à vos variables d'environnement:

```bash
# .env (Backend)
HAGEN_MAP_API_KEY=sk_infi_prod_abc123xyz789
HAGEN_MAP_API_URL=https://map.hagendigital.com/api

# .env (Frontend - si appels directs)
VITE_HAGEN_MAP_API_KEY=sk_infi_prod_abc123xyz789
VITE_HAGEN_MAP_API_URL=https://map.hagendigital.com/api
```

⚠️ **IMPORTANT**:

- Ne jamais exposer l'API key côté frontend (sauf en dev)
- Toujours passer par votre backend pour les appels en production
- Ne jamais commiter l'API key dans git

---

## 🚀 Démarrage Rapide

### Option A: Appel Direct (Backend)

```javascript
// backend/services/mapService.js
const HAGEN_MAP_API_KEY = process.env.HAGEN_MAP_API_KEY;
const HAGEN_MAP_API_URL = process.env.HAGEN_MAP_API_URL;

async function optimizeRoutes(tasks, vehicles, options = {}) {
  const response = await fetch(`${HAGEN_MAP_API_URL}/optimize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": HAGEN_MAP_API_KEY,
    },
    body: JSON.stringify({
      tasks,
      vehicles,
      options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Map Service error: ${response.statusText}`);
  }

  return response.json();
}

// Exemple d'utilisation
const result = await optimizeRoutes(
  [
    {
      id: "task_1",
      type: "service",
      address: "123 Rue Example, Montréal, QC",
      latitude: 45.5017,
      longitude: -73.5673,
      service_duration: 30, // minutes
      time_windows: [[9, 17]], // 9h-17h
    },
  ],
  [
    {
      id: "vehicle_1",
      start_location: [45.5088, -73.5878],
      end_location: [45.5088, -73.5878],
      capacity: [100],
      time_window: [8, 18],
    },
  ]
);

console.log(result.routes);
console.log(result.summary);
```

### Option B: SDK TypeScript (Recommandé)

```typescript
// Installation (si package créé)
npm install @hagen/map-sdk

// Usage
import { HagenMapClient } from '@hagen/map-sdk';

const mapClient = new HagenMapClient({
  apiKey: process.env.HAGEN_MAP_API_KEY!,
  baseUrl: process.env.HAGEN_MAP_API_URL,
});

const result = await mapClient.optimize({
  tasks: [...],
  vehicles: [...],
});
```

---

## 📚 API Reference

### Base URL

- **Production**: `https://map.hagendigital.com/api`
- **Staging**: `https://staging-map.hagendigital.com/api`
- **Development**: `http://localhost:4000/api`

### Authentication

Toutes les requêtes nécessitent l'header `x-api-key`:

```
x-api-key: sk_your_saas_env_xxxxxxxx
```

---

## 🔄 Endpoints Disponibles

### 1. POST /api/optimize

Optimise des routes pour vos tâches et véhicules.

**Request Body**:

```json
{
  "tasks": [
    {
      "id": "task_1",
      "type": "service",
      "address": "123 Rue Example, Montréal, QC",
      "latitude": 45.5017,
      "longitude": -73.5673,
      "service_duration": 30,
      "time_windows": [[9, 17]],
      "skills": ["nursing", "wound_care"],
      "priority": 1
    }
  ],
  "vehicles": [
    {
      "id": "vehicle_1",
      "start_location": [45.5088, -73.5878],
      "end_location": [45.5088, -73.5878],
      "capacity": [100],
      "time_window": [8, 18],
      "skills": ["nursing", "wound_care", "medication"]
    }
  ],
  "options": {
    "geometry": true
  }
}
```

**Response**:

```json
{
  "routes": [
    {
      "vehicle": "vehicle_1",
      "steps": [
        {
          "type": "start",
          "location": [45.5088, -73.5878],
          "arrival": 28800,
          "duration": 0
        },
        {
          "type": "job",
          "job": "task_1",
          "location": [45.5017, -73.5673],
          "arrival": 29100,
          "duration": 1800
        },
        {
          "type": "end",
          "location": [45.5088, -73.5878],
          "arrival": 31200
        }
      ],
      "distance": 15234,
      "duration": 2400,
      "service": 1800
    }
  ],
  "summary": {
    "cost": 15234,
    "routes": 1,
    "unassigned": 0,
    "setup": 0,
    "service": 1800,
    "duration": 2400,
    "waiting_time": 0,
    "priority": 1,
    "distance": 15234
  },
  "unassigned": []
}
```

**Champs Importants**:

- `routes`: Liste des routes optimisées par véhicule
- `summary`: Statistiques globales (distance, durée, etc.)
- `unassigned`: Tâches non assignées (si impossible d'assigner)

---

### 2. GET /api/tasks

Récupère les tâches temporaires créées.

**Query Parameters**:

- `limit` (optional): Nombre max de résultats (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response**:

```json
{
  "tasks": [
    {
      "id": "temp_task_123",
      "type": "service",
      "address": "123 Rue Example",
      "latitude": 45.5017,
      "longitude": -73.5673,
      "created_at": "2026-02-03T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

### 3. POST /api/tasks

Crée une tâche temporaire (utile pour tester).

**Request Body**:

```json
{
  "type": "service",
  "address": "123 Rue Example, Montréal, QC",
  "latitude": 45.5017,
  "longitude": -73.5673,
  "service_duration": 30,
  "time_windows": [[9, 17]]
}
```

**Response**:

```json
{
  "id": "temp_task_123",
  "type": "service",
  "address": "123 Rue Example, Montréal, QC",
  "created_at": "2026-02-03T10:30:00Z"
}
```

---

### 4. GET /api/staff

Récupère la liste du personnel disponible (exemple pour tests).

**Response**:

```json
{
  "staff": [
    {
      "id": "staff_1",
      "name": "Marie Tremblay",
      "location": [45.5088, -73.5878],
      "skills": ["nursing", "wound_care"]
    }
  ]
}
```

---

## 💡 Exemples d'Intégration

### Exemple 1: SaaS Infi (Infirmières à domicile)

```typescript
// backend/services/tourneeService.ts
import { optimizeRoutes } from "./mapService";

interface Client {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  care_duration: number; // minutes
  care_type: string; // ex: "wound_care"
  time_preference?: [number, number]; // ex: [9, 12] = 9h-12h
}

interface Nurse {
  id: string;
  home_address: { lat: number; lng: number };
  max_patients_per_day: number;
  certifications: string[]; // ex: ["nursing", "wound_care"]
  work_hours: [number, number]; // ex: [8, 18]
}

async function optimizeDailyTournee(date: Date, clinicId: string) {
  // 1. Récupérer clients du jour
  const clients = await db.client.findMany({
    where: {
      clinic_id: clinicId,
      scheduled_date: date,
      status: "confirmed",
    },
  });

  // 2. Récupérer infirmières disponibles
  const nurses = await db.nurse.findMany({
    where: {
      clinic_id: clinicId,
      available: true,
      schedule: { has: date },
    },
  });

  // 3. Préparer données pour Map Service
  const tasks = clients.map(client => ({
    id: client.id,
    type: "service" as const,
    address: client.address,
    latitude: client.latitude,
    longitude: client.longitude,
    service_duration: client.care_duration,
    time_windows: client.time_preference ? [client.time_preference] : [[8, 18]], // Toute la journée si pas de préférence
    skills: [client.care_type],
    priority: client.priority || 1,
  }));

  const vehicles = nurses.map(nurse => ({
    id: nurse.id,
    start_location: [nurse.home_address.lat, nurse.home_address.lng],
    end_location: [nurse.home_address.lat, nurse.home_address.lng],
    capacity: [nurse.max_patients_per_day],
    time_window: nurse.work_hours,
    skills: nurse.certifications,
  }));

  // 4. Appel Map Service
  const optimization = await optimizeRoutes(tasks, vehicles, {
    geometry: true, // Pour afficher routes sur carte
  });

  // 5. Sauvegarder résultats
  for (const route of optimization.routes) {
    await db.tournee.create({
      data: {
        nurse_id: route.vehicle,
        date,
        distance_total: route.distance,
        duree_total: route.duration,
        steps: route.steps.map((step, index) => ({
          ordre: index,
          client_id: step.job,
          heure_arrivee: new Date(date.getTime() + step.arrival * 1000),
          heure_depart: new Date(date.getTime() + (step.arrival + step.duration) * 1000),
        })),
      },
    });
  }

  // 6. Notifier infirmières
  for (const route of optimization.routes) {
    await notifyNurse(route.vehicle, {
      date,
      patients: route.steps.filter(s => s.type === "job").length,
      distance: route.distance,
    });
  }

  return {
    routes: optimization.routes,
    summary: optimization.summary,
    unassigned: optimization.unassigned,
  };
}
```

---

### Exemple 2: SaaS Delivery (Livraisons)

```typescript
// backend/services/deliveryService.ts
import { optimizeRoutes } from "./mapService";

interface Order {
  id: string;
  pickup_address: string;
  pickup_location: { lat: number; lng: number };
  delivery_address: string;
  delivery_location: { lat: number; lng: number };
  weight: number; // kg
  volume: number; // m³
  time_window?: [number, number]; // Fenêtre de livraison
}

interface Driver {
  id: string;
  vehicle_capacity: { weight: number; volume: number };
  depot_location: { lat: number; lng: number };
  shift: [number, number]; // ex: [8, 18]
}

async function optimizeDeliveries(orders: Order[], drivers: Driver[]) {
  // Créer 2 tâches par commande: pickup + delivery
  const tasks = orders.flatMap(order => [
    {
      id: `pickup_${order.id}`,
      type: "pickup" as const,
      address: order.pickup_address,
      latitude: order.pickup_location.lat,
      longitude: order.pickup_location.lng,
      service_duration: 10, // 10 min pour pickup
      load: [order.weight, order.volume],
    },
    {
      id: `delivery_${order.id}`,
      type: "delivery" as const,
      address: order.delivery_address,
      latitude: order.delivery_location.lat,
      longitude: order.delivery_location.lng,
      service_duration: 10, // 10 min pour delivery
      load: [-order.weight, -order.volume], // Négatif = déchargement
      time_windows: order.time_window ? [order.time_window] : undefined,
    },
  ]);

  const vehicles = drivers.map(driver => ({
    id: driver.id,
    start_location: [driver.depot_location.lat, driver.depot_location.lng],
    end_location: [driver.depot_location.lat, driver.depot_location.lng],
    capacity: [driver.vehicle_capacity.weight, driver.vehicle_capacity.volume],
    time_window: driver.shift,
  }));

  const result = await optimizeRoutes(tasks, vehicles);

  // Traiter résultats
  return result;
}
```

---

### Exemple 3: Composants React Réutilisables

```tsx
// frontend/components/RouteMap.tsx
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { OptimizationResult } from "@/types/map";

interface RouteMapProps {
  routes: OptimizationResult["routes"];
  tasks: any[];
  center?: [number, number];
  zoom?: number;
}

const ROUTE_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
];

export function RouteMap({ routes, tasks, center, zoom = 12 }: RouteMapProps) {
  return (
    <MapContainer center={center || [45.5017, -73.5673]} zoom={zoom} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marqueurs pour tâches */}
      {tasks.map(task => (
        <Marker key={task.id} position={[task.latitude, task.longitude]}>
          <Popup>
            <div>
              <h3 className="font-bold">{task.address}</h3>
              <p>Durée: {task.service_duration} min</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Polylines pour routes */}
      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.steps.filter(s => s.location).map(s => [s.location![0], s.location![1]])}
          color={ROUTE_COLORS[idx % ROUTE_COLORS.length]}
          weight={3}
          opacity={0.7}
        >
          <Popup>
            <div>
              <h3 className="font-bold">Route {idx + 1}</h3>
              <p>Distance: {(route.distance / 1000).toFixed(1)} km</p>
              <p>Durée: {Math.round(route.duration / 60)} min</p>
              <p>Tâches: {route.steps.filter(s => s.type === "job").length}</p>
            </div>
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}
```

---

## 🔒 Sécurité & Best Practices

### 1. Protection de l'API Key

❌ **Mauvais** (Frontend):

```javascript
// Ne JAMAIS faire ça en production!
const response = await fetch("https://map.hagendigital.com/api/optimize", {
  headers: {
    "x-api-key": "sk_infi_prod_abc123", // ❌ Exposé au client!
  },
});
```

✅ **Bon** (Via Backend):

```javascript
// Frontend
const response = await fetch("/api/my-backend/optimize-routes", {
  method: "POST",
  body: JSON.stringify({ clients, nurses }),
});

// Backend
app.post("/api/optimize-routes", async (req, res) => {
  // API key protégée côté serveur ✅
  const result = await mapService.optimize(req.body);
  res.json(result);
});
```

### 2. Gestion des Erreurs

```typescript
async function optimizeWithRetry(data: any, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await optimizeRoutes(data.tasks, data.vehicles);
      return result;
    } catch (error) {
      lastError = error;

      // Retry seulement sur erreurs temporaires
      if (error.status === 429) {
        // Rate limit - attendre avant retry
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
        continue;
      }

      if (error.status >= 500) {
        // Erreur serveur - retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }

      // Erreur client (400-499) - pas de retry
      throw error;
    }
  }

  throw lastError;
}
```

### 3. Caching des Résultats

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function optimizeWithCache(data: any) {
  // Créer clé cache basée sur données
  const cacheKey = `optimization:${hash(data)}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Appel Map Service
  const result = await optimizeRoutes(data.tasks, data.vehicles);

  // Cache pour 1 heure
  await redis.setex(cacheKey, 3600, JSON.stringify(result));

  return result;
}
```

### 4. Rate Limiting

Le Map Service a des rate limits:

- **100 requêtes / 15 minutes** (général)
- **30 créations / 15 minutes** (POST /tasks)
- **10 optimisations / 15 minutes** (POST /optimize)

**Gérer les rate limits**:

```typescript
async function optimizeWithBackoff(data: any) {
  try {
    return await optimizeRoutes(data.tasks, data.vehicles);
  } catch (error) {
    if (error.status === 429) {
      const retryAfter = error.headers.get("Retry-After") || 60;
      console.warn(`Rate limited. Retry after ${retryAfter}s`);

      // Option 1: Attendre et retry
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return await optimizeRoutes(data.tasks, data.vehicles);

      // Option 2: Queue la requête pour plus tard
      // await queue.add('optimize', data, { delay: retryAfter * 1000 });
    }
    throw error;
  }
}
```

---

## 🧪 Tests

### Test Unitaire (avec Mock)

```typescript
// __tests__/mapService.test.ts
import { optimizeRoutes } from "../mapService";

// Mock fetch
global.fetch = jest.fn();

describe("Map Service", () => {
  it("should optimize routes successfully", async () => {
    const mockResponse = {
      routes: [
        {
          vehicle: "v1",
          steps: [],
          distance: 1000,
          duration: 600,
        },
      ],
      summary: { routes: 1, distance: 1000 },
      unassigned: [],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await optimizeRoutes(
      [{ id: "t1", type: "service", latitude: 45.5, longitude: -73.5 }],
      [{ id: "v1", start_location: [45.5, -73.5] }]
    );

    expect(result.routes).toHaveLength(1);
    expect(result.summary.distance).toBe(1000);
  });

  it("should handle API errors", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: "Bad Request",
    });

    await expect(optimizeRoutes([{ id: "t1", type: "service" }], [{ id: "v1" }])).rejects.toThrow(
      "Map Service error: Bad Request"
    );
  });
});
```

### Test d'Intégration

```typescript
// __tests__/integration/mapService.integration.test.ts
describe("Map Service Integration", () => {
  it("should optimize real routes", async () => {
    // Utilise vraie API (en staging)
    const result = await optimizeRoutes(
      [
        {
          id: "test_1",
          type: "service",
          address: "123 Test St",
          latitude: 45.5017,
          longitude: -73.5673,
          service_duration: 30,
        },
      ],
      [
        {
          id: "vehicle_1",
          start_location: [45.5088, -73.5878],
          capacity: [100],
        },
      ]
    );

    expect(result.routes).toBeDefined();
    expect(result.summary.routes).toBeGreaterThan(0);
  }, 30000); // Timeout 30s
});
```

---

## 📊 Monitoring & Debugging

### Logs

```typescript
import { logger } from "./logger";

async function optimizeRoutesWithLogging(tasks: any[], vehicles: any[]) {
  logger.info("Starting route optimization", {
    taskCount: tasks.length,
    vehicleCount: vehicles.length,
  });

  const startTime = Date.now();

  try {
    const result = await optimizeRoutes(tasks, vehicles);

    logger.info("Route optimization successful", {
      duration: Date.now() - startTime,
      routes: result.routes.length,
      unassigned: result.unassigned.length,
      totalDistance: result.summary.distance,
    });

    return result;
  } catch (error) {
    logger.error("Route optimization failed", {
      duration: Date.now() - startTime,
      error: error.message,
      taskCount: tasks.length,
      vehicleCount: vehicles.length,
    });

    throw error;
  }
}
```

### Métriques

```typescript
import { metrics } from "./metrics";

async function optimizeRoutesWithMetrics(tasks: any[], vehicles: any[]) {
  const timer = metrics.startTimer("map_service_optimization");

  try {
    const result = await optimizeRoutes(tasks, vehicles);

    metrics.increment("map_service_requests_total", {
      status: "success",
      routes: result.routes.length,
    });

    return result;
  } catch (error) {
    metrics.increment("map_service_requests_total", {
      status: "error",
      error: error.status || 500,
    });

    throw error;
  } finally {
    timer.end();
  }
}
```

---

## 🆘 Support & Troubleshooting

### Problèmes Communs

#### 1. "Invalid API Key"

**Cause**: API key incorrecte ou expirée

**Solution**:

```bash
# Vérifier variable d'environnement
echo $HAGEN_MAP_API_KEY

# Tester l'API key
curl -H "x-api-key: $HAGEN_MAP_API_KEY" \
  https://map.hagendigital.com/api/tasks

# Si invalide, demander nouvelle clé à l'équipe infrastructure
```

#### 2. "Rate Limit Exceeded"

**Cause**: Trop de requêtes

**Solution**:

- Implémenter caching (voir section Best Practices)
- Utiliser queues pour batch les requêtes
- Augmenter la limite (contacter infrastructure)

#### 3. "No feasible solution"

**Cause**: Impossible de créer des routes valides (contraintes trop strictes)

**Solution**:

```typescript
// Relâcher les contraintes progressivement
const strategies = [
  // Stratégie 1: Contraintes strictes
  { time_windows: true, skills: true },

  // Stratégie 2: Ignorer skills
  { time_windows: true, skills: false },

  // Stratégie 3: Relâcher time windows
  { time_windows: false, skills: false },
];

for (const strategy of strategies) {
  try {
    const result = await optimizeWithStrategy(data, strategy);
    if (result.unassigned.length === 0) {
      return result;
    }
  } catch (error) {
    continue;
  }
}

// Aucune stratégie n'a fonctionné
throw new Error("Cannot create feasible routes");
```

#### 4. Latence Élevée

**Cause**: Trop de tâches/véhicules

**Solution**:

- Limiter à ~200 tâches et ~20 véhicules par requête
- Diviser en plusieurs optimisations si plus
- Utiliser cache agressif

---

## 📞 Contact & Support

### Équipe Map Service

- **Email**: map-service@hagendigital.com
- **Slack**: #map-service
- **Documentation**: https://docs.hagendigital.com/map-service
- **Status Page**: https://status.hagendigital.com

### Obtenir de l'Aide

1. **Documentation**: Consultez ce guide en premier
2. **Admin Dashboard**: Vérifiez les métriques et erreurs
3. **Slack**: Posez vos questions sur #map-service
4. **Email**: Pour problèmes urgents ou demandes de nouvelles fonctionnalités

---

## 🎓 Ressources Additionnelles

### Documentation Connexe

- [MICROSERVICE_ARCHITECTURE.md](MICROSERVICE_ARCHITECTURE.md) - Architecture globale
- [ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md) - Dashboard monitoring
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement

### Exemples de Code

Voir le dossier `/examples` pour des exemples complets:

- `examples/infi-integration/` - Intégration SaaS Infi
- `examples/delivery-integration/` - Intégration SaaS Delivery
- `examples/react-components/` - Composants React réutilisables

### API VROOM (Sous-jacente)

Le Map Service utilise VROOM pour l'optimisation. Documentation:

- https://github.com/VROOM-Project/vroom/wiki

---

## 🔄 Changelog

### v1.0.0 (2026-02-03)

- ✅ Guide initial
- ✅ Exemples Infi et Delivery
- ✅ Best practices sécurité
- ✅ Section troubleshooting

---

**Questions? Contactez-nous sur #map-service** 🚀
