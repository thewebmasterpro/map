# 🚀 Configuration Rapide - Créer les Collections PocketBase

## Option 1: Via l'Interface Admin (RECOMMANDÉ)

### 1. Accédez à l'Admin
- URL: **http://localhost:8091/_/**

### 2. Créer Collection "clients"
```
Settings → Collections → New Collection

Name: clients
Fields:
  - name (text, required ✅)
  - api_key (text, required ✅)
  - allowed_origins (json)
  - is_active (checkbox)

Permissions:
  - List: [no rule]
  - View: [no rule]
  - Create: [no rule]
  - Update: [no rule]
  - Delete: @request.auth.id != ""
```

### 3. Créer Collection "staff"
```
Name: staff
Fields:
  - name (text, required ✅)
  - skills (json)
  - capacity (json)
  - start_location (json, required ✅)
  - current_location (json)
  - is_available (checkbox)

Permissions: (comme clients)
```

### 4. Créer Collection "tasks"
```
Name: tasks
Fields:
  - type (select: service, shipment, required ✅)
  - status (select: pending, optimized, in_progress, completed, required ✅)
  - client_id (relation → clients)
  - staff_id (relation → staff)
  - data (json, required ✅)
  - sort_order (number)
  - scheduled_at (date)
  - completed_at (date)

Permissions: (comme clients)
```

### 5. Ajouter les Données de Démo

**Dans collection "clients":**
```
name: Demo Client
api_key: demo-key-for-development
allowed_origins: ["http://localhost:5175"]
is_active: ✅
```

**Dans collection "staff":**
```
name: John Driver
skills: [1, 2]
capacity: {"weight": 100}
start_location: {"lat": 50.8503, "lng": 4.3517}
is_available: ✅
```

**Dans collection "tasks" (créer 2 fois):**

Tâche 1:
```
type: service
status: pending
client_id: [sélectionnez Demo Client]
data: {"location":{"lat":50.85,"lng":4.35},"duration":600,"description":"Service visit"}
```

Tâche 2:
```
type: shipment
status: pending
client_id: [sélectionnez Demo Client]
data: {"pickup_lat":50.84,"pickup_lng":4.34,"delivery_lat":50.86,"delivery_lng":4.36,"weight":5}
```

## ✅ Vérification

Une fois les données créées:

```bash
curl -s http://localhost:4002/api/tasks \
  -H "x-api-key: demo-key-for-development"
```

Devrait retourner les 2 tâches en JSON.

Allez à: **http://localhost:5175**

Vous devriez voir les 2 interventions/livraisons!

---

**Besoin d'aide?** Consultez [SETUP_STEPS.md](../SETUP_STEPS.md) pour plus de détails.
