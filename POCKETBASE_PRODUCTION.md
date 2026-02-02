# 🚀 PocketBase - Configuration Production

## 1. Déploiement Initial

### Via Docker (Recommandé)

```bash
# Pull l'image officielle
docker pull ghcr.io/muchobien/pocketbase:latest

# Créer un volume pour les données persistantes
docker volume create pb-data

# Lancer le container
docker run -d \
  --name pocketbase \
  --restart unless-stopped \
  -p 8090:8090 \
  -v pb-data:/pb/pb_data \
  -e POCKETBASE_URL="https://votre-domaine.com" \
  ghcr.io/muchobien/pocketbase:latest
```

### Via Docker Compose (Recommandé pour production)

```yaml
services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: hagen-pocketbase-prod
    restart: always
    ports:
      - "127.0.0.1:8090:8090"  # Bind à localhost uniquement
    volumes:
      - pb-data:/pb/pb_data
      - ./pb_migrations:/pb/pb_migrations
      - ./pb_hooks:/pb/pb_hooks
    environment:
      - POCKETBASE_URL=https://votre-domaine.com
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8090/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - hagen-network

volumes:
  pb-data:
    driver: local

networks:
  hagen-network:
    driver: bridge
```

## 2. Configuration Admin & Sécurité

### A. Première Connexion

1. Accédez à `https://votre-domaine.com/_/` (admin panel)
2. La première fois, créez un compte **admin**
3. **Sauvegardez les identifiants** dans un gestionnaire de secrets

### B. Désactiver les Inscriptions

1. Settings → Auth providers
2. Désactiver **Email/password signup** (authentification seulement pour les admins)
3. Créer les utilisateurs manuellement via l'interface

### C. HTTPS (OBLIGATOIRE)

Utilisez un reverse proxy (Nginx/Caddy) avec Let's Encrypt:

**Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/api.votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    listen 80;
    server_name api.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}
```

**Caddy (Plus simple):**
```
api.votre-domaine.com {
    reverse_proxy 127.0.0.1:8090
}
```

## 3. Créer les Collections

### Via Admin UI

Allez sur http://localhost:8090/_ → Collections → New Collection

Créez 3 collections avec permissions **publiques**:

#### Collection: clients
```
Fields:
  - name (text, required)
  - api_key (text, required, unique)
  - allowed_origins (json)
  - is_active (checkbox)

API Rules:
  - List Rule: [VIDE]
  - View Rule: [VIDE]
  - Create Rule: [VIDE]
  - Update Rule: [VIDE]
  - Delete Rule: [VIDE]
```

#### Collection: staff
```
Fields:
  - name (text, required)
  - skills (json)
  - capacity (json)
  - start_location (json, required)
  - current_location (json)
  - is_available (checkbox)

API Rules: [TOUTES VIDES]
```

#### Collection: tasks
```
Fields:
  - type (select: service, shipment, required)
  - status (select: pending, optimized, in_progress, completed, required)
  - client_id (relation → clients, required)
  - staff_id (relation → staff)
  - data (json, required)
  - sort_order (number)
  - scheduled_at (date)
  - completed_at (date)

API Rules: [TOUTES VIDES]
```

### Via Script Automatisé

```bash
# Utilisez les scripts fournis
bash infra/setup-pocketbase.js

# Ou créez-les manuellement via l'UI
```

## 4. Insérer les Données de Démo

### Dans Collection "clients"

```json
{
  "name": "Demo Client",
  "api_key": "prod-key-uuid-random",
  "allowed_origins": ["https://votre-domaine.com"],
  "is_active": true
}
```

### Dans Collection "staff"

```json
{
  "name": "John Driver",
  "skills": [1, 2],
  "capacity": {"weight": 100, "volume": 50},
  "start_location": {"lat": 50.8503, "lng": 4.3517},
  "is_available": true
}
```

### Dans Collection "tasks" (x2)

**Task 1 (Service):**
```json
{
  "type": "service",
  "status": "pending",
  "client_id": "[ID du client]",
  "data": {
    "location": {"lat": 50.85, "lng": 4.35},
    "duration": 600,
    "description": "Service visit"
  }
}
```

**Task 2 (Shipment):**
```json
{
  "type": "shipment",
  "status": "pending",
  "client_id": "[ID du client]",
  "data": {
    "pickup_lat": 50.84,
    "pickup_lng": 4.34,
    "delivery_lat": 50.86,
    "delivery_lng": 4.36,
    "weight": 5
  }
}
```

## 5. Sauvegarde & Restauration

### Sauvegarde Automatique

PocketBase sauvegarde automatiquement les données dans le volume Docker. Pour une sauvegarde externe:

```bash
# Backup complet
docker exec hagen-pocketbase-prod tar czf - /pb/pb_data | gzip > pb-backup-$(date +%Y%m%d).tar.gz

# Restore
docker exec -i hagen-pocketbase-prod tar xzf - -C /pb < pb-backup-*.tar.gz
docker restart hagen-pocketbase-prod
```

### Plan de Sauvegarde Recommandé

- **Quotidienne**: Script cron exécutant le backup ci-dessus
- **Stockage**: S3/GCS pour les données en cloud
- **Retention**: 30 jours minimum

```bash
# Cron job (tous les jours à 2h du matin)
0 2 * * * /path/to/backup.sh
```

## 6. Monitoring & Logs

### Logs PocketBase

```bash
docker logs -f hagen-pocketbase-prod --tail 100
```

### Health Check

```bash
curl https://votre-domaine.com/api/health
```

### Métriques à Monitorer

- Utilisation CPU/RAM
- Taille du volume pb-data
- Nombre de connexions actives
- Erreurs de requête API

## 7. Migrations & Mises à Jour

### Migrations de Schéma

Créez des fichiers dans `/pb/pb_migrations/`:

```javascript
// 001_initial_schema.js
export default (db) => {
  // Migrations automatiquement appliquées au démarrage
}
```

### Mise à Jour de PocketBase

```bash
# Pull la dernière version
docker pull ghcr.io/muchobien/pocketbase:latest

# Stop l'ancien container
docker stop hagen-pocketbase-prod

# Démarrer le nouveau (les données persistent)
docker run -d \
  --name hagen-pocketbase-prod \
  --restart unless-stopped \
  -p 127.0.0.1:8090:8090 \
  -v pb-data:/pb/pb_data \
  ghcr.io/muchobien/pocketbase:latest

# Vérifier
docker logs hagen-pocketbase-prod
```

## 8. Authentification API

### Pour le Gateway API

Les clients utilisent l'en-tête `x-api-key`:

```bash
curl https://votre-domaine.com/api/tasks \
  -H "x-api-key: prod-key-uuid-random"
```

### Créer de Nouvelles Clés

1. Admin UI → Collections → clients
2. Ajouter un nouveau client avec une clé unique
3. Utiliser cette clé dans les appels API

## 9. Checklist Pre-Production

- [ ] HTTPS configuré avec certificat valide
- [ ] Admin account créé et sécurisé
- [ ] Collections créées avec API Rules vides
- [ ] Données de démo insérées
- [ ] Test de la requête API: `curl https://votre-domaine.com/api/health`
- [ ] Backup automatique configuré
- [ ] Reverse proxy (Nginx/Caddy) configuré
- [ ] Firewall: port 8090 bind à 127.0.0.1 UNIQUEMENT
- [ ] Certificat SSL renouvelable automatiquement
- [ ] Monitoring mis en place

## 10. Dépannage Production

### Erreur 503 - Service Unavailable
```bash
# Vérifier les logs
docker logs hagen-pocketbase-prod

# Redémarrer
docker restart hagen-pocketbase-prod
```

### Erreur 400 - Bad Request
- Vérifier les API Rules (ne doivent pas contenir de code restrictif)
- Vérifier que les champs de la requête existent

### Perte de Données
- Restaurer depuis le backup: voir section "Sauvegarde & Restauration"
- Utiliser `docker volume ls` pour voir les volumes disponibles

### Performance Lente
- Augmenter les ressources Docker (CPU/RAM)
- Optimizer les requêtes (utiliser des filtres)
- Vérifier l'espace disque du volume

## 11. Variables d'Environnement (Optionnel)

```bash
docker run -d \
  -e POCKETBASE_URL="https://api.votre-domaine.com" \
  -e POCKETBASE_PORT="8090" \
  # ... autres options
  ghcr.io/muchobien/pocketbase:latest
```

---

**Support & Docs:**
- [PocketBase Docs](https://pocketbase.io/docs/)
- [Forum PocketBase](https://github.com/pocketbase/pocketbase/discussions)
