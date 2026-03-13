import { useState, useRef } from 'react';
import AnimatedCover from '../components/profile/AnimatedCover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, MapPin, Globe, Target, Edit2, Users } from 'lucide-react';
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

// ── Edit Profile Modal ──────────────────────────────────────────────
function EditProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const qc = useQueryClient();
  const setUser = useAuthStore(s => s.setUser);

  const [form, setForm] = useState<UpdateProfilePayload>({
    displayName: user.displayName,
    bio: user.bio || '',
    location: user.location || '',
    websiteUrl: user.websiteUrl || '',
    goalStatement: user.goalStatement || '',
    focusAreas: [...(user.focusAreas || [])],
  });

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => usersApi.updateProfile(form),
    onSuccess: updated => {
      setUser({ ...useAuthStore.getState().user!, ...updated });
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated ✓');
      onClose();
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const update = (key: keyof UpdateProfilePayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleFocus = (area: string) => {
    setForm(f => ({
      ...f,
      focusAreas: f.focusAreas?.includes(area)
        ? f.focusAreas.filter(a => a !== area)
        : [...(f.focusAreas || []), area],
    }));
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Edit Profile</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {[
            { label: 'Display Name', key: 'displayName' as const, type: 'text', placeholder: 'Your name' },
            { label: 'Location',     key: 'location'    as const, type: 'text', placeholder: 'City, Country' },
            { label: 'Website',      key: 'websiteUrl'  as const, type: 'url',  placeholder: 'https://yoursite.com' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={(form[f.key] as string) || ''}
                onChange={update(f.key)}
                placeholder={f.placeholder}
                className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  caretColor: 'var(--color-accent)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Bio</label>
            <textarea
              value={form.bio || ''}
              onChange={update('bio')}
              placeholder="Tell the community about yourself..."
              rows={3}
              className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                caretColor: 'var(--color-accent)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Goal Statement</label>
            <input
              type="text"
              value={form.goalStatement || ''}
              onChange={update('goalStatement')}
              placeholder="What are you working towards?"
              className="w-full mt-1 px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                caretColor: 'var(--color-accent)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Focus areas */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Focus Areas</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FOCUS_AREAS.map(area => {
                const on = form.focusAreas?.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocus(area)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize"
                    style={{
                      background: on ? 'var(--color-accent-bg)' : 'var(--color-bg)',
                      border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      color: on ? 'var(--color-accent)' : 'var(--color-text-muted)',
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
          className="flex justify-end gap-3 p-5 shrink-0"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => save()}
            disabled={isPending}
            className="px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors"
            style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Follow / Followers Modal ────────────────────────────────────────
function PeopleModal({ title, userId, type, onClose }: {
  title: string; userId: string; type: 'followers' | 'following'; onClose: () => void;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: [type, userId],
    queryFn: () => type === 'followers'
      ? usersApi.getFollowers(userId)
      : usersApi.getFollowing(userId),
  });

  // backend returns Follow objects with nested user
  const people = (data as Array<{ follower?: User; following?: User }>).map(
    f => f.follower || f.following
  ).filter(Boolean) as User[];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h3 className="font-bold" style={{ color: 'var(--color-text)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-5 text-center" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
          ) : people.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <div className="text-sm">Nobody here yet</div>
            </div>
          ) : people.map(u => (
            <div key={u.id} className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <img src={u.avatarUrl || getDefaultAvatar(u.username)} className="w-9 h-9 rounded-full" alt="" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                  {u.displayName}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>@{u.username}</div>
              </div>
              <StreakBadge streak={u.currentStreak || 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ProfilePage ────────────────────────────────────────────────
export default function ProfilePage() {
  const authUser = useAuthStore(s => s.user);
  const [editOpen, setEditOpen] = useState(false);
  const [peopleModal, setPeopleModal] = useState<'followers' | 'following' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch the full profile from backend for up-to-date counts etc.
  const { data: profile } = useQuery<User>({
    queryKey: ['profile', authUser?.username],
    queryFn: () => usersApi.getProfile(authUser!.username),
    enabled: !!authUser?.username,
    staleTime: 1000 * 60,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['user-posts', authUser?.id],
    queryFn: () => postsApi.getUserPosts(authUser!.id),
    enabled: !!authUser?.id,
    staleTime: 1000 * 60,
  });

  const user = profile || authUser;
  if (!user) return null;

  const streak = user.currentStreak || 0;
  const avatar = user.avatarUrl || getDefaultAvatar(user.username);
  const postCount = (profile?._count?.posts ?? posts.length) || 0;
  const followerCount = profile?._count?.followers ?? 0;
  const followingCount = profile?._count?.following ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cover */}
      <div className="h-36 relative overflow-hidden">
        <AnimatedCover className="absolute inset-0" />
        {user.coverUrl && (
          <img src={user.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
        )}
        <div className="absolute -bottom-14 left-5">
          <div className="relative inline-block">
            <img
              src={avatar}
              className="w-28 h-28 rounded-full object-cover"
              style={{ border: '4px solid var(--color-bg)' }}
              alt={user.displayName}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
              title="Change photo"
            >
              <Edit2 size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden />
          </div>
        </div>
      </div>

      <div className="pt-18 px-5 pb-6" style={{ paddingTop: '4rem' }}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {user.displayName}
            </h1>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              @{user.username}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStreakBadgeClass(streak)}`}>
              {getStreakLabel(streak)}
            </span>
            <button
              onClick={() => setEditOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
              }}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--color-text)' }}>
            {user.bio}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {user.location}
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
              <Globe size={12} /> {user.websiteUrl}
            </a>
          )}
          {user.goalStatement && (
            <span className="flex items-center gap-1">
              <Target size={12} /> {user.goalStatement}
            </span>
          )}
        </div>

        {/* Focus areas */}
        {(user.focusAreas || []).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {(user.focusAreas || []).map(a => (
              <span
                key={a}
                className="px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                style={{
                  background: 'var(--color-accent-bg)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-accent-bg)',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div
          className="grid grid-cols-4 gap-1 rounded-xl p-3 mb-6"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="text-center p-2">
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{postCount}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Posts</div>
          </div>
          <button
            className="text-center p-2 rounded-lg transition-colors"
            onClick={() => setPeopleModal('followers')}
            style={{ cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{followerCount}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Followers</div>
          </button>
          <button
            className="text-center p-2 rounded-lg transition-colors"
            onClick={() => setPeopleModal('following')}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{followingCount}</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Following</div>
          </button>
          <div className="text-center p-2">
            <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{streak}🔥</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Streak</div>
          </div>
        </div>

        {/* Posts */}
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Posts
        </div>
        {postsLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl p-5 animate-pulse h-28"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-14" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-5xl mb-4">🚀</div>
            <div className="font-semibold">No posts yet</div>
            <div className="text-sm mt-1 opacity-60">Share your first win!</div>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} />)
        )}
      </div>

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
