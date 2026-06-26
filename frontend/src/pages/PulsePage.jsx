import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, MapPin, TrendingUp, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PULSE_CATEGORIES, timeAgo } from '../utils/helpers';
import { Avatar, CategoryBadge, EmptyState, LoadingSpinner, Modal } from '../components/UI';

function PulseCard({ post, onConfirm, onDelete, onResolve }) {
  const { user } = useAuth();
  const confirmed = post.confirmations?.some((id) => String(id._id || id) === String(user?._id));
  const canDelete = user && (user.role === 'admin' || String(post.author?._id) === String(user?._id));
  const [expandedImage, setExpandedImage] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar user={post.author} size="sm" />
          <div>
            <p className="font-medium text-sm">{post.author?.name}</p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <CategoryBadge category={post.category} />
      </div>

      <h3 className="font-semibold text-lg mt-3">{post.title}</h3>
      <p className={`text-gray-600 dark:text-gray-400 mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap ${!descExpanded ? 'line-clamp-3' : ''}`}>{post.description}</p>
      {post.description && post.description.length > 150 && (
        <button type="button" onClick={() => setDescExpanded((s) => !s)} className="text-xs text-primary-600 mt-1">
          {descExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {post.image && (
        <>
          <img 
            src={post.image} 
            alt="" 
            className="mt-2 rounded-lg w-20 h-16 object-cover cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setExpandedImage(post.image)}
          />
          {expandedImage && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setExpandedImage(null)}>
              <img src={expandedImage} alt="" className="max-w-3xl max-h-screen object-contain rounded-lg" />
            </div>
          )}
        </>
      )}

      {post.location?.area && (
        <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
          <MapPin className="w-4 h-4" /> {post.location.area}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="text-sm text-gray-400">{post.confirmations?.length || 0} confirmed</div>
        {user && (
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(post._id)}
                className="rounded-full p-2 text-red-400 hover:text-red-200 transition-colors"
                aria-label="Delete pulse post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={() => onResolve(post._id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-blue-100 text-blue-700 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800"
                aria-label="Resolve pulse post"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Resolved?
              </button>
            )}
            <button
              onClick={() => onConfirm(post._id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                confirmed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" /> {confirmed ? 'Unconfirm' : 'Confirm'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CreatePulseModal({ open, onClose }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', category: '', area: '', latitude: '', longitude: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ title: '', description: '', category: '', area: '', latitude: '', longitude: '' });
      setImage(null);
      setError('');
    }
  }, [open]);

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
      if (image) fd.append('image', image);
      return api.post('/pulse', fd);
    },
    onSuccess: () => { 
      setError(''); 
      qc.invalidateQueries(['pulse']); 
      onClose(); 
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || 'Failed to post update';
      setError(message);
      console.error('Upload error:', err);
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Share City Update">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
        <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input-field min-h-[100px]" placeholder="What's happening?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <div className="flex gap-2">
          <select className="input-field flex-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
            <option value="">Select category</option>
            {PULSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input className="input-field" placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
        
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

        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-sm" />
        <button type="submit" disabled={mutation.isPending || !form.latitude || !form.longitude} className="btn-primary w-full">
          {mutation.isPending ? 'Posting...' : 'Post Update'}
        </button>
      </form>
    </Modal>
  );
}

export default function PulsePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pulse', category],
    queryFn: () => api.get('/pulse', { params: { category: category || undefined, city: 'Chandigarh' } }).then((r) => r.data),
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => api.post(`/pulse/${id}/confirm`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pulse'], exact: false }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => api.post(`/pulse/${id}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pulse'], exact: false }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/pulse/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pulse'], exact: false }),
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center justify-center gap-4 sm:gap-20 border-b border-gray-800 px-6 py-5 pt-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 justify-center text-white">
            <TrendingUp className="w-6 h-6 text-primary-600" /> City Pulse
          </h1>
          <p className="text-gray-500 text-sm mt-1 text-center">Real-time updates from your city</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Post Update
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 overflow-x-auto pb-2">
        <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${!category ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
          All
        </button>
        {PULSE_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
            {c}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : (
        data?.posts?.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <PulseCard key={post._id} post={post} onConfirm={confirmMutation.mutate} onResolve={resolveMutation.mutate} onDelete={deleteMutation.mutate} />
            ))}
          </div>
        ) : (
          <EmptyState icon={TrendingUp} title="No updates yet" description="Be the first to share what's happening in your city!" action={user && <button onClick={() => setShowCreate(true)} className="btn-primary">Post Update</button>} />
        )
      )}

      <CreatePulseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
