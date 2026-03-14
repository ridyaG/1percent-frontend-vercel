import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MessageCircle, Pencil, Send, Trash2, X, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { chatApi, type Conversation, type DirectMessage } from '../api/chat';
import { usersApi } from '../api/users';
import { getApiErrorMessage } from '../api/errors';
import { useAuthStore } from '../store/authStore';
import { getSharedSocket } from '../hooks/useSocket';
import { useIsMobile } from '../hooks/useMediaQuery';
import { getDefaultAvatar } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import type { User } from '../types/user';

function StartConversationModal({
  users,
  isLoading,
  onClose,
  onStart,
  pendingUserId,
}: {
  users: User[];
  isLoading: boolean;
  onClose: () => void;
  onStart: (user: User) => void;
  pendingUserId?: string | null;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.68)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>New message</div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Pick someone to start a conversation.</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-3">
          {isLoading ? (
            <div className="px-3 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading suggestions...</div>
          ) : users.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>No suggested users available yet.</div>
          ) : (
            users.map(user => (
              <button
                key={user.id}
                onClick={() => onStart(user)}
                disabled={pendingUserId === user.id}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors disabled:opacity-50"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <img
                  src={user.avatarUrl || getDefaultAvatar(user.username)}
                  className="h-11 w-11 rounded-full object-cover"
                  alt={user.displayName}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {user.displayName}
                  </div>
                  <div className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    @{user.username}
                  </div>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}
                >
                  {pendingUserId === user.id ? 'Opening...' : 'Message'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const authUser = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [pendingStartUserId, setPendingStartUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const requestedConversationId = searchParams.get('conversationId');

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    isError: conversationsError,
  } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
  });

  const {
    data: suggestedUsers = [],
    isLoading: suggestionsLoading,
  } = useQuery<User[]>({
    queryKey: ['chat-suggestions'],
    queryFn: usersApi.getSuggestions,
  });

  const activeId = requestedConversationId ?? conversations[0]?.id ?? null;

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery<DirectMessage[]>({
    queryKey: ['messages', activeId],
    queryFn: () => chatApi.getMessages(activeId!),
    enabled: !!activeId,
  });

  useEffect(() => {
    if (!requestedConversationId && conversations[0]?.id) {
      setSearchParams({ conversationId: conversations[0].id }, { replace: true });
    }
  }, [conversations, requestedConversationId, setSearchParams]);

  useEffect(() => {
    if (!activeId) return;
    const socket = getSharedSocket();
    if (!socket) return;
    socket.emit('join_conversation', { conversationId: activeId });
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { mutate: send, isPending } = useMutation({
    mutationFn: () => chatApi.sendMessage(activeId!, draft.trim()),
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries({ queryKey: ['messages', activeId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const { mutate: updateMessage, isPending: isUpdatingMessage } = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      chatApi.updateMessage(activeId!, messageId, content),
    onSuccess: () => {
      setEditingMessageId(null);
      setEditDraft('');
      qc.invalidateQueries({ queryKey: ['messages', activeId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, { fallback: 'Could not update message.', action: 'update the message' })),
  });

  const { mutate: deleteMessage, isPending: isDeletingMessage } = useMutation({
    mutationFn: (messageId: string) => chatApi.deleteMessage(activeId!, messageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', activeId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Message deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, { fallback: 'Could not delete message.', action: 'delete the message' })),
  });

  const { mutate: deleteConversation, isPending: isDeletingConversation } = useMutation({
    mutationFn: () => chatApi.deleteConversation(activeId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      if (activeId) {
        qc.removeQueries({ queryKey: ['messages', activeId] });
      }
      setEditingMessageId(null);
      setEditDraft('');
      setSearchParams({}, { replace: true });
      toast.success('Conversation deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, { fallback: 'Could not delete conversation.', action: 'delete the conversation' })),
  });

  const { mutate: startConversation } = useMutation({
    mutationFn: (user: User) => {
      setPendingStartUserId(user.id);
      return chatApi.createOrGetConversation(user.id);
    },
    onSuccess: conversation => {
      qc.invalidateQueries({ queryKey: ['conversations'] });
      setComposeOpen(false);
      setPendingStartUserId(null);
      setSearchParams({ conversationId: conversation.id });
    },
    onError: (error) => {
      setPendingStartUserId(null);
      toast.error(getApiErrorMessage(error, { fallback: 'Could not start chat.', action: 'start the chat' }));
    },
  });

  const getOtherParticipant = (conversation: Conversation) =>
    conversation.participants.find(participant => participant.userId !== authUser?.id)?.user;

  const activeConversation = conversations.find(conversation => conversation.id === activeId) ?? null;
  const activeRecipient = activeConversation ? getOtherParticipant(activeConversation) : null;
  const showConversationList = !isMobile || !activeConversation;
  const showConversationThread = !isMobile || !!activeConversation;

  if (conversationsLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading conversations...</div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border px-5 py-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
          <div className="font-semibold" style={{ color: 'var(--color-text)' }}>Chat could not load</div>
          <div className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            The conversations request failed. Check that the backend has the `/api/v1/chat` routes deployed and the chat migration has been applied.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex min-h-[calc(100vh-var(--topbar-height))] max-w-6xl flex-col md:flex-row">
        {showConversationList && (
        <aside
        className="w-full md:w-[320px] md:border-r"
        style={{ borderColor: 'var(--color-border)', background: 'var(--gradient-surface)' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Messages</h2>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Continue conversations without leaving your momentum.
              </p>
            </div>
            <button
              onClick={() => setComposeOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              <Plus size={13} />
              New
            </button>
          </div>
        </div>

        <div className="max-h-[42vh] overflow-y-auto md:max-h-[calc(100vh-var(--topbar-height)-89px)]">
          {conversations.length === 0 ? (
            <div className="px-5 py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
              <MessageCircle size={34} className="mx-auto mb-3 opacity-30" />
              <div className="font-semibold">No conversations yet</div>
              <div className="mt-1 text-sm">Start here with suggested people.</div>
              <button
                onClick={() => setComposeOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <Plus size={14} />
                New message
              </button>

              <div className="mt-6 text-left">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--color-secondary)' }}>
                  Suggested users
                </div>
                <div className="space-y-2">
                  {(suggestedUsers || []).slice(0, 4).map(user => (
                    <button
                      key={user.id}
                      onClick={() => startConversation(user)}
                      disabled={pendingStartUserId === user.id}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors disabled:opacity-50"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <img
                        src={user.avatarUrl || getDefaultAvatar(user.username)}
                        className="h-10 w-10 rounded-full object-cover"
                        alt={user.displayName}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {user.displayName}
                        </div>
                        <div className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          @{user.username}
                        </div>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {pendingStartUserId === user.id ? 'Opening...' : 'Message'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            conversations.map(conversation => {
              const other = getOtherParticipant(conversation);
              const lastMessage = conversation.messages[0];
              const isActive = conversation.id === activeId;

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSearchParams({ conversationId: conversation.id })}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
                  style={{
                    background: isActive ? 'var(--color-accent-bg)' : 'transparent',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <img
                    src={other?.avatarUrl || getDefaultAvatar(other?.username || 'user')}
                    className="h-11 w-11 rounded-full object-cover"
                    alt={other?.displayName || 'Conversation participant'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                      {other?.displayName || 'Unknown user'}
                    </div>
                    <div className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                  <div className="shrink-0 text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                    {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                  </div>
                </button>
              );
            })
          )}
        </div>
        </aside>
        )}

        {showConversationThread && (
        <section className="flex min-h-[50vh] flex-1 flex-col">
        {activeId && activeConversation ? (
          <>
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}
            >
              {isMobile && (
                <button
                  onClick={() => setSearchParams({}, { replace: true })}
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <img
                src={activeRecipient?.avatarUrl || getDefaultAvatar(activeRecipient?.username || 'user')}
                className="h-10 w-10 rounded-full object-cover"
                alt={activeRecipient?.displayName || 'Recipient'}
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {activeRecipient?.displayName || 'Unknown user'}
                </div>
                <button
                  onClick={() => activeRecipient && navigate(`/profile/${activeRecipient.username}`)}
                  className="text-xs"
                  style={{ color: 'var(--color-accent)' }}
                >
                  @{activeRecipient?.username}
                </button>
              </div>
              <button
                onClick={() => {
                  if (activeId && window.confirm('Delete this conversation for everyone?')) {
                    deleteConversation();
                  }
                }}
                disabled={isDeletingConversation}
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-50"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                aria-label="Delete conversation"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 md:px-6">
              {messagesLoading && (
                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading messages...</div>
              )}
              {messagesError && (
                <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                  Messages could not load for this conversation.
                </div>
              )}
              {messages.map(message => {
                const isOwnMessage = message.senderId === authUser?.id;
                const isEditing = editingMessageId === message.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[80%]">
                      <div
                        className="rounded-[22px] px-4 py-2.5 text-sm"
                        style={{
                          background: isOwnMessage ? 'var(--color-accent)' : 'var(--color-surface)',
                          color: isOwnMessage ? '#fff' : 'var(--color-text)',
                          border: isOwnMessage ? 'none' : '1px solid var(--color-border)',
                        }}
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editDraft}
                              onChange={e => setEditDraft(e.target.value)}
                              rows={3}
                              className="w-full resize-none rounded-2xl px-3 py-2 text-sm outline-none"
                              style={{
                                background: 'rgba(255,255,255,0.12)',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.18)',
                              }}
                            />
                            <div className="flex justify-end gap-2 text-xs">
                              <button onClick={() => {
                                setEditingMessageId(null);
                                setEditDraft('');
                              }}>
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  if (editDraft.trim()) {
                                    updateMessage({ messageId: message.id, content: editDraft.trim() });
                                  }
                                }}
                                disabled={isUpdatingMessage}
                                className="font-semibold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {message.content}
                            <div
                              className="mt-1 text-[11px]"
                              style={{ color: isOwnMessage ? 'rgba(255,255,255,0.78)' : 'var(--color-text-subtle)' }}
                            >
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </div>
                          </>
                        )}
                      </div>
                      {isOwnMessage && !isEditing && (
                        <div className="mt-1 flex justify-end gap-3 px-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          <button
                            onClick={() => {
                              setEditingMessageId(message.id);
                              setEditDraft(message.content);
                            }}
                            className="inline-flex items-center gap-1"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this message?')) {
                                deleteMessage(message.id);
                              }
                            }}
                            disabled={isDeletingMessage}
                            className="inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div
              className="flex items-center gap-3 px-4 py-4 md:px-6"
              style={{ borderTop: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}
            >
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 rounded-full px-4 py-3 text-sm outline-none"
                style={{
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
              <button
                onClick={() => draft.trim() && send()}
                disabled={isPending || !draft.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-50"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <MessageCircle size={44} className="opacity-30" />
            <div className="text-base font-semibold">Select a conversation to start chatting</div>
          </div>
        )}
        </section>
        )}
      </div>

      {composeOpen && (
        <StartConversationModal
          users={suggestedUsers}
          isLoading={suggestionsLoading}
          onClose={() => setComposeOpen(false)}
          onStart={user => startConversation(user)}
          pendingUserId={pendingStartUserId}
        />
      )}
    </>
  );
}
