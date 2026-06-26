import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Calendar, MapPin, Users, Clock, Trash2 } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EVENT_CATEGORIES, formatDate } from '../utils/helpers';
import { Avatar, CategoryBadge, EmptyState, LoadingSpinner, Modal } from '../components/UI';

function EventCard({ event, onRsvp, onDelete }) {
  const { user } = useAuth();
  const rsvped = event.rsvps?.some((id) => (id._id || id) === user?._id);
  const canDelete = user && (user.role === 'admin' || String(event.organizer?._id) === String(user?._id));
  const [expandedImage, setExpandedImage] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
      <div className="p-3">
        <CategoryBadge category={event.category} />
        <h3 className="font-semibold text-lg mt-2">{event.title}</h3>
        <p className={`text-sm text-gray-500 mt-1 break-words whitespace-pre-wrap ${!descExpanded ? 'line-clamp-3' : ''}`}>{event.description}</p>
        {event.description && event.description.length > 150 && (
          <button type="button" onClick={() => setDescExpanded((s) => !s)} className="text-xs text-primary-600 mt-1">
            {descExpanded ? 'Show less' : 'Show more'}
          </button>
        )}

        {event.image && (
          <img
            src={event.image}
            alt={event.title}
            className="mt-3 rounded-lg w-20 h-16 object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setExpandedImage(event.image)}
          />
        )}

        <div className="space-y-2 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {formatDate(event.startDate)}</div>
          {event.location?.venue && (
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.location.venue}</div>
          )}
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {event.rsvps?.length || 0} going</div>
        </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Avatar user={event.organizer} size="sm" />
              <span className="text-sm">{event.organizer?.name}</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(event._id)}
                    className="rounded-full p-2 text-red-400 hover:text-red-200 transition-colors"
                    aria-label="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onRsvp(event._id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    rsvped ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30' : 'btn-primary py-2'
                  }`}
                >
                  {rsvped ? 'Going ✓' : 'RSVP'}
                </button>
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

function CreateEventModal({ open, onClose }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Meetup', venue: '',
    startDate: '', latitude: '', longitude: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ title: '', description: '', category: 'Meetup', venue: '', startDate: '', latitude: '', longitude: '' });
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
      return api.post('/events', fd);
    },
    onSuccess: () => { 
      setError(''); 
      qc.invalidateQueries(['events']); 
      onClose(); 
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || 'Failed to create event';
      setError(message);
      console.error('Event creation error:', err);
    }
  });

  return (
    <Modal open={open} onClose={onClose} title="Create Event">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
        <input className="input-field" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input-field min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {EVENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="datetime-local" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input className="input-field" placeholder="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
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
          {mutation.isPending ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </Modal>
  );
}

export default function EventsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['events', category],
    queryFn: () => api.get('/events', { params: { category: category || undefined, upcoming: true, city: 'Chandigarh' } }).then((r) => r.data),
  });

  const rsvpMutation = useMutation({
    mutationFn: (id) => api.post(`/events/${id}/rsvp`),
    onSuccess: () => qc.invalidateQueries(['events']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => qc.invalidateQueries(['events']),
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-center justify-center gap-4 sm:gap-20 border-b border-gray-800 px-6 py-5 pt-0">
        <div className="text-center">
          <h1 className="text-2xl font-bold inline-flex items-center gap-2 justify-center">
            <Calendar className="w-6 h-6 mt-0.5 text-primary-600" /> Events
          </h1>
          <p className="text-gray-500 text-sm mt-1">Discover what's happening around you</p>
        </div>
        {user && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 overflow-x-auto pb-2">
        <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${!category ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>All</button>
        {EVENT_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${category === c ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{c}</button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : (
        data?.events?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.events.map((event) => (
              <EventCard key={event._id} event={event} onRsvp={rsvpMutation.mutate} onDelete={deleteMutation.mutate} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Calendar} title="No upcoming events" description="Create an event or check back later!" />
        )
      )}

      <CreateEventModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
