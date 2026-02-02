# 🚀 Démarrage Rapide - Hagen Logistics

## ✅ Prérequis

- **Docker Desktop** installé et en cours d'exécution
- **Node.js** 20+ installé
- **npm** disponible

## 🎯 Démarrage en 1 Commande

```bash
./start-dev.sh
```

Ce script automatise:
1. ✅ Démarrage de Docker Compose (PocketBase, OSRM, VROOM)
2. ✅ Installation des dépendances (si nécessaire)
3. ✅ Lancement de l'API Gateway sur le port 4000
4. ✅ Lancement du Frontend sur le port 5173

## 📍 Accès aux Services

Une fois démarrés, accédez aux services:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5175 | Interface utilisateur |
| **API Gateway** | http://localhost:4002 | Middleware API |
| **PocketBase** | http://localhost:8091 | Base de données & Admin |
| **PocketBase Admin** | http://localhost:8091/_ | Panneau d'administration |
| **OSRM** | http://localhost:5002 | Moteur de routage |
| **VROOM** | http://localhost:3000 | Optimisation de tournées |

## 🛑 Arrêter les Services

```bash
./stop-dev.sh
```

## 📝 Démarrage Manuel (si script ne fonctionne pas)

### 1. Démarrer Docker
```bash
cd infra
docker-compose up -d
cd ..
```

### 2. Démarrer l'API Gateway
```bash
cd gateway
npm install
npm run dev
```
(Dans un nouveau terminal)

### 3. Démarrer le Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🐛 Dépannage

### ❌ "Docker is not running"
**Solution**: Lancez Docker Desktop depuis Applications

### ❌ "Cannot connect to localhost:8090"
**Solution**: Attendez 10-15 secondes que PocketBase démarre, puis rechargez

### ❌ Double `/api/api` dans les URLs
✅ **CORRIGÉ**: Les fichiers API ont été mis à jour

### ❌ PocketBase Realtime ne fonctionne pas
✅ **CORRIGÉ**: La configuration `pocketbaseClient.ts` accepte désormais les connexions dynamiques

## 📊 Configuration PocketBase

**Admin Panel**: http://localhost:8090/_/

Les collections et migrations sont automatiquement appliquées au premier démarrage.

## 🎯 Structure du Projet

```
map/
├── start-dev.sh         ← 🚀 Utiliser ceci pour démarrer
├── stop-dev.sh          ← 🛑 Pour arrêter
├── frontend/            # React Vite
├── gateway/             # Node.js Express
├── infra/               # Docker Compose
└── pocketbase/          # Migrations & hooks
```

---

**Besoin d'aide?** Consultez les docs dans le dossier `/docs`
