export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Notifications</h2>
        <button className="text-sm transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          Mark all read
        </button>
      </div>
      <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
        <div className="text-4xl mb-4">🔔</div>
        <div>No notifications yet</div>
        <div className="text-sm mt-1" style={{ opacity: 0.6 }}>
          Interact with the community to see updates here
        </div>
      </div>
    </div>
  );
}
