import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PulsePage from './pages/PulsePage';
import DiscoverPage from './pages/DiscoverPage';
import AskPage from './pages/AskPage';
import EventsPage from './pages/EventsPage';
import NearbyPage from './pages/NearbyPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import { LoadingSpinner } from './components/UI';

function ProtectedRoute({ children, admin }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (admin && !isAdmin) return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<PulsePage />} />
        <Route path="pulse" element={<PulsePage />} />
        <Route path="discover" element={<DiscoverPage />} />
        <Route path="ask" element={<AskPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="nearby" element={<NearbyPage />} />
        <Route path="profile/:id" element={<ProfilePage />} />
        <Route path="admin" element={<ProtectedRoute admin><AdminPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
