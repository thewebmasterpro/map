import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect, Fragment } from "react";
import type { Task, StaffMember, LogisticsMode, ServiceData, ShipmentData } from "../../types";

// Fix default marker icons in bundled environments
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const staffIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-180",
});

// Create default icon
const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LogisticsMapProps {
  mode: LogisticsMode;
  tasks: Task[];
  staff: StaffMember[];
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: string | null;
  showRoutes?: boolean;
  useStreetRouting?: boolean;
}

// Default center: Belgium center
const DEFAULT_CENTER: [number, number] = [50.5, 4.5];
const DEFAULT_ZOOM = 8;

interface MapContentProps {
  mode: LogisticsMode;
  tasks: Task[];
  staff: StaffMember[];
  searchResults: Array<{ lat: number; lng: number; name: string }>;
  onTaskClick?: (task: Task) => void;
  selectedTaskId?: string | null;
  showRoutes?: boolean;
  useStreetRouting?: boolean;
}
function MapContent({ mode, tasks, staff, searchResults, onTaskClick, selectedTaskId, showRoutes = true, useStreetRouting = false }: MapContentProps) {
  const map = useMap();

  useEffect(() => {
    const result = searchResults[0];
    if (result) {
      map.flyTo([result.lat, result.lng], 13, { duration: 1 });
    }
  }, [searchResults, map]);

  // Debug logging
  useEffect(() => {
    console.log("MapContent - Staff:", staff.length, staff);
    console.log("MapContent - Tasks:", tasks.length, tasks);
  }, [staff, tasks]);

  // Build ordered routes per staff using sort_order and staff_id
  const routesByStaff: Record<string, Array<[number, number]>> = {};

  // Initialize with staff start locations so polylines begin at depot
  (staff || []).forEach((s) => {
    const loc = s.start_location;
    if (loc) routesByStaff[s.id] = [[loc.lat, loc.lng]];
  });

  (tasks || [])
    .slice()
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .forEach((t) => {
      const sid = t.staff_id;
      if (!sid) return; // only build routes for assigned tasks
      if (!routesByStaff[sid]) routesByStaff[sid] = [];

      if (t.type === "service") {
        const data = t.data as ServiceData;
        if (data?.location) routesByStaff[sid].push([data.location.lat, data.location.lng]);
      } else {
        const data = t.data as ShipmentData;
        if (data?.pickup_lat && data?.pickup_lng) routesByStaff[sid].push([data.pickup_lat, data.pickup_lng]);
        if (data?.delivery_lat && data?.delivery_lng) routesByStaff[sid].push([data.delivery_lat, data.delivery_lng]);
      }
    });

  // icons for selected state
  const selectedIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [28, 46],
    iconAnchor: [14, 46],
    className: "marker-selected",
  });

  // Routed geometries (from OSRM) when useStreetRouting=true
  const [routedRoutesByStaff, setRoutedRoutesByStaff] = useState<Record<string, Array<[number, number]>>>({});

  useEffect(() => {
    if (!useStreetRouting) {
      setRoutedRoutesByStaff({});
      return;
    }

    // Compute OSRM routes for each staff sequentially
    const osrmBase = import.meta.env.VITE_OSRM_URL || "http://localhost:5002";

    const compute = async () => {
      const results: Record<string, Array<[number, number]>> = {};

      for (const [sid, coords] of Object.entries(routesByStaff)) {
        try {
          if (!coords || coords.length < 2) continue;
          // OSRM expects lon,lat pairs
          const coordStr = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");
          const url = `${osrmBase}/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`OSRM ${resp.status}`);
          const body = await resp.json();
          const geom = body?.routes?.[0]?.geometry?.coordinates;
          if (Array.isArray(geom)) {
            results[sid] = geom.map((p: [number, number]) => [p[1], p[0]]);
          }
        } catch (err) {
          console.warn("OSRM route failed for", sid, err);
        }
      }

      setRoutedRoutesByStaff(results);
    };

    compute();
  }, [useStreetRouting, JSON.stringify(routesByStaff)]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        maxZoom={19}
        minZoom={1}
      />
      
      {/* Test marker - should always be visible */}
      <Marker position={[50.8503, 4.3517]} icon={defaultIcon}>
        <Popup>
          <strong>Test Marker</strong>
        </Popup>
      </Marker>

      {/* Staff markers */}
      {staff && staff.length > 0 && staff.map((member) => {
        const loc = member.current_location || member.start_location;
        if (!loc) return null;
        return (
          <Marker key={member.id} position={[loc.lat, loc.lng]} icon={staffIcon}>
            <Popup>
              <strong>{member.name}</strong>
              <br />
              {member.is_available ? "Disponible" : "Occupé"}
            </Popup>
          </Marker>
        );
      })}

      {/* Service mode: simple markers */}
      {mode === "service" &&
        tasks &&
        tasks.length > 0 &&
        tasks.map((task) => {
          const data = task.data as ServiceData;
          if (!data || !data.location) return null;
          const isSelected = selectedTaskId === task.id;

          return (
            <Marker
              key={task.id}
              position={[data.location.lat, data.location.lng]}
              icon={isSelected ? selectedIcon : defaultIcon}
              eventHandlers={{ click: () => onTaskClick?.(task) }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Intervention</strong>
                  <br />
                  Durée : {Math.round((data.duration || 0) / 60)} min
                  <br />
                  Statut : {task.status}
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Delivery mode: pickup + delivery markers with flow arrows */}
      {mode === "delivery" &&
        tasks &&
        tasks.length > 0 &&
        tasks.map((task) => {
          const data = task.data as ShipmentData;
          if (!data || !data.pickup_lat || !data.delivery_lat) return null;

          const pickupPos: [number, number] = [data.pickup_lat, data.pickup_lng];
          const deliveryPos: [number, number] = [data.delivery_lat, data.delivery_lng];
          const isSelected = selectedTaskId === task.id;

          return (
            <Fragment key={task.id}>
                <Marker
                  position={pickupPos}
                  icon={isSelected ? selectedIcon : defaultIcon}
                  eventHandlers={{ click: () => onTaskClick?.(task) }}
                >
                  <Popup>
                    <strong>Pickup</strong> - {task.status}
                  </Popup>
                </Marker>
                <Marker
                  position={deliveryPos}
                  icon={isSelected ? selectedIcon : defaultIcon}
                  eventHandlers={{ click: () => onTaskClick?.(task) }}
                >
                  <Popup>
                    <strong>Livraison</strong> - {task.status}
                  </Popup>
                </Marker>
              {showRoutes && (
                <Polyline
                  positions={[pickupPos, deliveryPos]}
                  pathOptions={{
                    color: "#0c93e9",
                    weight: 2,
                    dashArray: "8 4",
                    className: "flow-arrow",
                  }}
                />
              )}
            </Fragment>
          );
        })}

      {/* Draw one Polyline per staff using ordered coordinates */}
      {showRoutes && Object.entries(routesByStaff).map(([sid, coords]) => {
        if (!coords || coords.length < 2) return null;
        const staffIndex = staff.findIndex((s) => s.id === sid);
        const colors = ["#0c93e9", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6"];
        const color = colors[(staffIndex > -1 ? staffIndex : 0) % colors.length];
        // Prefer routed geometry when available
        const routed = (routedRoutesByStaff && routedRoutesByStaff[sid]) || null;
        return (
          <Polyline key={`route-${sid}`} positions={routed || coords} pathOptions={{ color, weight: 3 }} />
        );
      })}
    </>
  );
}

export function LogisticsMap({ mode, tasks, staff, onTaskClick, selectedTaskId, showRoutes, useStreetRouting }: LogisticsMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; name: string }>>([]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&bounded=1&viewbox=2.3,49.5,6.4,51.5`
      );
      const results = await response.json();
      
      const formatted = results.slice(0, 5).map((r: any) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        name: r.display_name
      }));
      
      setSearchResults(formatted);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="absolute top-4 left-12 z-10 flex gap-2 bg-white rounded-lg shadow-md p-2">
        <input
          type="text"
          placeholder="Chercher une adresse..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 w-64"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          🔍
        </button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="absolute top-16 left-12 z-10 bg-white rounded-lg shadow-md p-2 w-80 max-h-48 overflow-y-auto">
          {searchResults.map((result, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchResults([{ ...result }]);
                setSearchQuery("");
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm border-b last:border-b-0"
            >
              {result.name}
            </button>
          ))}
        </div>
      )}
    
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <MapContent 
          mode={mode} 
          tasks={tasks} 
          staff={staff} 
          searchResults={searchResults}
          onTaskClick={onTaskClick}
          selectedTaskId={selectedTaskId}
          showRoutes={showRoutes}
          useStreetRouting={useStreetRouting}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
