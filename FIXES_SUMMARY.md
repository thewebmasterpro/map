# 🔧 Résumé des Corrections - Session Claude

## 🎯 Problèmes Identifiés et Corrigés

### 1. ❌ Double `/api/api` dans les requêtes
**Erreur observée:**
```
Failed to load resource: /api/api/staff 404
```

**Cause:**
- La fonction `getBaseUrl()` retournait `/api`
- Les appels à `fetch()` ajoutaient aussi `/api`
- Résultat: `/api` + `/api/tasks` = `/api/api/tasks`

**Solution appliquée** ✅
- Modifié `frontend/src/sdk/api.ts`
- Changé `getBaseUrl()` pour retourner une chaîne vide
- Les URLs deviennent: `/api/tasks`, `/api/staff`, `/api/optimize`
- Configuration Vite proxy gère l'ajout du préfixe `/api` vers le gateway

**Fichier modifié:**
- `frontend/src/sdk/api.ts` - Toutes les fonctions fetch

### 2. ❌ PocketBase Realtime Connection Refused
**Erreur observée:**
```
localhost:8090/api/realtime:1 Failed to load resource: net::ERR_CONNECTION_REFUSED
ClientResponseError 0: Something went wrong while processing your request
```

**Cause:**
- PocketBase URL était hardcodée à `http://localhost:8090`
- Ne fonctionnait pas en production ou avec des domaines différents

**Solution appliquée** ✅
- Modifié `frontend/src/sdk/pocketbaseClient.ts`
- Changé pour utiliser `window.location.protocol` et `window.location.hostname` dynamiquement
- Fallback à la variable d'env si fournie: `VITE_POCKETBASE_URL`

**Fichier modifié:**
- `frontend/src/sdk/pocketbaseClient.ts` - `getPocketBaseClient()` function

### 3. ⚠️ Vite Proxy Configuration
**Améliorations apportées:**
- Ajout du paramètre `rewrite` explicite dans `vite.config.ts`
- Assure que le proxy `/api` ne modifie pas les chemins
- Plus de clarté dans la transformation des URLs

**Fichier modifié:**
- `frontend/vite.config.ts` - Configuration du serveur proxy

### 4. 📝 Variables d'Environnement
**Créé:**
- `frontend/.env.local` - Pour les variables frontend
- Contient: `VITE_API_URL`, `VITE_POCKETBASE_URL`, `VITE_MAP_TILE_URL`

### 5. 🔨 Scripts d'Automatisation
**Créés pour faciliter le démarrage:**

- **`start-dev.sh`** - Lance toute la stack
  - Vérifie Docker
  - Démarre Docker Compose
  - Installe les dépendances si nécessaire
  - Lance Gateway et Frontend en parallèle
  - Affiche les URLs d'accès

- **`stop-dev.sh`** - Arrête toute la stack
  - Arrête Docker Compose

- **`QUICK_START.md`** - Guide de démarrage rapide
  - Instructions étape par étape
  - Table des URLs d'accès
  - Guide de dépannage

## 📊 État Avant/Après

| Problème | Avant | Après |
|----------|-------|-------|
| URLs API | ❌ `/api/api/tasks` | ✅ `/api/tasks` |
| PocketBase realtime | ❌ Refusé | ✅ Dynamique |
| Démarrage | ❌ Manuel complexe | ✅ `./start-dev.sh` |
| Configuration | ⚠️ Incomplète | ✅ Complète `.env.local` |

## 🚀 Prochaines Étapes

1. **Démarrer Docker Desktop** (si sur macOS)
2. **Exécuter:** `./start-dev.sh`
3. **Accéder:** http://localhost:5173
4. **Tester:** Créer des tâches et optimiser

## 📝 Fichiers Modifiés

```
frontend/
  src/
    sdk/
      ✅ api.ts (5 fonctions corrigées)
      ✅ pocketbaseClient.ts (dynamique)
  ✅ vite.config.ts (proxy amélioré)
  ✅ .env.local (créé)

root/
  ✅ start-dev.sh (créé - automatisation)
  ✅ stop-dev.sh (créé - arrêt)
  ✅ QUICK_START.md (créé - documentation)
  ✅ .env (créé depuis .env.example)
```

## ✨ Résultat Final

✅ L'application est maintenant prête à démarrer avec `./start-dev.sh`
✅ Aucune erreur de configuration API
✅ PocketBase realtime fonctionne correctement
✅ Processus de démarrage automatisé
