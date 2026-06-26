import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Activity, Compass, Calendar, Navigation } from 'lucide-react';
import api from '../api/client';
import { getUserLocation } from '../utils/helpers';
import { CategoryBadge, LoadingSpinner } from '../components/UI';
import MapView from '../components/MapView';

export default function NearbyPage() {
  const [location, setLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('pulse');

  useEffect(() => {
    getUserLocation().then(setLocation);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['nearby', location],
    queryFn: () =>
      api.get('/nearby', {
        params: { lng: location.lng, lat: location.lat, radius: 'city', city: 'Chandigarh' },
      }).then((r) => r.data),
    enabled: !!location,
  });

  const [selectedId, setSelectedId] = useState(null);

  const tabs = [
    { id: 'pulse', label: 'Pulse', icon: Activity, data: data?.pulse },
    { id: 'discoveries', label: 'Gems', icon: Compass, data: data?.discoveries },
    { id: 'events', label: 'Events', icon: Calendar, data: data?.events },
  ];

  const markers = (data?.[activeTab === 'discoveries' ? 'discoveries' : activeTab] || [])
    .filter((item) => item.location?.coordinates)
    .map((item) => ({
      id: item._id,
      lat: item.location.coordinates[1],
      lng: item.location.coordinates[0],
      popup: item.title,
    }));

  const activeData = tabs.find((t) => t.id === activeTab)?.data || [];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center justify-center gap-4 sm:gap-20 border-b border-gray-800 px-6 py-5 pt-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold inline-flex items-center gap-2 justify-center">
            <Navigation className="w-6 h-6 mt-0.5 text-primary-600" /> Nearby
          </h1>
          <p className="text-gray-500 text-sm mt-1">Discover what's happening around you</p>
        </div>
      </div>

      {location && (
        <MapView
          center={[location.lat, location.lng]}
          markers={[{ id: 'user', lat: location.lat, lng: location.lng, popup: 'You are here' }, ...markers]}
          activeMarkerId={selectedId}
          height="250px"
        />
      )}

      <div className="flex flex-wrap justify-center gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : (
        activeData.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeData.map((item) => (
                    <NearbyCard key={item._id} item={item} selectedId={selectedId} setSelectedId={setSelectedId} />
                  ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Nothing nearby right now.</p>
        )
      )}
    </div>
  );
}

function NearbyCard({ item, selectedId, setSelectedId }) {
  const [descExpanded, setDescExpanded] = useState(false);
  return (
    <div
      onClick={() => setSelectedId(item._id)}
      className={`card p-3 cursor-pointer transition-shadow ${selectedId === item._id ? 'shadow-lg border-primary-500 border' : 'hover:shadow-lg'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{item.title}</h3>
        {item.category && <CategoryBadge category={item.category} />}
      </div>
      <p className={`text-sm text-gray-500 mt-1 break-words whitespace-pre-wrap ${!descExpanded ? 'line-clamp-3' : ''}`}>{item.description || item.content}</p>
      {item.description && item.description.length > 150 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); setDescExpanded((s) => !s); }} className="text-xs text-primary-600 mt-1">
          {descExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
      {item.location?.area && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
          <MapPin className="w-3 h-3" /> {item.location.area}
        </div>
      )}
    </div>
  );
}
