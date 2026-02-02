# 🎯 ÉTAPES D'INITIALISATION - À FAIRE MAINTENANT

## 1️⃣ Ouvrez l'Admin PocketBase

Allez à: **http://localhost:8091/_/**

## 2️⃣ Créez les 3 Collections

### Collection 1: "clients"
- Clic droit sur liste → New collection
- **Name:** `clients`
- **Type:** Base collection
- **Fields:**
  - `id` (auto)
  - `name` (Text) - required ✅
  - `api_key` (Text) - required ✅
  - `allowed_origins` (JSON)
  - `is_active` (Checkbox)

### Collection 2: "staff"
- **Name:** `staff`
- **Fields:**
  - `id` (auto)
  - `name` (Text) - required ✅
  - `skills` (JSON)
  - `capacity` (JSON)
  - `start_location` (JSON) - required ✅
  - `current_location` (JSON)
  - `is_available` (Checkbox)

### Collection 3: "tasks"
- **Name:** `tasks`
- **Fields:**
  - `id` (auto)
  - `type` (Select) → values: `service`, `shipment` - required ✅
  - `status` (Select) → values: `pending`, `optimized`, `in_progress`, `completed` - required ✅
  - `client_id` (Relation) → clients
  - `staff_id` (Relation) → staff
  - `data` (JSON) - required ✅
  - `sort_order` (Number)
  - `scheduled_at` (Date)
  - `completed_at` (Date)

## 3️⃣ Créez les Données de Démo

### Dans "clients" collection:
```
Name: Demo Client
API Key: demo-key-for-development
Allowed Origins: ["http://localhost:5175"]
Is Active: ✅
```

### Dans "staff" collection:
```
Name: John Driver
Skills: [1, 2]
Capacity: {"weight": 100}
Start Location: {"lat": 50.8503, "lng": 4.3517}
Is Available: ✅
```

### Dans "tasks" collection (2 tâches):

**Tâche 1:**
```
Type: service
Status: pending
Client: Demo Client
Data: {"location":{"lat":50.85,"lng":4.35},"duration":600,"description":"Service visit"}
```

**Tâche 2:**
```
Type: shipment
Status: pending
Client: Demo Client
Data: {"pickup_lat":50.84,"pickup_lng":4.34,"delivery_lat":50.86,"delivery_lng":4.36,"weight":5}
```

## 4️⃣ Testez l'Application

Une fois les données créées, allez à **http://localhost:5175**

Vous devriez voir:
- 2 interventions/livraisons
- Un bouton "Optimiser les tournées"
- Une carte avec des marqueurs

## ✅ Vérification Rapide

```bash
curl -H "x-api-key: demo-key-for-development" \
  http://localhost:4002/api/tasks
```

Devrait retourner les 2 tâches en JSON.

---

**Note:** Cette initialisation n'est nécessaire qu'une fois. Les données persisteront dans le volume Docker `pb-data`.
