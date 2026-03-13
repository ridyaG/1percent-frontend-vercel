const BURST_COUNT = 72;

export default function FeedMotionBackground() {
  return (
    <div className="feed-motion-bg" aria-hidden="true">
      <div className="feed-motion-orb one" />
      <div className="feed-motion-orb two" />
      <div className="feed-motion-orb three" />

      <div className="feed-burst-core animate-pulse-aurora" />

      <svg
        className="feed-burst-lines animate-rotate-slowly"
        viewBox="0 0 1000 1000"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(500 500)">
          {Array.from({ length: BURST_COUNT }).map((_, index) => {
            const angle = (360 / BURST_COUNT) * index;
            const inner = 18 + (index % 5) * 4;
            const outer = 220 + (index % 9) * 34;
            const opacity = 0.18 + (index % 6) * 0.05;
            const strokeWidth = index % 7 === 0 ? 2.2 : 1.2;

            return (
              <g key={angle} transform={`rotate(${angle})`}>
                <line
                  x1="0"
                  y1={inner}
                  x2="0"
                  y2={outer}
                  stroke="url(#feedBurstGradient)"
                  strokeOpacity={opacity}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                <circle
                  cx="0"
                  cy={outer}
                  r={index % 8 === 0 ? 3.4 : 2.1}
                  fill="url(#feedBurstDot)"
                  fillOpacity={Math.min(0.95, opacity + 0.12)}
                />
              </g>
            );
          })}
        </g>
        <defs>
          <linearGradient id="feedBurstGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="45%" stopColor="rgba(255,122,24,0.45)" />
            <stop offset="100%" stopColor="rgba(93,214,192,0.2)" />
          </linearGradient>
          <radialGradient id="feedBurstDot" r="1">
            <stop offset="0%" stopColor="#ffd39c" />
            <stop offset="100%" stopColor="#ff7a18" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
