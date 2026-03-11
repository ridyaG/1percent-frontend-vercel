import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authApi.login({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8">
        <h1 className="text-5xl font-bold text-[#FF5C00] text-center mb-2">1%</h1>
        <p className="text-gray-500 text-center text-sm mb-8 tracking-widest">
          GET 1% BETTER EVERY DAY
        </p>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-[#1a1a1a] border border-white/10 rounded-lg
                       text-white outline-none focus:border-[#FF5C00]"
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-[#1a1a1a] border border-white/10 rounded-lg
                       text-white outline-none focus:border-[#FF5C00]"
          />
          <button
            type="submit" disabled={loading}
            className="w-full p-3 bg-[#FF5C00] text-white font-semibold rounded-lg
                       hover:bg-[#ff7020] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-6">
          No account? <Link to="/register" className="text-[#FF5C00]">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
