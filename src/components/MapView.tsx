import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Case } from '@/contexts/VigiaContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  cases: Case[];
  height?: string;
}

const MapView = ({ cases, height = '500px' }: MapViewProps) => {
  const center: [number, number] = cases.length > 0
    ? [cases[0].location.lat, cases[0].location.lng]
    : [-23.5505, -46.6333]; // São Paulo default

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {cases.map(caso => (
            <Marker
              key={caso.id}
              position={[caso.location.lat, caso.location.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold mb-1">{caso.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{caso.description.substring(0, 100)}...</p>
                  <Link
                    to={`/caso/${caso.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      </MapContainer>
    </div>
  );
};

export default MapView;
