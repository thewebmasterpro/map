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

interface LogisticsMapProps {
  mode: LogisticsMode;
  tasks: Task[];
  staff: StaffMember[];
  onTaskClick?: (task: Task) => void;
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
}

function MapContent({ mode, tasks, staff, searchResults, onTaskClick }: MapContentProps) {
  const map = useMap();

  useEffect(() => {
    if (searchResults.length > 0) {
      const result = searchResults[0];
      map.flyTo([result.lat, result.lng], 13, { duration: 1 });
    }
  }, [searchResults, map]);

  // Debug logging
  useEffect(() => {
    console.log("MapContent - Staff:", staff.length, staff);
    console.log("MapContent - Tasks:", tasks.length, tasks);
  }, [staff, tasks]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        maxZoom={19}
        minZoom={1}
      />

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
          return (
            <Marker
              key={task.id}
              position={[data.location.lat, data.location.lng]}
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

          return (
            <Fragment key={task.id}>
              <Marker
                position={pickupPos}
                eventHandlers={{ click: () => onTaskClick?.(task) }}
              >
                <Popup>
                  <strong>Pickup</strong> - {task.status}
                </Popup>
              </Marker>
              <Marker
                position={deliveryPos}
                eventHandlers={{ click: () => onTaskClick?.(task) }}
              >
                <Popup>
                  <strong>Livraison</strong> - {task.status}
                </Popup>
              </Marker>
              <Polyline
                positions={[pickupPos, deliveryPos]}
                pathOptions={{
                  color: "#0c93e9",
                  weight: 2,
                  dashArray: "8 4",
                  className: "flow-arrow",
                }}
              />
            </Fragment>
          );
        })}
    </>
  );
}

export function LogisticsMap({ mode, tasks, staff, onTaskClick }: LogisticsMapProps) {
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
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
