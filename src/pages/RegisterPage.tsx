import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, ArrowRight, Flame, Check, Sparkles, Compass, Flag, UserCircle2 } from 'lucide-react';

const REGISTER_MODES = {
  builder: {
    eyebrow: 'Join the habit loop',
    title: 'Turn small wins into a system you want to keep using.',
    copy: 'Create your account, define a focus, and start building visible momentum one day at a time.',
    badge: 'Builder mode',
    statLabel: 'Launch readiness',
    statValue: '3 steps',
    features: [
      { label: 'Create a clear identity', icon: UserCircle2 },
      { label: 'Choose a growth direction', icon: Compass },
      { label: 'Build streaks that stick', icon: Flame },
    ],
  },
  explorer: {
    eyebrow: 'Shape your journey',
    title: 'Start with curiosity, then turn it into a routine worth returning to.',
    copy: 'Join the community, explore what others are building, and define a path that feels motivating from day one.',
    badge: 'Explorer mode',
    statLabel: 'Community unlock',
    statValue: '24/7',
    features: [
      { label: 'See momentum all around you', icon: Sparkles },
      { label: 'Join with a clear mission', icon: Flag },
      { label: 'Discover progress worth sharing', icon: Compass },
    ],
  },
} as const;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2">
      {checks.map((c) => (
        <span
          key={c.label}
          className="flex items-center gap-1 text-xs"
          style={{ color: c.pass ? 'var(--color-success)' : 'var(--color-text-subtle)' }}
        >
          <Check size={11} /> {c.label}
        </span>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm]     = useState({ displayName: '', username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<keyof typeof REGISTER_MODES>('builder');
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const activeMode = REGISTER_MODES[mode];

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      login(data.user, data.accessToken, data.refreshToken);
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields: { label: string; key: keyof typeof form; type: string; placeholder: string; hint?: string }[] = [
    { label: 'Full Name',  key: 'displayName', type: 'text',     placeholder: 'Alex Mercer' },
    { label: 'Username',   key: 'username',    type: 'text',     placeholder: 'alexmercer', hint: '3–30 characters' },
    { label: 'Email',      key: 'email',       type: 'email',    placeholder: 'you@example.com' },
  ];

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
              {(['builder', 'explorer'] as const).map((option) => {
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
                    {REGISTER_MODES[option].badge}
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
              <div className="grid grid-cols-3 gap-2">
                {['Profile', 'Focus', 'Launch'].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-2xl px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{
                      background: index === 2 && mode === 'explorer'
                        ? 'color-mix(in srgb, var(--color-accent-bg) 75%, var(--color-surface) 25%)'
                        : 'color-mix(in srgb, var(--color-surface) 82%, white 18%)',
                      color: index === 2 && mode === 'explorer' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {activeMode.features.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="glass-panel flex items-center gap-3 px-4 py-4 text-left text-sm font-medium transition-all hover:-translate-y-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
                  >
                    <Icon size={16} />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm justify-self-center">
            <div className="relative">
              <div
                className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--color-accent) 24%, transparent)', opacity: mode === 'builder' ? 0.45 : 0.62 }}
              />
              <div
                className="pointer-events-none absolute -left-6 top-20 h-24 w-24 rounded-full blur-3xl"
                style={{ background: 'color-mix(in srgb, var(--color-secondary) 20%, transparent)', opacity: 0.32 }}
              />

              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-scale-in"
                  style={{
                    background: 'var(--color-accent-bg)',
                    border: '1px solid rgba(255,122,24,0.25)',
                    boxShadow: '0 0 0 10px color-mix(in srgb, var(--color-accent) 8%, transparent)',
                  }}
                >
                  <Flame size={28} style={{ color: 'var(--color-accent)' }} />
                </div>
                <h1
                  className="type-section font-bold"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
                >
                  Start your journey
                </h1>
                <p
                  className="text-sm mt-1.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Join thousands improving 1% every day
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
                      Create your account
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Set up your identity and start building.
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
                    className="flex items-start gap-2 text-sm px-4 py-3 rounded-xl mb-5"
                    style={{
                      background: 'rgba(255,64,64,0.1)',
                      border: '1px solid rgba(255,64,64,0.2)',
                      color: '#ff7070',
                    }}
                  >
                    <span className="mt-0.5">⚠</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <label
                        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={update(f.key)}
                        placeholder={f.placeholder}
                        required
                        minLength={f.key === 'username' ? 3 : undefined}
                        maxLength={f.key === 'username' ? 30 : undefined}
                        autoComplete={
                          f.key === 'email' ? 'email' :
                          f.key === 'displayName' ? 'name' : 'username'
                        }
                        className="input-base"
                      />
                      {f.hint && (
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>
                          {f.hint}
                        </p>
                      )}
                    </div>
                  ))}

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
                        onClick={() => setMode((current) => current === 'builder' ? 'explorer' : 'builder')}
                      >
                        Toggle vibe
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={update('password')}
                        placeholder="8+ characters"
                        required
                        minLength={8}
                        autoComplete="new-password"
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
                    <PasswordStrength password={form.password} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full mt-2 py-3"
                    style={{ borderRadius: '16px' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Account <ArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {['Identity', 'Focus', 'Momentum'].map((pill) => (
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
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }} className="hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
