#!/bin/bash
set -e

echo "🚀 Hagen Logistics - Development Environment Starter"
echo "=================================================="
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "📦 Starting infrastructure (PocketBase, OSRM)..."
cd "$BASE_DIR/infra"
docker-compose up -d
cd "$BASE_DIR"

echo "✅ Infrastructure started"
sleep 3

echo "🎨 Starting VROOM Mock Service..."
cd "$BASE_DIR/gateway"
[ ! -d "node_modules" ] && npm install
node vroom-mock.js > /tmp/vroom.log 2>&1 &
VROOM_PID=$!
echo "✅ VROOM Mock running (PID: $VROOM_PID)"

cd "$BASE_DIR"
sleep 1

echo "📡 Starting API Gateway..."
cd "$BASE_DIR/gateway"
npm run dev > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
echo "✅ API Gateway running (PID: $GATEWAY_PID)"

cd "$BASE_DIR"
sleep 2

echo "🎨 Starting Frontend..."
cd "$BASE_DIR/frontend"
[ ! -d "node_modules" ] && npm install
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend running (PID: $FRONTEND_PID)"

cd "$BASE_DIR"
echo ""
echo "=================================================="
echo "✨ All services started successfully!"
echo "=================================================="
echo ""
echo "📍 Access points:"
echo "  • Frontend:     http://localhost:5175"
echo "  • API Gateway:  http://localhost:4002"
echo "  • PocketBase:   http://localhost:8091"
echo "  • OSRM:         http://localhost:5002"
echo "  • VROOM Mock:   http://localhost:3000"
echo ""
echo "📊 PocketBase Admin:"
echo "  • URL: http://localhost:8091/_/"
echo ""
