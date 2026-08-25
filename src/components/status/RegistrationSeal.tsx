import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RegistrationSealProps {
  registrationNumber: string;
  size?: 'sm' | 'md' | 'lg';
  authorityCode?: string;
  timestamp?: string;
}

export const RegistrationSeal: React.FC<RegistrationSealProps> = ({
  registrationNumber,
  size = 'md',
  authorityCode,
  timestamp,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const dimensions = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  }[size];

  const year = timestamp ? new Date(timestamp).getFullYear() : new Date().getFullYear();
  const authText = authorityCode ? authorityCode.toUpperCase() : 'CENTRAL RTI';

  const SealSVG = (
    <div
      className={`relative ${dimensions} shrink-0 select-none`}
      aria-label={`Official Registration Stamp: ${registrationNumber}`}
      role="img"
    >
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full text-[#E07A2C]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Rings */}
        <circle cx="80" cy="80" r="76" stroke="#E07A2C" strokeWidth="2.5" strokeDasharray="3 3" />
        <circle cx="80" cy="80" r="70" stroke="#E07A2C" strokeWidth="2" />
        <circle cx="80" cy="80" r="50" stroke="#E07A2C" strokeWidth="1.5" />

        {/* Circular text path for TOP */}
        <path
          id="seal-top-path"
          d="M 22,80 A 58,58 0 0,1 138,80"
          fill="none"
        />
        <text className="text-[9px] font-mono-code font-bold tracking-[0.22em] fill-[#E07A2C]">
          <textPath href="#seal-top-path" startOffset="50%" textAnchor="middle">
            RIGHT TO INFORMATION
          </textPath>
        </text>

        {/* Circular text path for BOTTOM */}
        <path
          id="seal-bottom-path"
          d="M 138,80 A 58,58 0 0,1 22,80"
          fill="none"
        />
        <text className="text-[8.5px] font-mono-code font-semibold tracking-[0.2em] fill-[#E07A2C]">
          <textPath href="#seal-bottom-path" startOffset="50%" textAnchor="middle">
            {authText} · {year}
          </textPath>
        </text>

        {/* Center Emblem Star / Stamp Symbol */}
        <g transform="translate(80, 80)">
          {/* Inner Decorative 8-pointed star */}
          <polygon
            points="0,-18 5,-6 18,0 5,6 0,18 -5,6 -18,0 -5,-6"
            fill="#E07A2C"
            opacity="0.2"
          />
          <polygon
            points="0,-18 5,-6 18,0 5,6 0,18 -5,6 -18,0 -5,-6"
            stroke="#E07A2C"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Central 'REGISTERED' / 'VERIFIED' mark */}
          <circle cx="0" cy="0" r="10" stroke="#E07A2C" strokeWidth="1.5" />
          <path
            d="M -4 0 L -1 3 L 5 -3"
            stroke="#E07A2C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Outer Stars */}
        <circle cx="21" cy="80" r="2.5" fill="#E07A2C" />
        <circle cx="139" cy="80" r="2.5" fill="#E07A2C" />
      </svg>
    </div>
  );

  if (shouldReduceMotion) {
    return SealSVG;
  }

  return (
    <motion.div
      initial={{ scale: 1.4, opacity: 0, rotate: -15 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.175, 0.885, 0.32, 1.275], // slight physical stamp bounce
      }}
    >
      {SealSVG}
    </motion.div>
  );
};
