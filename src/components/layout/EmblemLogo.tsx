import React from 'react';

interface EmblemLogoProps {
  className?: string;
  variant?: 'white' | 'dark' | 'gold' | 'blue';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const EmblemLogo: React.FC<EmblemLogoProps> = ({
  className = '',
  variant = 'white',
  size = 'md',
  showText = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const colorMap = {
    white: '#FFFFFF',
    dark: '#1B1E22',
    gold: '#D4AF37',
    blue: '#1B4B8F',
  };

  const color = colorMap[variant] || '#FFFFFF';

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 200 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeMap[size]} object-contain`}
        aria-label="National Emblem of India - Lion Capital of Ashoka"
        role="img"
      >
        <g stroke={color} fill={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Central Lion Head & Mane */}
          <path
            d="M100 22 C90 12 110 12 100 22 Z M86 32 C82 25 86 18 94 20 C96 22 97 26 95 30 Z M114 32 C118 25 114 18 106 20 C104 22 103 26 105 30 Z"
            fill={color}
          />
          {/* Main Face Contour */}
          <path
            d="M82 45 C78 35 90 28 100 28 C110 28 122 35 118 45 C116 52 118 60 114 68 C110 74 90 74 86 68 C82 60 84 52 82 45 Z"
            fill="none"
            strokeWidth="3.5"
          />
          {/* Eyes & Nose Details */}
          <ellipse cx="91" cy="48" rx="3.5" ry="2.2" fill={color} />
          <ellipse cx="109" cy="48" rx="3.5" ry="2.2" fill={color} />
          <path d="M96 52 Q100 50 104 52 L102 58 Q100 60 98 58 Z" fill={color} />
          {/* Muzzle & Whiskers */}
          <path d="M88 64 Q94 67 100 63 Q106 67 112 64" fill="none" strokeWidth="2.5" />
          <line x1="82" y1="58" x2="74" y2="56" strokeWidth="1.5" />
          <line x1="82" y1="62" x2="72" y2="62" strokeWidth="1.5" />
          <line x1="118" y1="58" x2="126" y2="56" strokeWidth="1.5" />
          <line x1="118" y1="62" x2="128" y2="62" strokeWidth="1.5" />

          {/* Left Lion Profile */}
          <path
            d="M62 42 C54 36 60 26 70 32 C74 35 78 40 76 48 C74 56 68 62 60 65 C54 62 52 50 62 42 Z"
            fill="none"
            strokeWidth="3"
          />
          <ellipse cx="64" cy="46" rx="2.5" ry="1.8" fill={color} />
          <path d="M54 54 Q60 56 64 53" fill="none" strokeWidth="2" />

          {/* Right Lion Profile */}
          <path
            d="M138 42 C146 36 140 26 130 32 C126 35 122 40 124 48 C126 56 132 62 140 65 C146 62 148 50 138 42 Z"
            fill="none"
            strokeWidth="3"
          />
          <ellipse cx="136" cy="46" rx="2.5" ry="1.8" fill={color} />
          <path d="M146 54 Q140 56 136 53" fill="none" strokeWidth="2" />

          {/* Majestic Mane Textures */}
          <path
            d="M74 72 Q60 85 68 98 Q76 110 82 118 M126 72 Q140 85 132 98 Q124 110 118 118"
            fill="none"
            strokeWidth="3"
          />
          <path
            d="M84 76 Q90 92 88 108 M116 76 Q110 92 112 108 M94 74 Q100 95 96 116 M106 74 Q100 95 104 116"
            fill="none"
            strokeWidth="2.5"
          />

          {/* Chest and Legs Pillars */}
          <path
            d="M78 116 L76 165 M92 118 L92 165 M108 118 L108 165 M122 116 L124 165"
            fill="none"
            strokeWidth="4"
          />
          {/* Paws */}
          <path d="M72 165 C70 170 82 170 80 165 Z" fill={color} />
          <path d="M88 165 C86 170 98 170 96 165 Z" fill={color} />
          <path d="M104 165 C102 170 114 170 112 165 Z" fill={color} />
          <path d="M120 165 C118 170 130 170 128 165 Z" fill={color} />

          {/* Abacus Frieze / Platform */}
          <rect x="36" y="172" width="128" height="38" rx="4" fill="none" strokeWidth="3.5" />
          <line x1="36" y1="178" x2="164" y2="178" strokeWidth="1.5" />
          <line x1="36" y1="204" x2="164" y2="204" strokeWidth="1.5" />

          {/* Central Ashoka Chakra on Abacus (24 Spokes motif) */}
          <circle cx="100" cy="191" r="13" fill="none" strokeWidth="2.5" />
          <circle cx="100" cy="191" r="2.5" fill={color} />
          {/* Spokes */}
          <line x1="100" y1="179" x2="100" y2="203" strokeWidth="1.2" />
          <line x1="88" y1="191" x2="112" y2="191" strokeWidth="1.2" />
          <line x1="91.5" y1="182.5" x2="108.5" y2="199.5" strokeWidth="1.2" />
          <line x1="91.5" y1="199.5" x2="108.5" y2="182.5" strokeWidth="1.2" />
          <line x1="95" y1="180" x2="105" y2="202" strokeWidth="1" />
          <line x1="105" y1="180" x2="95" y2="202" strokeWidth="1" />
          <line x1="89" y1="186" x2="111" y2="196" strokeWidth="1" />
          <line x1="89" y1="196" x2="111" y2="186" strokeWidth="1" />

          {/* Galloping Horse (Left of Chakra) */}
          <path
            d="M52 195 Q58 184 66 186 Q72 188 74 194 Q66 195 62 201 Q56 200 52 195 Z"
            fill={color}
          />
          <path d="M48 190 Q54 186 58 192" fill="none" strokeWidth="1.5" />

          {/* Zebu Bull (Right of Chakra) */}
          <path
            d="M130 196 Q134 186 142 188 Q148 190 148 197 Q142 202 136 201 Z"
            fill={color}
          />
          <path d="M144 186 Q146 182 148 186 M140 186 Q140 181 142 185" fill="none" strokeWidth="1.5" />

          {/* Inverted Bell Lotus Base */}
          <path
            d="M48 212 C58 226 142 226 152 212 L158 220 C146 238 54 238 42 220 Z"
            fill="none"
            strokeWidth="3"
          />
          {/* Base border */}
          <line x1="50" y1="228" x2="150" y2="228" strokeWidth="3" />
        </g>

        {/* Motto: 'सत्यमेव जयते' (Truth Alone Triumphs) */}
        <text
          x="100"
          y="262"
          textAnchor="middle"
          fill={color}
          fontSize="20"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
        >
          सत्यमेव जयते
        </text>
      </svg>

      {showText && (
        <div className="text-center mt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color }}>
            सत्यमेव जयते
          </span>
        </div>
      )}
    </div>
  );
};
