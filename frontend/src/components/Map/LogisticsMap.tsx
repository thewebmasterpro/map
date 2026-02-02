import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
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

export function LogisticsMap({ mode, tasks, staff, onTaskClick }: LogisticsMapProps) {
  const tileUrl =
    import.meta.env.VITE_MAP_TILE_URL || "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={tileUrl}
        maxZoom={19}
        minZoom={1}
      />

      {/* Staff markers */}
      {staff.map((member) => {
        const loc = member.current_location || member.start_location;
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
        tasks.map((task) => {
          const data = task.data as ServiceData;
          if (!data.location) return null;
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
        tasks.map((task) => {
          const data = task.data as ShipmentData;
          if (!data.pickup_lat || !data.delivery_lat) return null;

          const pickupPos: [number, number] = [data.pickup_lat, data.pickup_lng];
          const deliveryPos: [number, number] = [data.delivery_lat, data.delivery_lng];

          return (
            <span key={task.id}>
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
            </span>
          );
        })}
    </MapContainer>
  );
}
