import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MapPin, Globe, Target, Edit2, Users, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usersApi, type UpdateProfilePayload } from '../api/users';
import { postsApi } from '../api/posts';
import { getDefaultAvatar, getStreakBadgeClass, getStreakLabel } from '../lib/utils';
import PostCard from '../components/post/PostCard';
import StreakBadge from '../components/profile/StreakBadge';
import { FOCUS_AREAS } from '../lib/constants';
import toast from 'react-hot-toast';
import type { Post } from '../types/post';
import type { User } from '../types/user';

// ── Shared input style helper ────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text', placeholder, rows,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      {rows ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="input-base resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-base"
        />
      )}
    </div>
  );
}

// ── Edit Profile Modal ───────────────────────────────────────────────
function EditProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const qc      = useQueryClient();
  const setUser = useAuthStore(s => s.setUser);

  const [form, setForm] = useState<UpdateProfilePayload>({
    displayName:   user.displayName,
    bio:           user.bio           || '',
    location:      user.location      || '',
    websiteUrl:    user.websiteUrl    || '',
    goalStatement: user.goalStatement || '',
    focusAreas:    [...(user.focusAreas || [])],
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => usersApi.updateProfile(form),
    onSuccess: updated => {
      setUser({ ...useAuthStore.getState().user!, ...updated });
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated ✓');
      onClose();
    },
    onError: () => toast.error('Failed to update profile.'),
  });

  const update =
    (key: keyof UpdateProfilePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleFocus = (area: string) =>
    setForm(f => ({
      ...f,
      focusAreas: f.focusAreas?.includes(area)
        ? f.focusAreas.filter(a => a !== area)
        : [...(f.focusAreas || []), area],
    }));

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2
            className="font-bold text-lg"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <Field
            label="Display Name"
            value={(form.displayName as string) || ''}
            onChange={update('displayName')}
            placeholder="Your name"
          />
          <Field
            label="Bio"
            value={form.bio || ''}
            onChange={update('bio')}
            placeholder="Tell the community about yourself..."
            rows={3}
          />
          <Field
            label="Location"
            value={form.location || ''}
            onChange={update('location')}
            placeholder="City, Country"
          />
          <Field
            label="Website"
            type="url"
            value={form.websiteUrl || ''}
            onChange={update('websiteUrl')}
            placeholder="https://yoursite.com"
          />
          <Field
            label="Goal Statement"
            value={form.goalStatement || ''}
            onChange={update('goalStatement')}
            placeholder="What are you working towards?"
          />

          {/* Focus areas */}
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Focus Areas
            </label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map(area => {
                const on = form.focusAreas?.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocus(area)}
                    className="tag capitalize transition-all"
                    style={{
                      background: on ? 'var(--color-accent-bg)' : 'var(--color-surface-2)',
                      borderColor: on ? 'var(--color-accent)' : 'var(--color-border)',
                      color: on ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-5 py-4 shrink-0"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button onClick={onClose} className="btn btn-ghost text-sm">
            Cancel
          </button>
          <button
            onClick={() => save()}
            disabled={isPending}
            className="btn btn-primary text-sm"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Followers / Following Modal ──────────────────────────────────────
function PeopleModal({
  title, userId, type, onClose,
}: {
  title: string; userId: string; type: 'followers' | 'following'; onClose: () => void;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: [type, userId],
    queryFn: () =>
      type === 'followers'
        ? usersApi.getFollowers(userId)
        : usersApi.getFollowing(userId),
  });

  const people = (data as Array<{ follower?: User; following?: User }>)
    .map(f => f.follower || f.following)
    .filter(Boolean) as User[];

  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box w-full max-w-sm overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h3
            className="font-bold"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-28" />
                    <div className="skeleton h-2 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : people.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <Users size={28} style={{ color: 'var(--color-text-subtle)', marginBottom: 8 }} />
              <div className="empty-state-title" style={{ fontSize: 14 }}>Nobody here yet</div>
            </div>
          ) : (
            people.map(u => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <img
                  src={u.avatarUrl || getDefaultAvatar(u.username)}
                  className="avatar avatar-md"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {u.displayName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    @{u.username}
                  </div>
                </div>
                <StreakBadge streak={u.currentStreak || 0} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Stat Box ────────────────────────────────────────────────────────
function StatBox({
  value, label, onClick, accentColor,
}: {
  value: string | number;
  label: string;
  onClick?: () => void;
  accentColor?: string;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      className="flex-1 text-center p-3 rounded-xl transition-colors"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
      onMouseEnter={onClick ? e => ((e.currentTarget as HTMLElement).style.background = 'var(--color-hover)') : undefined}
      onMouseLeave={onClick ? e => ((e.currentTarget as HTMLElement).style.background = 'transparent') : undefined}
    >
      <div
        className="text-lg font-bold"
        style={{ fontFamily: "'Syne', sans-serif", color: accentColor || 'var(--color-text)' }}
      >
        {value}
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
    </Comp>
  );
}

// ── Main ProfilePage ─────────────────────────────────────────────────
export default function ProfilePage() {
  const authUser   = useAuthStore(s => s.user);
  const [editOpen, setEditOpen]     = useState(false);
  const [peopleModal, setPeopleModal] = useState<'followers' | 'following' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery<User>({
    queryKey: ['profile', authUser?.username],
    queryFn:  () => usersApi.getProfile(authUser!.username),
    enabled:  !!authUser?.username,
    staleTime: 1000 * 60,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['user-posts', authUser?.id],
    queryFn:  () => postsApi.getUserPosts(authUser!.id),
    enabled:  !!authUser?.id,
    staleTime: 1000 * 60,
  });

  const user         = profile || authUser;
  if (!user) return null;

  const streak       = user.currentStreak || 0;
  const avatar       = user.avatarUrl || getDefaultAvatar(user.username);
  const postCount    = profile?._count?.posts ?? posts.length;
  const followerCount  = profile?._count?.followers ?? 0;
  const followingCount = profile?._count?.following ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Cover ── */}
      <div
        className="h-36 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-bg) 0%, var(--color-surface-2) 100%)',
        }}
      >
        {user.coverUrl && (
          <img
            src={user.coverUrl}
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
          />
        )}
        {/* Gradient overlay at bottom for avatar legibility */}
        <div
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--color-bg), transparent)',
          }}
        />
      </div>

      {/* ── Avatar row ── */}
      <div className="px-5 relative" style={{ marginTop: '-48px' }}>
        <div className="relative inline-block">
          <img
            src={avatar}
            className="w-24 h-24 rounded-full object-cover"
            style={{
              border: '4px solid var(--color-bg)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
            alt={user.displayName}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
            title="Change photo"
          >
            <Camera size={12} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden />
        </div>
      </div>

      {/* ── Profile body ── */}
      <div className="px-5 pt-3 pb-6">
        {/* Name row */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "'Syne', sans-serif", color: 'var(--color-text)' }}
            >
              {user.displayName}
            </h1>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              @{user.username}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <span className={`badge ${getStreakBadgeClass(streak)}`}>
              {getStreakLabel(streak)}
            </span>
            <button
              onClick={() => setEditOpen(true)}
              className="btn btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <Edit2 size={12} /> Edit
            </button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p
            className="text-sm mb-3 leading-relaxed"
            style={{ color: 'var(--color-text)' }}
          >
            {user.bio}
          </p>
        )}

        {/* Meta info */}
        <div
          className="flex flex-wrap gap-3 mb-4 text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {user.location}
            </span>
          )}
          {user.websiteUrl && (
            <a
              href={user.websiteUrl.startsWith('http') ? user.websiteUrl : `https://${user.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              <Globe size={11} /> {user.websiteUrl}
            </a>
          )}
          {user.goalStatement && (
            <span className="flex items-center gap-1">
              <Target size={11} /> {user.goalStatement}
            </span>
          )}
        </div>

        {/* Focus areas */}
        {(user.focusAreas || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {(user.focusAreas || []).map(a => (
              <span key={a} className="tag tag-accent capitalize">
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div
          className="flex rounded-xl mb-6 overflow-hidden"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <StatBox value={postCount} label="Posts" />
          <div className="w-px" style={{ background: 'var(--color-border)' }} />
          <StatBox
            value={followerCount}
            label="Followers"
            onClick={() => setPeopleModal('followers')}
          />
          <div className="w-px" style={{ background: 'var(--color-border)' }} />
          <StatBox
            value={followingCount}
            label="Following"
            onClick={() => setPeopleModal('following')}
          />
          <div className="w-px" style={{ background: 'var(--color-border)' }} />
          <StatBox
            value={`${streak}🔥`}
            label="Streak"
            accentColor="var(--color-accent)"
          />
        </div>

        {/* Posts section */}
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Posts
        </div>

        {postsLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="skeleton h-28 rounded-2xl"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚀</div>
            <div className="empty-state-title">No posts yet</div>
            <div className="empty-state-desc">Share your first win and start the streak!</div>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </div>

      {/* Modals */}
      {editOpen && (
        <EditProfileModal user={user as User} onClose={() => setEditOpen(false)} />
      )}
      {peopleModal && (
        <PeopleModal
          title={peopleModal === 'followers' ? 'Followers' : 'Following'}
          userId={user.id}
          type={peopleModal}
          onClose={() => setPeopleModal(null)}
        />
      )}
    </div>
  );
}
