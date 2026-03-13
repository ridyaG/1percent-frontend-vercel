import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, ArrowRight, Flame, Check } from 'lucide-react';

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
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);

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
              Join the habit loop
            </div>
            <h1 className="mb-4">Turn small wins into a system you want to keep using.</h1>
            <p className="section-copy text-base">
              Create your account, define a focus, and start building visible momentum one day at a time.
            </p>
            <div className="mt-8 space-y-3">
              {['Create a clear identity', 'Share progress with the community', 'Build streaks that reinforce the habit'].map((item) => (
                <div key={item} className="glass-panel flex items-center gap-3 px-4 py-4 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  <Check size={16} style={{ color: 'var(--color-secondary)' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm justify-self-center">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background: 'var(--color-accent-bg)',
              border: '1px solid rgba(255,122,24,0.25)',
            }}
          >
            <Flame size={28} style={{ color: 'var(--color-accent)' }} />
          </div>
          <h1
            className="text-3xl font-bold"
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
          className="rounded-2xl p-7"
          style={{
            background: 'var(--gradient-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(16px)',
          }}
        >
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
              style={{ borderRadius: '12px' }}
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
  );
}
