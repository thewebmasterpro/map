#!/bin/bash

echo "🛑 Stopping Hagen Logistics development environment..."
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Stopping Docker infrastructure..."
cd "$BASE_DIR/infra"
docker-compose down

cd "$BASE_DIR"
echo "✅ All services stopped"
