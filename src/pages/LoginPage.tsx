import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, ArrowRight, Flame, Zap, TimerReset, Sparkles, BarChart3 } from 'lucide-react';

const LOGIN_MODES = {
  focus: {
    eyebrow: 'Build consistency',
    title: 'Show up daily and make progress feel tangible.',
    copy: 'Track your streaks, share wins, and stay connected to a community built around steady improvement.',
    badge: 'Focus mode',
    statLabel: 'Consistency score',
    statValue: '87%',
    features: [
      { label: 'Track streaks clearly', icon: TimerReset },
      { label: 'Measure visible progress', icon: BarChart3 },
      { label: 'Reduce friction to post', icon: Zap },
      { label: 'Keep motivation steady', icon: Sparkles },
    ],
  },
  momentum: {
    eyebrow: 'Light the spark',
    title: 'Turn tiny wins into momentum you can actually feel.',
    copy: 'Jump back into your rhythm, celebrate small progress, and keep the energy of the community close.',
    badge: 'Momentum mode',
    statLabel: 'Streak energy',
    statValue: '+12%',
    features: [
      { label: 'Post wins in seconds', icon: Zap },
      { label: 'Ride your current streak', icon: Flame },
      { label: 'See growth without overthinking', icon: BarChart3 },
      { label: 'Stay energized every day', icon: Sparkles },
    ],
  },
} as const;

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error, setError]        = useState('');
  const [loading, setLoading]    = useState(false);
  const [mode, setMode]          = useState<keyof typeof LOGIN_MODES>('focus');
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const activeMode = LOGIN_MODES[mode];

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
              {activeMode.eyebrow}
            </div>

            <div
              className="mb-6 inline-flex rounded-full p-1"
              style={{ background: 'color-mix(in srgb, var(--color-surface) 92%, transparent)', border: '1px solid var(--color-border)' }}
            >
              {(['focus', 'momentum'] as const).map((option) => {
                const isActive = mode === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMode(option)}
                    className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all"
                    style={{
                      minHeight: '40px',
                      background: isActive ? 'var(--gradient-brand)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--color-text-muted)',
                      boxShadow: isActive ? 'var(--shadow-accent)' : 'none',
                    }}
                  >
                    {LOGIN_MODES[option].badge}
                  </button>
                );
              })}
            </div>

            <h1 className="type-hero mb-4">{activeMode.title}</h1>
            <p className="section-copy text-base">
              {activeMode.copy}
            </p>

            <div
              className="mt-8 mb-5 overflow-hidden rounded-[28px] p-5"
              style={{
                background:
                  'radial-gradient(circle at top right, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 30%), var(--gradient-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                    {activeMode.statLabel}
                  </div>
                  <div className="mt-1 text-3xl font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Syne', sans-serif" }}>
                    {activeMode.statValue}
                  </div>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--color-accent-bg)', border: '1px solid var(--color-border)' }}
                >
                  <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--color-surface) 75%, white 25%)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: mode === 'focus' ? '87%' : '72%',
                    background: 'var(--gradient-brand)',
                    transition: 'width 320ms ease',
                  }}
                />
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {activeMode.features.map(({ label, icon: Icon }, index) => (
                <button
                  key={label}
                  type="button"
                  className="group glass-panel flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-all hover:-translate-y-1"
                  style={{
                    color: 'var(--color-text)',
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all"
                    style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
                  >
                    <Icon size={16} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm justify-self-center">
            <div className="relative">
              <div
                className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 24%, transparent)', opacity: mode === 'focus' ? 0.45 : 0.62 }}
              />
              <div
                className="pointer-events-none absolute -right-6 top-20 h-24 w-24 rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)', opacity: 0.32 }}
              />

              <div className="text-center mb-10">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 animate-scale-in"
                  style={{
                    background: 'var(--color-accent-bg)',
                    border: '1px solid rgba(255,122,24,0.25)',
                    boxShadow: '0 0 0 10px color-mix(in srgb, var(--color-accent) 8%, transparent)',
                  }}
                >
                  <Flame size={32} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h1
                  className="type-section font-bold tracking-tight"
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
                className="rounded-[28px] p-7"
                style={{
                  background:
                    'radial-gradient(circle at bottom center, color-mix(in srgb, var(--color-accent) 14%, transparent), transparent 32%), var(--gradient-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-lg)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
                    >
                      Welcome back
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Step back into your streak.
                    </p>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                    style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
                  >
                    {activeMode.badge}
                  </div>
                </div>

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

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: 'var(--color-secondary)' }}
                        onClick={() => setMode((current) => current === 'focus' ? 'momentum' : 'focus')}
                      >
                        Toggle vibe
                      </button>
                    </div>
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
                    style={{ borderRadius: '16px' }}
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

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Daily streaks', 'Quick posts', 'Clear progress'].map((pill) => (
                    <div
                      key={pill}
                      className="rounded-2xl px-3 py-2 text-center text-xs font-medium"
                      style={{ background: 'color-mix(in srgb, var(--color-surface) 86%, white 14%)', color: 'var(--color-text-muted)' }}
                    >
                      {pill}
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
