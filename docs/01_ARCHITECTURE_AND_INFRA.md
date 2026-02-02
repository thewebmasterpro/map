# ARCHITECTURE ET INFRASTRUCTURE (COOLIFY)

## Vision
Déploiement d'une stack logistique hybride (Service + Livraison) sur le VPS via Coolify.
Domaine : map.hagendigital.com

## Composants à déployer
1. **PocketBase (Service Coolify)** : Stockage central, Auth et Temps réel.
2. **Stack Logistique (Docker Compose)** :
    - **OSRM (Backend)** : Moteur de routage (Données France-latest).
    - **VROOM (Engine)** : Moteur d'optimisation (doit pointer vers OSRM).
3. **API Gateway (Node.js/Express)** : Middleware de sécurité et de formatage des données.

## Tâches pour Claude :
- Générer le `docker-compose.yml` pour OSRM + VROOM.
- Préparer un script `setup-osrm.sh` pour automatiser l'extraction des données OpenStreetMap France (`osrm-extract`, `osrm-partition`, `osrm-customize`).
- Configurer les volumes persistants pour éviter de perdre les données de navigation au redémarrage.
