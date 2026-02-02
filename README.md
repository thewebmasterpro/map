# Hagen Logistics Platform

Stack logistique hybride (Service + Livraison) pour **map.hagendigital.com**.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Coolify VPS                    │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │PocketBase│  │   OSRM   │  │     VROOM     │  │
│  │  :8090   │  │  :5000   │  │     :3000     │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │
│       │              │                │          │
│       │    ┌─────────┴────────────────┘          │
│       │    │                                     │
│  ┌────┴────┴──────────────┐                      │
│  │   API Gateway (Express)│                      │
│  │        :4000           │                      │
│  └────────────┬───────────┘                      │
│               │                                  │
│  ┌────────────┴───────────┐                      │
│  │   Frontend (React+Vite)│                      │
│  │        :5173           │                      │
│  └────────────────────────┘                      │
└─────────────────────────────────────────────────┘
```

## Quick Start

```bash
# 1. Copy environment
cp .env.example .env

# 2. Prepare OSRM data (France)
cd infra && chmod +x setup-osrm.sh && ./setup-osrm.sh

# 3. Start infrastructure
docker compose up -d

# 4. Install & start API Gateway
cd gateway && npm install && npm run dev

# 5. Install & start Frontend
cd frontend && npm install && npm run dev
```

## Project Structure

```
map/
├── docs/                    # Specification documents
├── infra/                   # Docker & infrastructure
│   ├── docker-compose.yml
│   ├── setup-osrm.sh
│   ├── osrm/               # OSRM config & data
│   └── vroom/               # VROOM config
├── pocketbase/              # PocketBase backend
│   ├── pb_migrations/       # DB schema migrations
│   └── pb_hooks/            # Server-side hooks
├── gateway/                 # Node.js/Express API Gateway
│   └── src/
│       ├── middleware/       # Auth, CORS, validation
│       ├── routes/           # API endpoints
│       ├── services/         # Business logic
│       └── mappers/          # PocketBase → VROOM mappers
└── frontend/                # React SDK + Dashboard
    └── src/
        ├── components/       # UI components
        ├── hooks/            # Custom React hooks
        ├── sdk/              # PocketBase SDK wrapper
        ├── styles/           # CSS & Tailwind
        └── types/            # TypeScript definitions
```

## Documentation

- [Architecture & Infrastructure](docs/01_ARCHITECTURE_AND_INFRA.md)
- [Backend Schema & Logic](docs/02_BACKEND_SCHEMA_AND_LOGIC.md)
- [Frontend React SDK](docs/03_FRONTEND_REACT_SDK.md)
