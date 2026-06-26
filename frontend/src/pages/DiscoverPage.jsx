import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Compass, Star, MapPin, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DISCOVERY_CATEGORIES } from '../utils/helpers';
import { Avatar, CategoryBadge, StarRating, EmptyState, LoadingSpinner, Modal } from '../components/UI';

function DiscoveryCard({ item, onRate, onDelete }) {
  const { user } = useAuth();
  const canDelete = user && (user.role === 'admin' || String(item.author?._id) === String(user?._id));
  const [expandedImage, setExpandedImage] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <CategoryBadge category={item.category} />
          <StarRating rating={item.averageRating} count={item.ratings?.length} />
        </div>
        <h3 className="font-semibold text-lg mt-2">{item.title}</h3>
        <p className={`text-sm text-gray-500 mt-1 break-words whitespace-pre-wrap ${!descExpanded ? 'line-clamp-3' : ''}`}>{item.description}</p>
        {item.description && item.description.length > 150 && (
          <button type="button" onClick={() => setDescExpanded((s) => !s)} className="text-xs text-primary-600 mt-1">
            {descExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {item.images?.[0] && (
          <img
            src={item.images[0]}
            alt={item.title}
            className="mt-3 rounded-lg w-20 h-16 object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setExpandedImage(item.images[0])}
          />
        )}

        <div className="flex flex-wrap gap-1.5 mt-3">
            {(item.tags || []).slice(0, 5).map((tag) => (
              <span key={tag} className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">#{tag}</span>
            ))}
          </div>

          {item.location?.area && (
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" /> {item.location.area}
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Avatar user={item.author} size="sm" />
              <span className="text-sm">{item.author?.name}</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => onRate(item._id, s)} className="text-amber-400 hover:scale-110 transition-transform">
                      <Star className={`w-4 h-4 ${s <= (item.ratings?.find((r) => String(r.user._id || r.user) === String(user._id))?.score || 0) ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item._id)}
                    className="rounded-full p-2 text-red-400 hover:text-red-200 transition-colors"
                    aria-label="Delete discovery"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      {expandedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="" className="max-w-3xl max-h-screen object-contain rounded-lg" />
        </div>
      )}
    </motion.div>
  );
}

function CreateDiscoveryModal({ open, onClose }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', category: 'Cafe', area: '', tags: '', latitude: '', longitude: '' });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setForm((f) => ({ ...f, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }));
          setLocating(false);
        },
        (err) => {
          setError('Unable to get location. Please enable location services.');
          setLocating(false);
          console.error('Geolocation error:', err);
        }
      );
    } else {
      setError('Geolocation not supported by your browser');
      setLocating(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('city', user?.city || 'Chandigarh');
      images.forEach((img) => fd.append('images', img));
      return api.post('/discover', fd);
    },
    onSuccess: () => { 
      setError(''); 
      qc.invalidateQueries(['discoveries']); 
      onClose(); 
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || 'Failed to share discovery';
      setError(message);
      console.error('Discovery creation error:', err);
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Share Hidden Gem">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
        <input className="input-field" placeholder="Place name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input-field min-h-[100px]" placeholder="Tell us about this place..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {DISCOVERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="input-field" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <input className="input-field" placeholder="Area (optional)" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input className="input-field" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          </div>
          <div className="flex-1">
            <input className="input-field" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
        </div>
        <button type="button" onClick={getLocation} disabled={locating} className="btn-secondary w-full">
          {locating ? 'Getting location...' : '📍 Use Current Location'}
        </button>

        <input type="file" accept="image/*" multiple onChange={(e) => setImages([...e.target.files])} className="text-sm" />
        <button type="submit" disabled={mutation.isPending || !form.latitude || !form.longitude} className="btn-primary w-full">
          {mutation.isPending ? 'Sharing...' : 'Share Discovery'}
        </button>
      </form>
    </Modal>
  );
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['discoveries', category],
    queryFn: () => api.get('/discover', { params: { category: category || undefined, city: 'Chandigarh' } }).then((r) => r.data),
  });

  const rateMutation = useMutation({
    mutationFn: ({ id, score }) => api.post(`/discover/${id}/rate`, { score }),
    onSuccess: () => qc.invalidateQueries(['discoveries']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/discover/${id}`),
    onSuccess: () => qc.invalidateQueries(['discoveries']),
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center justify-center gap-4 sm:gap-20 border-b border-gray-800 px-6 py-5 pt-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 justify-center text-white">
            <Compass className="w-6 h-6 text-primary-600" /> Discover
          </h1>
          <p className="text-gray-500 text-sm mt-1 text-center">Hidden gems curated by locals</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Share Gem
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 overflow-x-auto pb-2">
        <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${!category ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>All</button>
        {DISCOVERY_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{c}</button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : (
        data?.discoveries?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.discoveries.map((item) => (
              <DiscoveryCard key={item._id} item={item} onRate={(id, score) => rateMutation.mutate({ id, score })} onDelete={(id) => deleteMutation.mutate(id)} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Compass} title="No discoveries yet" description="Share your favorite hidden spots with the community!" />
        )
      )}

      <CreateDiscoveryModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
