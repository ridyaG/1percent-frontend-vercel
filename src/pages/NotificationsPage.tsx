export default function NotificationsPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Notifications</h2>
        <button className="text-sm text-gray-500 hover:text-white transition-colors">Mark all read</button>
      </div>
      <div className="text-center py-16 text-gray-500">
        <div className="text-4xl mb-4">🔔</div>
        <div>No notifications yet</div>
        <div className="text-sm text-gray-600 mt-1">Interact with the community to see updates here</div>
      </div>
    </div>
  );
}