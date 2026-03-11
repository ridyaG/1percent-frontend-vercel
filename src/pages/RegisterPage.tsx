import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register(form);
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-[#FF5C00]" style={{ textShadow: '0 0 40px rgba(255,92,0,0.25)' }}>
            1%
          </h1>
          <p className="text-gray-500 text-xs tracking-[4px] mt-2">START YOUR JOURNEY TODAY</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-500/10 py-2 rounded-lg">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={form.displayName}
              onChange={update('displayName')}
              placeholder="Alex Mercer"
              required
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00] transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={update('username')}
              placeholder="alexmercer"
              required
              minLength={3}
              maxLength={30}
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00] transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              required
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00] transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="8+ characters"
              required
              minLength={8}
              className="w-full mt-1 p-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white outline-none focus:border-[#FF5C00] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-[#FF5C00] text-white font-semibold rounded-lg hover:bg-[#ff7020] disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FF5C00] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}