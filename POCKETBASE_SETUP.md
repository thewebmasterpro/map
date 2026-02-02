# 🚀 Configuration PocketBase - Guide d'Initialisation

## ⚠️ Problème: Collections Manquantes

Les migrations PocketBase ne s'exécutent pas automatiquement au démarrage. Vous devez les exécuter manuellement via l'interface Admin.

## 📋 Solution: Créer les Collections Manuellement

### Étape 1: Accédez à l'Admin PocketBase
- URL: http://localhost:8091/_/
- Pas de login requis en mode dev

### Étape 2: Créer la Collection "clients"
1. Cliquez sur "Collections" → "New collection"
2. Nom: `clients`
3. Ajoutez les champs:
   - `name` (Text, required)
   - `api_key` (Text, required)
   - `allowed_origins` (JSON)
   - `is_active` (Checkbox)

### Étape 3: Créer la Collection "staff"
1. Nom: `staff`
2. Champs:
   - `name` (Text, required)
   - `skills` (JSON)
   - `capacity` (JSON)
   - `start_location` (JSON, required)
   - `current_location` (JSON)
   - `is_available` (Checkbox)

### Étape 4: Créer la Collection "tasks"
1. Nom: `tasks`
2. Champs:
   - `type` (Select: "service", "shipment")
   - `status` (Select: "pending", "optimized", "in_progress", "completed")
   - `client_id` (Relation to clients)
   - `staff_id` (Relation to staff)
   - `data` (JSON, required)
   - `sort_order` (Number)
   - `scheduled_at` (Date)
   - `completed_at` (Date)

### Étape 5: Créer les Données de Démo

#### Créer un Client
- Name: `Demo Client`
- API Key: `demo-key-for-development`
- Allowed Origins: `http://localhost:5175`
- Is Active: ✅ checked

#### Créer un Staff
- Name: `John Driver`
- Skills: `[1, 2]` (JSON)
- Capacity: `{"weight": 100}` (JSON)
- Start Location: `{"lat": 50.8503, "lng": 4.3517}` (JSON)
- Is Available: ✅ checked

#### Créer des Tâches
**Tâche 1 (Service):**
- Type: `service`
- Status: `pending`
- Client: (sélectionnez Demo Client)
- Data: 
```json
{
  "location": {"lat": 50.85, "lng": 4.35},
  "duration": 600,
  "description": "Service visit"
}
```

**Tâche 2 (Shipment):**
- Type: `shipment`
- Status: `pending`
- Client: (sélectionnez Demo Client)
- Data:
```json
{
  "pickup_lat": 50.84,
  "pickup_lng": 4.34,
  "delivery_lat": 50.86,
  "delivery_lng": 4.36,
  "weight": 5
}
```

## ✅ Vérification

Après avoir créé les données:

1. Testez l'API:
```bash
curl -H "x-api-key: demo-key-for-development" \
  http://localhost:4002/api/tasks
```

2. Allez sur http://localhost:5175
3. Vous devriez voir 2 tâches

## 🔄 Alternative: Utiliser la Migration Automatique

Si vous avez accès aux fichiers PocketBase, vous pouvez:
1. Mettre à jour les migrations dans `pocketbase/pb_migrations/`
2. Redémarrer PocketBase
3. Les migrations seront appliquées automatiquement

Les fichiers de migration sont déjà créés:
- `1_create_clients.js`
- `2_create_staff.js`
- `3_create_tasks.js`
