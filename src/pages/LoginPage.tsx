import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, ArrowRight, Flame } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error, setError]        = useState('');
  const [loading, setLoading]    = useState(false);
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'transparent' }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,122,24,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-[960px] relative animate-fade-in">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden lg:block pr-6">
            <div className="eyebrow mb-4">
              <Flame size={14} />
              Build consistency
            </div>
            <h1 className="mb-4">Show up daily and make progress feel tangible.</h1>
            <p className="section-copy text-base">
              Track your streaks, share wins, and stay connected to a community built around steady improvement.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Track streaks clearly', 'Post wins in seconds', 'Explore trending growth', 'Stay motivated daily'].map((item) => (
                <div key={item} className="glass-panel px-4 py-4 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm justify-self-center">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{
              background: 'var(--color-accent-bg)',
              border: '1px solid rgba(255,122,24,0.25)',
            }}
          >
            <Flame size={32} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1
            className="text-4xl font-bold tracking-tight"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: 'var(--color-text)',
            }}
          >
            1<span style={{ color: 'var(--color-accent)' }}>%</span> Better
          </h1>
          <p
            className="text-sm mt-2 tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.2em' }}
          >
            Every. Single. Day.
          </p>
        </div>

        <div
          className="rounded-2xl p-7"
          style={{
            background: 'var(--gradient-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            Welcome back
          </h2>

          {error && (
            <div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl mb-5"
              style={{
                background: 'rgba(255,64,64,0.1)',
                border: '1px solid rgba(255,64,64,0.2)',
                color: '#ff7070',
              }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="input-base"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-xl"
                  style={{ color: 'var(--color-text-muted)', width: '36px', height: '36px' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="btn btn-primary w-full mt-2 py-3"
              style={{ borderRadius: '12px' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Log In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-sm text-center mt-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          No account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-accent)', fontWeight: 600 }}
            className="hover:underline"
          >
            Start your journey →
          </Link>
        </p>
          </div>
        </div>
      </div>
    </div>
  );
}
