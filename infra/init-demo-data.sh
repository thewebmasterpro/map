#!/bin/bash

# Detailed initialization script for demo data

POCKETBASE_URL="http://localhost:8091"
TIMEOUT=60
ELAPSED=0

echo "🔧 Initializing Hagen Logistics Demo Data"
echo "=========================================="
echo ""

# Wait for PocketBase
echo "⏳ Waiting for PocketBase..."
while ! curl -s "$POCKETBASE_URL/api/health" > /dev/null 2>&1; do
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "❌ PocketBase timeout"
        exit 1
    fi
    ELAPSED=$((ELAPSED + 1))
    sleep 1
done

echo "✅ PocketBase is ready"
echo ""

# Test if we can access collections
echo "Checking collections..."
TEST=$(curl -s -X GET "$POCKETBASE_URL/api/collections" 2>&1)

if echo "$TEST" | grep -q "clients"; then
    echo "✅ Collections exist - creating demo data..."
    echo ""
    
    # Create client
    echo "→ Demo client..."
    curl -s -X POST "$POCKETBASE_URL/api/collections/clients/records" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Demo Client",
        "api_key": "demo-key-for-development",
        "allowed_origins": ["http://localhost:5175"],
        "is_active": true
      }' > /dev/null 2>&1
    
    echo "✅ Done"
    echo ""
    echo "✨ Demo initialized successfully!"
else
    echo "⚠️  Collections not found - skipping demo data"
    echo ""
    echo "📝 Please:"
    echo "1. Open http://localhost:8091/_/"
    echo "2. Create collections manually"
    echo ""
fi
