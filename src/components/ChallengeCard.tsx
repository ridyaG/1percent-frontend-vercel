interface Challenge {
  id: number; title: string; desc: string; emoji: string;
  participants: number; daysLeft: number; progress: number; joined: boolean;
}

export default function ChallengeCard({ challenge, onToggle }: {
  challenge: Challenge;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
      <div className="h-20 flex items-center justify-center text-4xl bg-[#1a1a1a]">
        {challenge.emoji}
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-1">{challenge.title}</h3>
        <p className="text-gray-500 text-sm mb-3">{challenge.desc}</p>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>👥 {challenge.participants}</span>
          <span>📅 {challenge.daysLeft}d left</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full mb-3">
          <div className="h-full bg-[#FF5C00] rounded-full transition-all"
               style={{ width: `${challenge.joined ? challenge.progress : 0}%` }} />
        </div>
        <button onClick={() => onToggle(challenge.id)}
          className={`w-full py-2 rounded-lg text-sm font-semibold transition
            ${challenge.joined
              ? 'bg-[#FF5C00]/10 text-[#FF5C00] border border-[#FF5C00]/30'
              : 'bg-[#FF5C00] text-white hover:bg-[#ff7020]'}`}>
          {challenge.joined ? '✓ Joined' : 'Join Challenge'}
        </button>
      </div>
    </div>
  );
}
 
