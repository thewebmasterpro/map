#!/bin/bash

# Script d'insertion de données de démo - 10 Services + 10 Livraisons à Bruxelles
# Utilisation: bash infra/demo-data-brussels.sh

API_KEY="demo-key-for-development"
GATEWAY_URL="http://localhost:4002"

echo "🇧🇪 Insertion de 20 tâches de démo à Bruxelles..."

# ─── DONNÉES CLIENTS ───────────────────────────────────
# Supposé déjà créé, mais voici l'ID pour référence:
CLIENT_ID="6xx1tukvlx4s9co"

# ─── DONNÉES STAFF ───────────────────────────────────
# 3 drivers pour Bruxelles

DRIVER_1_ID="driver_001"  # Sera créé
DRIVER_2_ID="driver_002"  # Sera créé
DRIVER_3_ID="driver_003"  # Será créé

# ─── 10 SERVICES À BRUXELLES ───────────────────────
echo "📍 Création de 10 services..."

SERVICES=(
  # Service 1: Ixelles - Visite maintenance
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8348, "lng": 4.3756},
      "duration": 900,
      "description": "Maintenance système de climatisation",
      "address": "Avenue Louise, 1050 Ixelles"
    }
  }'
  
  # Service 2: Woluwe - Installation équipement
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8580, "lng": 4.4245},
      "duration": 1200,
      "description": "Installation système de sécurité",
      "address": "Rue de Tervuren, 1200 Woluwe-Saint-Lambert"
    }
  }'
  
  # Service 3: Etterbeek - Dépannage
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8389, "lng": 4.4056},
      "duration": 600,
      "description": "Dépannage urgence chauffage",
      "address": "Chaussée de Wavre, 1050 Etterbeek"
    }
  }'
  
  # Service 4: Schaerbeek - Inspection
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8618, "lng": 4.3811},
      "duration": 450,
      "description": "Inspection électrique périodique",
      "address": "Rue Royale, 1210 Schaerbeek"
    }
  }'
  
  # Service 5: Saint-Josse - Réparation
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8474, "lng": 4.3689},
      "duration": 750,
      "description": "Réparation plomberie",
      "address": "Boulevard de Berlaimont, 1210 Saint-Josse"
    }
  }'
  
  # Service 6: Bruxelles Centre - Visite client
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8503, "lng": 4.3517},
      "duration": 600,
      "description": "Visite de prospection",
      "address": "Rue de la Madeleine, 1000 Bruxelles"
    }
  }'
  
  # Service 7: Anderlecht - Maintenance
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8365, "lng": 4.3218},
      "duration": 800,
      "description": "Maintenance préventive système HVAC",
      "address": "Chaussée de Mons, 1070 Anderlecht"
    }
  }'
  
  # Service 8: Laeken - Installation
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8805, "lng": 4.3639},
      "duration": 1000,
      "description": "Installation ascenseur",
      "address": "Avenue du Berceau Royal, 1020 Laeken"
    }
  }'
  
  # Service 9: Uccle - Diagnostic
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8011, "lng": 4.3522},
      "duration": 500,
      "description": "Diagnostic toiture",
      "address": "Chaussée de Waterloo, 1180 Uccle"
    }
  }'
  
  # Service 10: Forest - Entretien
  '{
    "type": "service",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "location": {"lat": 50.8152, "lng": 4.3351},
      "duration": 700,
      "description": "Entretien annuel contrat",
      "address": "Rue de Trèves, 1190 Forest"
    }
  }'
)

# ─── 10 LIVRAISONS À BRUXELLES ───────────────────────
echo "📦 Création de 10 livraisons..."

SHIPMENTS=(
  # Livraison 1: Ixelles → Centre
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8348,
      "pickup_lng": 4.3756,
      "delivery_lat": 50.8503,
      "delivery_lng": 4.3517,
      "weight": 12,
      "volume": 0.15,
      "description": "Fournitures bureautique",
      "pickup_address": "Avenue Louise, Ixelles",
      "delivery_address": "Rue de la Madeleine, Bruxelles-Centre"
    }
  }'
  
  # Livraison 2: Woluwe → Etterbeek
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8580,
      "pickup_lng": 4.4245,
      "delivery_lat": 50.8389,
      "delivery_lng": 4.4056,
      "weight": 8,
      "volume": 0.08,
      "description": "Matériel informatique",
      "pickup_address": "Rue de Tervuren, Woluwe",
      "delivery_address": "Chaussée de Wavre, Etterbeek"
    }
  }'
  
  # Livraison 3: Centre → Schaerbeek
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8503,
      "pickup_lng": 4.3517,
      "delivery_lat": 50.8618,
      "delivery_lng": 4.3811,
      "weight": 5,
      "volume": 0.05,
      "description": "Documents juridiques",
      "pickup_address": "Rue de la Madeleine, Bruxelles",
      "delivery_address": "Rue Royale, Schaerbeek"
    }
  }'
  
  # Livraison 4: Saint-Josse → Anderlecht
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8474,
      "pickup_lng": 4.3689,
      "delivery_lat": 50.8365,
      "delivery_lng": 4.3218,
      "weight": 15,
      "volume": 0.20,
      "description": "Pièces détachées industrielles",
      "pickup_address": "Boulevard de Berlaimont, Saint-Josse",
      "delivery_address": "Chaussée de Mons, Anderlecht"
    }
  }'
  
  # Livraison 5: Laeken → Uccle
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8805,
      "pickup_lng": 4.3639,
      "delivery_lat": 50.8011,
      "delivery_lng": 4.3522,
      "weight": 20,
      "volume": 0.30,
      "description": "Équipement de construction",
      "pickup_address": "Avenue du Berceau Royal, Laeken",
      "delivery_address": "Chaussée de Waterloo, Uccle"
    }
  }'
  
  # Livraison 6: Forest → Ixelles
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8152,
      "pickup_lng": 4.3351,
      "delivery_lat": 50.8348,
      "delivery_lng": 4.3756,
      "weight": 10,
      "volume": 0.10,
      "description": "Colis postal",
      "pickup_address": "Rue de Trèves, Forest",
      "delivery_address": "Avenue Louise, Ixelles"
    }
  }'
  
  # Livraison 7: Etterbeek → Woluwe
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8389,
      "pickup_lng": 4.4056,
      "delivery_lat": 50.8580,
      "delivery_lng": 4.4245,
      "weight": 7,
      "volume": 0.07,
      "description": "Fournitures médicales",
      "pickup_address": "Chaussée de Wavre, Etterbeek",
      "delivery_address": "Rue de Tervuren, Woluwe-Saint-Lambert"
    }
  }'
  
  # Livraison 8: Schaerbeek → Forest
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8618,
      "pickup_lng": 4.3811,
      "delivery_lat": 50.8152,
      "delivery_lng": 4.3351,
      "weight": 6,
      "volume": 0.06,
      "description": "Impression et documents",
      "pickup_address": "Rue Royale, Schaerbeek",
      "delivery_address": "Rue de Trèves, Forest"
    }
  }'
  
  # Livraison 9: Anderlecht → Centre
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8365,
      "pickup_lng": 4.3218,
      "delivery_lat": 50.8503,
      "delivery_lng": 4.3517,
      "weight": 11,
      "volume": 0.12,
      "description": "Marchandises générales",
      "pickup_address": "Chaussée de Mons, Anderlecht",
      "delivery_address": "Rue de la Madeleine, Bruxelles-Centre"
    }
  }'
  
  # Livraison 10: Uccle → Laeken
  '{
    "type": "shipment",
    "status": "pending",
    "client_id": "'$CLIENT_ID'",
    "data": {
      "pickup_lat": 50.8011,
      "pickup_lng": 4.3522,
      "delivery_lat": 50.8805,
      "delivery_lng": 4.3639,
      "weight": 18,
      "volume": 0.25,
      "description": "Livraison urgente",
      "pickup_address": "Chaussée de Waterloo, Uccle",
      "delivery_address": "Avenue du Berceau Royal, Laeken"
    }
  }'
)

# ─── INSERTION DES DONNÉES ───────────────────────────
echo ""
echo "📤 Envoi des 10 services..."
for i in "${!SERVICES[@]}"; do
  SERVICE="${SERVICES[$i]}"
  RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/tasks" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$SERVICE")
  
  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "  ✅ Service $((i+1)) créé"
  else
    echo "  ❌ Service $((i+1)) échoué: $RESPONSE"
  fi
done

echo ""
echo "📤 Envoi des 10 livraisons..."
for i in "${!SHIPMENTS[@]}"; do
  SHIPMENT="${SHIPMENTS[$i]}"
  RESPONSE=$(curl -s -X POST "$GATEWAY_URL/api/tasks" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$SHIPMENT")
  
  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "  ✅ Livraison $((i+1)) créée"
  else
    echo "  ❌ Livraison $((i+1)) échouée: $RESPONSE"
  fi
done

echo ""
echo "✅ Insertion terminée!"
echo "📊 Vérification des données..."
curl -s "$GATEWAY_URL/api/tasks" \
  -H "x-api-key: $API_KEY" | jq '{total: .total, items: (.items | length), types: (.items | group_by(.type) | map({type: .[0].type, count: length}))}'
