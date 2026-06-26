import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const normalizedForm = {
      ...form,
      email: form.email.toLowerCase().trim(),
    };

    try {
      if (isLogin) {
        await login(normalizedForm.email, normalizedForm.password);
      } else {
        await register(normalizedForm);
      }
      navigate('/pulse');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-accent items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <span className="text-3xl font-bold">CityPulse</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight">Your city's live social layer</h2>
          <p className="mt-4 text-primary-100 text-lg leading-relaxed">
            Discover real-time updates, hidden gems, local Q&A, and events — all powered by your community.
          </p>
          <div className="mt-8 space-y-3">
            {['Real-time city pulse updates', 'Community-curated discoveries', 'Location-aware nearby feed'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-primary-100">
                <ArrowRight className="w-4 h-4" /> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Activity className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold">CityPulse</span>
          </div>

          <h1 className="text-2xl font-bold">{isLogin ? 'Welcome back' : 'Join CityPulse'}</h1>
          <p className="text-gray-500 mt-1 mb-6">{isLogin ? 'Sign in to your account' : 'Create your account'}</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input className="input-field pl-11" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="email" className="input-field pl-11" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input type="password" className="input-field pl-11" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary-600 font-medium hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <Link to="/pulse" className="block text-center text-sm text-gray-400 mt-4 hover:text-primary-600">
            Continue as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}
