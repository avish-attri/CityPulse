import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const activeIcon = L.divIcon({
  className: '',
  html: '<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.35);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function FlyToMarker({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 0.8 });
    }
  }, [position, map, zoom]);
  return null;
}

export default function MapView({ center, zoom = 14, markers = [], activeMarkerId, height = '300px', className = '' }) {
  const [lat, lng] = center || [30.7333, 76.7794];
  const activeMarker = markers.find((marker) => marker.id === activeMarkerId);

  return (
    <div className={`overflow-hidden rounded-xl ${className}`} style={{ height }}>
      <MapContainer center={[lat, lng]} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {activeMarker && <FlyToMarker position={[activeMarker.lat, activeMarker.lng]} zoom={zoom} />}
        {markers.map((m) => (
          <Marker key={m.id || `${m.lat}-${m.lng}`} position={[m.lat, m.lng]} icon={m.id === activeMarkerId ? activeIcon : defaultIcon}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
