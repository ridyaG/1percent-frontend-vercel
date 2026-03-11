export default function ChallengesPage() {
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Active Challenges</h2>
        <button className="px-4 py-2 bg-[#FF5C00] text-white text-sm font-semibold rounded-lg hover:bg-[#ff7020] transition-colors">
          + Create Challenge
        </button>
      </div>
      <div className="text-center py-16 text-gray-500">
        <div className="text-4xl mb-4">🏆</div>
        <div>Challenges coming soon</div>
        <div className="text-sm text-gray-600 mt-1">Create and join community challenges</div>
      </div>
    </div>
  );
}