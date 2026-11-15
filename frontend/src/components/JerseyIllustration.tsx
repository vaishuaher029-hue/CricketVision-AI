import { cx } from '../lib/format';

/** Generic illustrated back-of-jersey. Not a real player, not an official kit, no logos. */
export function JerseyIllustration({ number = '17', name = 'PLAYER', showScan = true, className }: { number?: string; name?: string; showScan?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 320 350" role="img" aria-label={`Illustrated blue cricket jersey showing the printed name ${name} and number ${number}`} className={cx('h-auto w-full', className)}>
      <defs>
        <linearGradient id="jv-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a86d8" />
          <stop offset="1" stopColor="#0f4a8f" />
        </linearGradient>
        <linearGradient id="jv-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b3a73" stopOpacity="0.55" />
          <stop offset="0.18" stopColor="#0b3a73" stopOpacity="0" />
          <stop offset="0.82" stopColor="#0b3a73" stopOpacity="0" />
          <stop offset="1" stopColor="#0b3a73" stopOpacity="0.55" />
        </linearGradient>
        <pattern id="jv-pin" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
          <rect width="9" height="9" fill="none" />
          <rect width="1.2" height="9" fill="#ffffff" opacity="0.05" />
        </pattern>
        <filter id="jv-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter="url(#jv-shadow)">
        <path d="M95 36 L58 52 L12 112 L52 142 L76 112 L76 318 Q160 334 244 318 L244 112 L268 142 L308 112 L262 52 L225 36 Q160 74 95 36 Z" fill="url(#jv-body)" />
        <path d="M95 36 L58 52 L12 112 L52 142 L76 112 L76 318 Q160 334 244 318 L244 112 L268 142 L308 112 L262 52 L225 36 Q160 74 95 36 Z" fill="url(#jv-pin)" />
        <path d="M95 36 L58 52 L12 112 L52 142 L76 112 L76 318 Q160 334 244 318 L244 112 L268 142 L308 112 L262 52 L225 36 Q160 74 95 36 Z" fill="url(#jv-side)" />
      </g>
      {/* sleeve accents */}
      <path d="M17 104 L47 132 L52 142 L12 112 Z" fill="#f08a24" />
      <path d="M303 104 L273 132 L268 142 L308 112 Z" fill="#f08a24" />
      {/* collar */}
      <path d="M95 36 Q160 82 225 36 L216 31 Q160 64 104 31 Z" fill="#dff3ff" opacity="0.92" />
      {/* hem accent */}
      <path d="M76 304 Q160 320 244 304 L244 318 Q160 334 76 318 Z" fill="#f08a24" opacity="0.9" />
      {/* printed name + number */}
      <text x="160" y="118" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="22" letterSpacing="5" fill="#ffffff">{name}</text>
      <text x="160" y="236" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="116" fill="#ffffff" stroke="#f08a24" strokeWidth="2" paintOrder="stroke">{number}</text>
      {showScan && (
        <g className="animate-scan" fill="none" stroke="#5ee2ef" strokeWidth="2" strokeDasharray="6 5">
          <rect x="96" y="94" width="128" height="34" rx="6" />
          <rect x="84" y="136" width="152" height="112" rx="8" />
        </g>
      )}
    </svg>
  );
}

/** Small jersey glyph with a number, used as a player-card illustration in the directory. */
export function MiniJersey({ number }: { number: string | null }) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label={number ? `Illustrated jersey number ${number}` : 'Illustrated jersey'} className="size-full">
      <path d="M38 14 L20 22 L4 46 L22 58 L32 46 L32 106 Q60 112 88 106 L88 46 L98 58 L116 46 L100 22 L82 14 Q60 28 38 14 Z" fill="#1c6fc0" />
      <path d="M6 44 L20 56 L22 58 L4 46 Z M114 44 L100 56 L98 58 L116 46 Z" fill="#f08a24" />
      <path d="M38 14 Q60 32 82 14 L78 12 Q60 24 42 12 Z" fill="#dff3ff" />
      <text x="60" y="78" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize={number && number.length > 2 ? 24 : 32} fill="#fff">{number ?? '–'}</text>
    </svg>
  );
}
