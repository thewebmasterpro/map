# Architecture Microservice - Map Service

## 🎯 Vision Correcte

**Map Service** = Microservice d'optimisation de routes utilisé par les propres SaaS de Hagen Digital.

**PAS un SaaS public**, mais un service backend partagé entre vos applications.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                  VOS SAAS                             │
├──────────────────────────────────────────────────────┤
│                                                       │
│  SAAS 1: Infi (Infirmières)                         │
│  ├─ Frontend: Gestion + Carte + Routes              │
│  ├─ Backend: Facturation, Users, Planning           │
│  └─ DB: Clients, Infirmières, Tournées              │
│                    │                                  │
│                    │ API Call                         │
│                    ▼                                  │
│  ┌─────────────────────────────────────────┐        │
│  │   MAP SERVICE (Shared)                  │        │
│  │   ├─ Optimisation VROOM                 │        │
│  │   ├─ API Gateway                        │        │
│  │   └─ Auth: 1 API key par SaaS           │        │
│  └─────────────────────────────────────────┘        │
│                    ▲                                  │
│                    │                                  │
│  SAAS 2: Delivery                                    │
│  ├─ Frontend: Livraisons + Map                      │
│  ├─ Backend: Commandes, Facturation                 │
│  └─ DB: Commandes, Livreurs, Tournées               │
│                    │                                  │
│                    │                                  │
│  SAAS 3: FieldService (Plombiers/Électriciens)      │
│  └─ ...                                              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Map Service - Responsabilités

### Ce que Map Service FAIT :

1. ✅ Optimiser des routes (API `/api/optimize`)
2. ✅ Gérer des tâches temporaires (CRUD `/api/tasks`)
3. ✅ Authentification simple (API key par SaaS)
4. ✅ Rate limiting basique
5. ✅ Logging des appels
6. ✅ Documentation API

### Ce que Map Service NE FAIT PAS :

1. ❌ Facturation (dans chaque SaaS)
2. ❌ Dashboard utilisateur (dans chaque SaaS)
3. ❌ Gestion de clients finaux (dans chaque SaaS)
4. ❌ Gestion du personnel (dans chaque SaaS)
5. ❌ Visualisation routes (composants partagés)

---

## 🔑 Authentification Simple

### Configuration

```javascript
// PocketBase: table api_clients
{
  id: "saas_infi_prod",
  name: "SaaS Infirmières - Production",
  api_key: "sk_infi_xxxxxxxxxxxxxx",
  is_active: true,
  allowed_origins: ["https://infi.hagendigital.com"],
}

{
  id: "saas_delivery_prod",
  name: "SaaS Delivery - Production",
  api_key: "sk_delivery_xxxxxxxxxxxxxx",
  is_active: true,
  allowed_origins: ["https://delivery.hagendigital.com"],
}
```

### Usage

```javascript
// Dans SaaS Infi - Backend
const HAGEN_MAP_API_KEY = process.env.HAGEN_MAP_API_KEY;

async function callMapService(endpoint, data) {
  const response = await fetch(`https://map.hagendigital.com${endpoint}`, {
    method: "POST",
    headers: {
      "x-api-key": HAGEN_MAP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
```

---

## 📦 Composants Partagés

Créer un package npm privé avec composants React :

```bash
# Nouveau package
@hagen/map-components
```

### Structure

```
packages/map-components/
├── src/
│   ├── RouteMap.tsx           # Carte Leaflet avec routes
│   ├── RouteList.tsx          # Liste des routes
│   ├── TaskMarker.tsx         # Marqueurs de tâches
│   ├── OptimizationSummary.tsx # Résumé optimisation
│   └── index.ts
├── package.json
└── README.md
```

### Composants

#### 1. RouteMap.tsx

```typescript
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

export interface RouteMapProps {
  routes: Route[];
  tasks: Task[];
  staff: Staff[];
  center?: [number, number];
  zoom?: number;
}

export function RouteMap({ routes, tasks, staff, center, zoom = 12 }: RouteMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Marqueurs pour tâches */}
      {tasks.map(task => (
        <TaskMarker key={task.id} task={task} />
      ))}

      {/* Routes */}
      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.steps.map(s => [s.location.lat, s.location.lng])}
          color={ROUTE_COLORS[idx % ROUTE_COLORS.length]}
        />
      ))}
    </MapContainer>
  );
}
```

#### 2. RouteList.tsx

```typescript
export interface RouteListProps {
  routes: Route[];
  onTaskClick?: (task: Task) => void;
}

export function RouteList({ routes, onTaskClick }: RouteListProps) {
  return (
    <div className="space-y-4">
      {routes.map((route, idx) => (
        <div key={idx} className="border rounded-lg p-4">
          <h3 className="font-bold">
            Route {idx + 1} - {route.vehicle.name}
          </h3>

          <div className="mt-2 space-y-2">
            {route.steps.map((step, stepIdx) => (
              <div
                key={stepIdx}
                onClick={() => onTaskClick?.(step.task)}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
              >
                <span className="text-gray-500">{stepIdx + 1}.</span>
                <span>{step.task.address}</span>
                <span className="text-sm text-gray-400">
                  {formatTime(step.arrival_time)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>🚗 {formatDistance(route.distance)}</span>
            <span>⏱️ {formatDuration(route.duration)}</span>
            <span>📦 {route.steps.length} tâches</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### 3. OptimizationSummary.tsx

```typescript
export interface OptimizationSummaryProps {
  summary: OptimizationSummary;
  unassigned?: Task[];
}

export function OptimizationSummary({ summary, unassigned }: OptimizationSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4">Résumé de l'optimisation</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Routes"
          value={summary.routes}
          icon="🗺️"
        />
        <StatCard
          label="Distance totale"
          value={formatDistance(summary.distance)}
          icon="📏"
        />
        <StatCard
          label="Durée totale"
          value={formatDuration(summary.duration)}
          icon="⏱️"
        />
        <StatCard
          label="Tâches"
          value={summary.delivered}
          icon="✅"
        />
      </div>

      {unassigned && unassigned.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <h3 className="font-medium text-yellow-800">
            ⚠️ {unassigned.length} tâches non assignées
          </h3>
          <ul className="mt-2 text-sm text-yellow-700">
            {unassigned.map(task => (
              <li key={task.id}>{task.address}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Usage dans vos SaaS

```typescript
// Dans SaaS Infi
import {
  RouteMap,
  RouteList,
  OptimizationSummary
} from '@hagen/map-components';

function TourneeOptimisee({ data }: { data: OptimizationResult }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Carte */}
      <div className="h-[600px]">
        <RouteMap
          routes={data.routes}
          tasks={data.allTasks}
          staff={data.nurses}
          center={[45.5017, -73.5673]}
        />
      </div>

      {/* Liste */}
      <div className="space-y-4">
        <OptimizationSummary
          summary={data.summary}
          unassigned={data.unassigned}
        />
        <RouteList
          routes={data.routes}
          onTaskClick={handleTaskClick}
        />
      </div>
    </div>
  );
}
```

---

## 🔄 Flux Typique

### Exemple: SaaS Infi optimise tournées du jour

```typescript
// 1. Manager clique "Optimiser tournée"
async function optimizeTournee(date: Date) {
  // 2. Backend Infi récupère données
  const clients = await db.clients.findMany({
    where: { scheduled_date: date },
  });

  const nurses = await db.nurses.findMany({
    where: { available: true, date },
  });

  // 3. Appel Map Service
  const optimization = await fetch("https://map.hagendigital.com/api/optimize", {
    method: "POST",
    headers: {
      "x-api-key": process.env.HAGEN_MAP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: clients.map(c => ({
        id: c.id,
        type: "service",
        address: c.address,
        latitude: c.latitude,
        longitude: c.longitude,
        service_duration: c.care_duration,
        skills_required: c.care_type, // Ex: "wound_care"
      })),
      vehicles: nurses.map(n => ({
        id: n.id,
        start_location: [n.home_lat, n.home_lng],
        capacity: n.max_patients_per_day,
        skills: n.certifications,
      })),
    }),
  });

  const result = await optimization.json();

  // 4. Sauvegarder dans DB Infi
  for (const route of result.routes) {
    await db.tour.create({
      data: {
        nurse_id: route.vehicle_id,
        date,
        tasks: route.steps.map(s => ({
          client_id: s.task_id,
          arrival_time: s.arrival,
          departure_time: s.departure,
          distance: s.distance,
        })),
        total_distance: route.distance,
        total_duration: route.duration,
      },
    });
  }

  // 5. Retourner au frontend pour visualisation
  return result;
}
```

---

## 📊 Facturation dans chaque SaaS

### SaaS Infi

```typescript
// Facturation basée sur nombre d'infirmières actives
const PRICE_PER_NURSE_PER_MONTH = 29.99;

async function calculateMonthlyBill(clinicId: string) {
  const activeNurses = await db.nurses.count({
    where: {
      clinic_id: clinicId,
      is_active: true,
    },
  });

  return activeNurses * PRICE_PER_NURSE_PER_MONTH;
}

// Limite: Max X optimisations par jour basé sur plan
async function canOptimize(clinicId: string) {
  const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
  const optimizationsToday = await db.optimization.count({
    where: {
      clinic_id: clinicId,
      created_at: { gte: startOfDay(new Date()) },
    },
  });

  const limit = clinic.plan === "starter" ? 10 : 50;

  return optimizationsToday < limit;
}
```

### SaaS Delivery

```typescript
// Facturation basée sur nombre de livraisons optimisées
const PRICE_PER_1000_OPTIMIZATIONS = 99;

async function calculateUsageBill(companyId: string, month: Date) {
  const optimizations = await db.optimization.count({
    where: {
      company_id: companyId,
      created_at: {
        gte: startOfMonth(month),
        lte: endOfMonth(month),
      },
    },
  });

  return Math.ceil(optimizations / 1000) * PRICE_PER_1000_OPTIMIZATIONS;
}
```

---

## 🎯 Ce qu'il faut faire maintenant

### 1. Rien à changer dans Map Service ✅

L'architecture actuelle est parfaite pour un microservice :

- ✅ API Gateway
- ✅ Auth par API key
- ✅ Multi-tenant
- ✅ Documentation
- ✅ Rate limiting

### 2. Créer package @hagen/map-components

```bash
# Nouveau workspace
mkdir -p packages/map-components
cd packages/map-components
npm init -y
# Ajouter composants React réutilisables
```

### 3. Utiliser dans vos SaaS

- SaaS Infi: Importer composants
- SaaS Delivery: Importer composants
- Chaque SaaS gère sa propre facturation

---

## ✅ Checklist Architecture

**Map Service (Actuel)** ✅:

- [x] API Gateway
- [x] Auth API key
- [x] Multi-tenant
- [x] Documentation
- [x] Optimisation VROOM

**À ajouter**:

- [ ] Package @hagen/map-components
- [ ] Types TypeScript partagés
- [ ] Exemples d'intégration

**Chaque SaaS** (À faire dans chaque app):

- [ ] Gestion clients/users
- [ ] Facturation Stripe
- [ ] Limites d'utilisation
- [ ] UI avec composants @hagen/map-components

---

## 🎉 Conclusion

**Map Service = Microservice simple et efficace**

Pas de billing, pas de dashboard complexe, juste :

- API robuste
- Composants réutilisables
- Documentation claire

**Beaucoup plus simple que la première version ! 🚀**
