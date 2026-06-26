import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Compass, MessageSquare, Calendar } from 'lucide-react';
import api from '../api/client';
import { Avatar, LoadingSpinner } from '../components/UI';

export default function ProfilePage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => api.get(`/auth/users/${id}`).then((r) => r.data.user),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p className="text-center py-12 text-gray-500">User not found</p>;

  const stats = [
    { label: 'Posts', value: data.stats?.postsCount || 0, icon: FileText },
    { label: 'Discoveries', value: data.stats?.discoveriesCount || 0, icon: Compass },
    { label: 'Answers', value: data.stats?.questionsAnswered || 0, icon: MessageSquare },
    { label: 'Events', value: data.stats?.eventsCreated || 0, icon: Calendar },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-6">
      <div className="card p-8 text-center">
        <div className="flex justify-center mb-4">
          <Avatar user={data} size="lg" />
        </div>
        <h1 className="text-2xl font-bold">{data.name}</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className="w-5 h-5 text-primary-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
