# Roadmap B2B SaaS - Service de Planification de Routes

## 🎯 Vision

Offrir un service de planification et optimisation de routes pour d'autres SaaS via API.

---

## ✅ Déjà Implémenté

### 1. Architecture B2B

- ✅ API Gateway avec authentification
- ✅ Multi-tenant (isolation par `client_id`)
- ✅ Rate limiting par client
- ✅ Documentation API (OpenAPI/Swagger)
- ✅ Validation des entrées (Zod)
- ✅ Error handling professionnel
- ✅ Logging structuré

### 2. Endpoints API Disponibles

```
POST /api/optimize
  → Optimisation de routes avec VROOM

GET /api/tasks
  → Liste des tâches d'un client

POST /api/tasks
  → Créer une nouvelle tâche

PATCH /api/tasks/:id
  → Modifier une tâche

DELETE /api/tasks/:id
  → Supprimer une tâche

GET /api/staff
  → Liste du personnel disponible
```

---

## ❌ À Implémenter pour SaaS Complet

### Phase 6: B2B Features (5-7 jours)

#### 1. Gestion de Clients & Quotas (2j)

**Table `clients` enrichie**:

```javascript
{
  id: string,
  name: string,
  email: string,
  api_key: string,
  is_active: boolean,

  // Nouveau - Plans
  plan: 'free' | 'starter' | 'pro' | 'enterprise',

  // Nouveau - Quotas
  quotas: {
    max_requests_per_month: number,
    max_optimizations_per_day: number,
    max_tasks_per_optimization: number,
    max_concurrent_requests: number,
  },

  // Nouveau - Usage tracking
  usage: {
    requests_this_month: number,
    optimizations_today: number,
    last_reset_date: date,
  },

  // Nouveau - Billing
  stripe_customer_id?: string,
  subscription_status: 'trial' | 'active' | 'past_due' | 'cancelled',
  trial_ends_at?: date,

  // Nouveau - Webhooks
  webhook_url?: string,
  webhook_secret?: string,
}
```

**Middleware de quotas**:

```javascript
// gateway/src/middleware/quotas.js
export async function checkQuotas(req, res, next) {
  const client = req.client;

  // Check monthly requests
  if (client.usage.requests_this_month >= client.quotas.max_requests_per_month) {
    return res.status(429).json({
      error: "Monthly quota exceeded",
      quota: client.quotas.max_requests_per_month,
      usage: client.usage.requests_this_month,
      reset_date: getNextMonthFirstDay(),
    });
  }

  // Increment usage
  await incrementUsage(client.id, "requests_this_month");

  next();
}
```

#### 2. Webhooks (1j)

**Configuration**:

```javascript
// Clients peuvent configurer un webhook
{
  "webhook_url": "https://customer.com/webhooks/routes",
  "webhook_secret": "whsec_xxxxx",
  "events": ["optimization.completed", "optimization.failed"]
}
```

**Événements**:

```javascript
// gateway/src/services/webhook.js
export async function sendWebhook(clientId, event, data) {
  const client = await getClient(clientId);

  if (!client.webhook_url) return;

  const payload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    client_id: clientId,
  };

  const signature = createHmacSignature(
    payload,
    client.webhook_secret
  );

  await fetch(client.webhook_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': event,
    },
    body: JSON.stringify(payload),
  });
}

// Usage
await sendWebhook(clientId, 'optimization.completed', {
  optimization_id: 'opt_123',
  routes: [...],
  summary: {...},
});
```

#### 3. SDK/Client Libraries (2j)

**JavaScript/TypeScript SDK**:

```typescript
// @hagen/routes-sdk
import { HagenRoutesClient } from '@hagen/routes-sdk';

const client = new HagenRoutesClient({
  apiKey: 'your-api-key',
  environment: 'production', // or 'sandbox'
});

// Optimize routes
const result = await client.optimizeRoutes({
  tasks: [
    { type: 'service', address: '...', lat: 45.5, lng: -73.5 },
    { type: 'delivery', pickup: {...}, delivery: {...} },
  ],
  vehicles: [
    { id: 'v1', capacity: 100, start: {...} },
  ],
  options: {
    optimize_for: 'time', // or 'distance'
  },
});

console.log(result.routes);
console.log(result.unassigned);
console.log(result.summary);
```

**Python SDK**:

```python
# hagen-routes
from hagen_routes import HagenRoutesClient

client = HagenRoutesClient(api_key='your-api-key')

result = client.optimize_routes(
    tasks=[...],
    vehicles=[...],
)

print(result.routes)
```

#### 4. Dashboard Client (2j)

**Interface web pour clients**:

```
/dashboard
├── /overview          → Usage, quotas, stats
├── /api-keys          → Gérer clés API
├── /usage             → Historique d'utilisation
├── /billing           → Facturation, invoices
├── /webhooks          → Configuration webhooks
├── /documentation     → API docs personnalisés
└── /support           → Tickets de support
```

**Features**:

- ✅ Voir usage en temps réel
- ✅ Graphiques d'utilisation
- ✅ Générer/régénérer API keys
- ✅ Tester l'API (sandbox)
- ✅ Voir les logs d'appels
- ✅ Gérer webhooks
- ✅ Télécharger factures

#### 5. Billing & Payments (2j)

**Intégration Stripe**:

```javascript
// gateway/src/services/billing.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createSubscription(clientId, planId) {
  const client = await getClient(clientId);

  // Create Stripe customer if needed
  if (!client.stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: client.email,
      name: client.name,
      metadata: { client_id: clientId },
    });

    await updateClient(clientId, {
      stripe_customer_id: customer.id,
    });
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: client.stripe_customer_id,
    items: [{ price: planId }],
  });

  return subscription;
}
```

**Plans tarifaires**:

```javascript
const PLANS = {
  free: {
    name: "Free",
    price: 0,
    quotas: {
      max_requests_per_month: 1000,
      max_optimizations_per_day: 10,
      max_tasks_per_optimization: 50,
    },
  },
  starter: {
    name: "Starter",
    price: 49, // USD/month
    quotas: {
      max_requests_per_month: 10000,
      max_optimizations_per_day: 100,
      max_tasks_per_optimization: 200,
    },
  },
  pro: {
    name: "Pro",
    price: 199,
    quotas: {
      max_requests_per_month: 50000,
      max_optimizations_per_day: 500,
      max_tasks_per_optimization: 500,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: "custom",
    quotas: {
      max_requests_per_month: -1, // unlimited
      max_optimizations_per_day: -1,
      max_tasks_per_optimization: -1,
    },
  },
};
```

#### 6. Sandbox Environment (1j)

**Environnement de test**:

```
Production: https://api.map.hagendigital.com
Sandbox:    https://sandbox-api.map.hagendigital.com
```

**Features**:

- ✅ Données de test
- ✅ Pas de facturation
- ✅ Rate limits relaxés
- ✅ Réinitialisation facile
- ✅ API keys sandbox séparées

---

## 🔄 Flux d'Utilisation Typique

### 1. Inscription d'un Client SaaS

```
1. Client S'inscrit → map.hagendigital.com/signup
2. Choisit un plan (Free trial pour commencer)
3. Reçoit API key
4. Peut tester dans sandbox
5. Intègre dans son app
6. Upgrade vers plan payant
```

### 2. Intégration dans Application Client

```javascript
// Dans le SaaS client (ex: DeliveryApp)
import { HagenRoutesClient } from "@hagen/routes-sdk";

const routesClient = new HagenRoutesClient({
  apiKey: process.env.HAGEN_API_KEY,
});

// Quand un dispatcher crée une tournée
app.post("/dispatch/optimize", async (req, res) => {
  const { deliveries, drivers } = req.body;

  // Appel à Hagen Routes API
  const result = await routesClient.optimizeRoutes({
    tasks: deliveries.map(d => ({
      type: "delivery",
      address: d.address,
      latitude: d.lat,
      longitude: d.lng,
      pickup_address: d.warehouse_address,
      // ...
    })),
    vehicles: drivers.map(d => ({
      id: d.id,
      start_location: d.depot_location,
      // ...
    })),
  });

  // Utiliser les routes optimisées
  await assignRoutesToDrivers(result.routes);

  res.json({ success: true, routes: result.routes });
});
```

### 3. Webhooks pour Notifications

```javascript
// Le client SaaS reçoit un webhook
app.post("/webhooks/hagen-routes", (req, res) => {
  const signature = req.headers["x-webhook-signature"];

  // Vérifier signature
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).send("Invalid signature");
  }

  const { event, data } = req.body;

  switch (event) {
    case "optimization.completed":
      // Notifier le dispatcher
      notifyDispatcher(data.optimization_id);
      break;

    case "optimization.failed":
      // Logger l'erreur
      logError(data.error);
      break;
  }

  res.status(200).send("OK");
});
```

---

## 📊 Modèle Économique

### Plans & Pricing

| Plan           | Prix/mois | Optimisations/jour | Tâches max | Support   |
| -------------- | --------- | ------------------ | ---------- | --------- |
| **Free**       | $0        | 10                 | 50         | Community |
| **Starter**    | $49       | 100                | 200        | Email     |
| **Pro**        | $199      | 500                | 500        | Priority  |
| **Enterprise** | Custom    | Unlimited          | Unlimited  | Dedicated |

### Revenus Prévisionnels

Avec 100 clients:

- 50 Free = $0
- 30 Starter = $1,470/mois
- 15 Pro = $2,985/mois
- 5 Enterprise @ $500 = $2,500/mois

**Total**: ~$7,000/mois (~$84,000/an)

---

## 🎯 Go-to-Market Strategy

### 1. Cibles Primaires

**SaaS de Livraison**:

- Food delivery apps
- Grocery delivery
- Package delivery
- Meal prep delivery

**SaaS de Services**:

- Field service management
- Home services (plombiers, électriciens)
- Healthcare (visites à domicile)
- Waste management

**SaaS de Logistics**:

- TMS (Transport Management Systems)
- Fleet management
- Courier services

### 2. Proposition de Valeur

**Pour les clients**:

- ✅ Pas besoin de développer leur propre moteur d'optimisation
- ✅ API simple et documentée
- ✅ Économie de 80% vs solution custom
- ✅ Scalable (de 10 à 10,000 optimisations/jour)
- ✅ Toujours à jour (algorithmes améliorés)
- ✅ Support technique

### 3. Canaux de Distribution

1. **Developer-first**:
   - Documentation excellente
   - SDK dans tous les langages populaires
   - Tutoriels et examples
   - Sandbox pour tester

2. **Content Marketing**:
   - Blog: "How to optimize delivery routes"
   - Case studies
   - API comparisons
   - Benchmarks

3. **Partnerships**:
   - Intégrations avec Stripe, Shopify, etc.
   - App stores (Zapier, Make)

4. **Sales Direct**:
   - Outreach vers SaaS cibles
   - Démos personnalisées
   - Trials étendus

---

## 🔧 Implémentation Prioritaire

### MVP B2B (2 semaines)

**Semaine 1**:

- [ ] Enrichir table clients (quotas, plans)
- [ ] Middleware de quotas
- [ ] Dashboard client basique
- [ ] SDK JavaScript

**Semaine 2**:

- [ ] Webhooks
- [ ] Stripe integration
- [ ] Sandbox environment
- [ ] Documentation B2B complète

### Post-MVP (1 mois)

**Mois 1**:

- [ ] SDK Python
- [ ] SDK PHP
- [ ] Analytics avancés
- [ ] Usage-based billing
- [ ] White-label option

---

## 📚 Documentation B2B

### Structure

```
/docs
├── /getting-started
│   ├── quickstart.md
│   ├── authentication.md
│   └── first-optimization.md
│
├── /api-reference
│   ├── optimize.md
│   ├── tasks.md
│   └── webhooks.md
│
├── /sdks
│   ├── javascript.md
│   ├── python.md
│   └── php.md
│
├── /guides
│   ├── handling-large-datasets.md
│   ├── webhook-best-practices.md
│   └── error-handling.md
│
└── /examples
    ├── delivery-app.md
    ├── field-service.md
    └── logistics-platform.md
```

---

## 🎊 Conclusion

**État actuel**: 70% B2B-ready
**Manque**: Quotas, Billing, Webhooks, SDK, Dashboard

**Avec Phase 6**: 100% B2B SaaS complet

Voulez-vous que je commence la **Phase 6 - B2B Features** ? 🚀
