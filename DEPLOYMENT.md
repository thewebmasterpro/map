# Guide de Déploiement

## 🚀 Déploiement Production

### Prérequis

- Docker & Docker Compose installés
- Accès SSH au serveur (si déploiement distant)
- Variables d'environnement configurées

---

## 📋 Configuration

### 1. Variables d'Environnement

Créer un fichier `.env.production`:

```bash
# Domain
DOMAIN=map.hagendigital.com

# Frontend
VITE_API_URL=https://api.map.hagendigital.com
VITE_POCKETBASE_URL=https://db.map.hagendigital.com
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_API_KEY=production-api-key-change-this
VITE_OSRM_URL=https://osrm.map.hagendigital.com

# Gateway
GATEWAY_PORT=4000
GATEWAY_CORS_ORIGINS=https://map.hagendigital.com
JWT_SECRET=super-secret-jwt-key-min-32-chars-production
POCKETBASE_URL=http://pocketbase:8090

# PocketBase
POCKETBASE_ADMIN_EMAIL=admin@hagendigital.com
POCKETBASE_ADMIN_PASSWORD=secure-password-here
```

⚠️ **IMPORTANT**: Ne jamais commiter ce fichier !

---

## 🐳 Déploiement Docker

### Option 1: Déploiement Local/Serveur

```bash
# 1. Charger les variables d'environnement
export $(cat .env.production | xargs)

# 2. Build et lancer les containers
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# 4. Vérifier le status
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: GitHub Actions (Automatique)

Le déploiement automatique se déclenche sur:

- Push sur `main` → Déploie en production
- Push sur `develop` → Déploie en staging (si configuré)

#### Configuration requise dans GitHub Secrets:

```
# Deployment
DEPLOY_HOST=your-server.com
DEPLOY_USER=deployment-user
DEPLOY_SSH_KEY=<private-key>

# Frontend
VITE_API_URL=https://api.map.hagendigital.com
VITE_POCKETBASE_URL=https://db.map.hagendigital.com
VITE_API_KEY=production-key

# Gateway
JWT_SECRET=production-jwt-secret
```

---

## 🔄 Mise à Jour

### Update manuelle

```bash
# 1. Pull les nouvelles images
docker-compose -f docker-compose.prod.yml pull

# 2. Redémarrer avec les nouvelles images
docker-compose -f docker-compose.prod.yml up -d

# 3. Nettoyer les anciennes images
docker image prune -f
```

### Update automatique (GitHub Actions)

Simplement push sur `main`:

```bash
git push origin main
```

GitHub Actions va:

1. ✅ Lancer les tests
2. ✅ Builder les images Docker
3. ✅ Pusher vers le registry
4. ✅ Déployer sur le serveur
5. ✅ Vérifier le healthcheck

---

## 🩺 Health Checks

### Vérifier que tout fonctionne

```bash
# Frontend
curl https://map.hagendigital.com/health
# → "healthy"

# Gateway
curl https://api.map.hagendigital.com/health
# → {"status":"ok","timestamp":"..."}

# PocketBase
curl https://db.map.hagendigital.com/api/health
# → {"code":200}
```

### Monitorer les containers

```bash
# Status de tous les services
docker-compose -f docker-compose.prod.yml ps

# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f [service-name]

# Statistiques ressources
docker stats
```

---

## 🔧 Maintenance

### Backup PocketBase

```bash
# Backup manuel
docker exec hagen-pocketbase tar -czf /tmp/backup.tar.gz /pb_data
docker cp hagen-pocketbase:/tmp/backup.tar.gz ./backups/

# Restore
docker cp ./backups/backup.tar.gz hagen-pocketbase:/tmp/
docker exec hagen-pocketbase tar -xzf /tmp/backup.tar.gz -C /
docker-compose -f docker-compose.prod.yml restart pocketbase
```

### Logs

```bash
# Voir les logs
docker-compose -f docker-compose.prod.yml logs --tail=100 [service]

# Suivre les logs
docker-compose -f docker-compose.prod.yml logs -f [service]

# Rotation des logs (automatique avec configuration)
# Voir docker-compose.prod.yml logging section
```

### Nettoyage

```bash
# Arrêter tous les services
docker-compose -f docker-compose.prod.yml down

# Supprimer avec volumes (⚠️ DANGER: efface les données)
docker-compose -f docker-compose.prod.yml down -v

# Nettoyer images inutilisées
docker system prune -a
```

---

## 🌐 Nginx Reverse Proxy (Recommandé)

Pour production, utiliser un reverse proxy devant Docker:

```nginx
# /etc/nginx/sites-available/hagen-logistics

# Frontend
server {
    listen 80;
    listen [::]:80;
    server_name map.hagendigital.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL avec Certbot
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/map.hagendigital.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/map.hagendigital.com/privkey.pem;
}

# API Gateway
server {
    listen 80;
    listen [::]:80;
    server_name api.map.hagendigital.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activer SSL avec Certbot:

```bash
sudo certbot --nginx -d map.hagendigital.com -d api.map.hagendigital.com
```

---

## 📊 Monitoring

### Prometheus + Grafana (Optionnel)

Ajouter à `docker-compose.prod.yml`:

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Sentry (Error Tracking)

```bash
# Frontend
npm install @sentry/react

# Gateway
npm install @sentry/node
```

---

## 🔐 Sécurité

### Checklist Production

- [ ] Variables d'environnement sécurisées
- [ ] JWT_SECRET généré avec 32+ caractères aléatoires
- [ ] API keys changées des valeurs de dev
- [ ] SSL/TLS activé (HTTPS)
- [ ] Firewall configuré
- [ ] Rate limiting actif
- [ ] Logs en place
- [ ] Backup automatique configuré
- [ ] Monitoring configuré
- [ ] Healthchecks fonctionnels

### Générer des secrets sécurisés

```bash
# JWT Secret (32+ chars)
openssl rand -base64 48

# API Key
openssl rand -hex 32

# Password sécurisé
openssl rand -base64 32
```

---

## 🚨 Troubleshooting

### Container ne démarre pas

```bash
# Voir les logs d'erreur
docker-compose -f docker-compose.prod.yml logs [service]

# Recréer le container
docker-compose -f docker-compose.prod.yml up -d --force-recreate [service]
```

### Problème de permissions

```bash
# Vérifier les permissions des volumes
docker-compose -f docker-compose.prod.yml exec [service] ls -la /path

# Corriger si nécessaire
docker-compose -f docker-compose.prod.yml exec [service] chown -R nodejs:nodejs /path
```

### Problème de mémoire

```bash
# Limiter la mémoire dans docker-compose.prod.yml
services:
  gateway:
    deploy:
      resources:
        limits:
          memory: 512M
```

---

## 📞 Support

En cas de problème:

1. Vérifier les logs
2. Vérifier les healthchecks
3. Consulter la documentation
4. Ouvrir une issue GitHub

---

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx Guide](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
