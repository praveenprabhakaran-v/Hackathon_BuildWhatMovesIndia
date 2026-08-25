import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
  min?: number;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  min = 0,
  className = '',
}) => {
  const remaining = max - current;
  const isNearLimit = remaining < max * 0.1;
  const isOverLimit = remaining < 0;
  const isBelowMin = current > 0 && current < min;

  return (
    <div
      className={`flex items-center justify-between text-xs font-mono-code pt-1 ${className}`}
      aria-live="polite"
    >
      <span className={isBelowMin ? 'text-[#B7791F]' : 'text-[#575D65]'}>
        {min > 0 && current < min ? `Min ${min} characters required` : `${current} characters entered`}
      </span>

      <span
        className={`font-semibold ${
          isOverLimit
            ? 'text-[#C23B22]'
            : isNearLimit
            ? 'text-[#B7791F]'
            : 'text-[#575D65]'
        }`}
      >
        {isOverLimit ? `${Math.abs(remaining)} over limit` : `${remaining} characters remaining`}
      </span>
    </div>
  );
};
