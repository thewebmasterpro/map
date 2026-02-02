# BACKEND : POCKETBASE & LOGIQUE MÉTIER

## Collections PocketBase
- `clients` : id, name, api_key, allowed_origins (check CORS).
- `staff` : id, name, skills (json), capacity (weight/volume), start_location (json).
- `tasks` (Collection Hybride) :
    - `type` : enum('service', 'shipment')
    - `status` : enum('pending', 'optimized', 'in_progress', 'completed')
    - `client_id` : relation(clients)
    - `data` : JSON (si service : duration. si shipment : pickup_lat/lng, delivery_lat/lng, weight).
    - `sort_order` : number (mis à jour par l'optimiseur).

## Logique de l'API Gateway (Le Switch)
L'API doit traduire les données de PocketBase pour VROOM :
- **Si type == 'service'** : Transformer en objet `job` VROOM (1 lieu, 1 durée).
- **Si type == 'shipment'** : Transformer en objet `shipment` VROOM (2 lieux liés : Pickup & Delivery).

## Tâches pour Claude :
- Créer les migrations PocketBase (ou scripts JS) pour générer ces collections.
- Développer le middleware Node.js qui valide la clé API et fait le "Mapping" vers VROOM.
