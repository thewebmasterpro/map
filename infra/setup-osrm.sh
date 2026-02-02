#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# OSRM Data Preparation Script - France
# Downloads and processes OpenStreetMap data for OSRM routing
# ============================================================

DATA_DIR="./osrm/data"
PBF_URL="https://download.geofabrik.de/europe/france-latest.osm.pbf"
PBF_FILE="$DATA_DIR/france-latest.osm.pbf"
OSRM_IMAGE="osrm/osrm-backend:latest"

echo "=== Hagen Logistics - OSRM Setup ==="
echo ""

# Create data directory
mkdir -p "$DATA_DIR"

# Step 1: Download France OSM data
if [ -f "$PBF_FILE" ]; then
    echo "[1/4] france-latest.osm.pbf already exists, skipping download."
else
    echo "[1/4] Downloading France OSM data from Geofabrik..."
    wget -c "$PBF_URL" -O "$PBF_FILE"
fi

# Step 2: Extract
echo "[2/4] Running osrm-extract (this may take a while)..."
docker run --rm -t \
    -v "$(pwd)/$DATA_DIR:/data" \
    "$OSRM_IMAGE" \
    osrm-extract -p /opt/car.lua /data/france-latest.osm.pbf

# Step 3: Partition
echo "[3/4] Running osrm-partition..."
docker run --rm -t \
    -v "$(pwd)/$DATA_DIR:/data" \
    "$OSRM_IMAGE" \
    osrm-partition /data/france-latest.osrm

# Step 4: Customize
echo "[4/4] Running osrm-customize..."
docker run --rm -t \
    -v "$(pwd)/$DATA_DIR:/data" \
    "$OSRM_IMAGE" \
    osrm-customize /data/france-latest.osrm

echo ""
echo "=== OSRM data ready! ==="
echo "You can now start the stack with: docker compose up -d"
