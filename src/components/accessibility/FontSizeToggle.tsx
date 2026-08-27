import React, { useState, useEffect } from 'react';

export type FontSizeLevel = 'small' | 'normal' | 'large' | 'extra-large';

interface FontSizeOption {
  id: FontSizeLevel;
  label: string;
  percentage: string;
  ariaLabel: string;
  title: string;
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  {
    id: 'small',
    label: 'A-',
    percentage: '90%',
    ariaLabel: 'Decrease font size (90%)',
    title: 'Small text (90%)',
  },
  {
    id: 'normal',
    label: 'A',
    percentage: '100%',
    ariaLabel: 'Default font size (100%)',
    title: 'Default text (100%)',
  },
  {
    id: 'large',
    label: 'A+',
    percentage: '115%',
    ariaLabel: 'Increase font size (115%)',
    title: 'Large text (115%)',
  },
];

const STORAGE_KEY = 'rti_portal_font_size_scale';

export const FontSizeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [currentLevel, setCurrentLevel] = useState<FontSizeLevel>('normal');

  // Load persisted font size preference on mount and apply to documentElement
  useEffect(() => {
    try {
      const savedLevel = localStorage.getItem(STORAGE_KEY) as FontSizeLevel | null;
      if (savedLevel && FONT_SIZE_OPTIONS.some((opt) => opt.id === savedLevel)) {
        setCurrentLevel(savedLevel);
        const option = FONT_SIZE_OPTIONS.find((opt) => opt.id === savedLevel);
        if (option) {
          document.documentElement.style.fontSize = option.percentage;
        }
      } else {
        document.documentElement.style.fontSize = '100%';
      }
    } catch {
      document.documentElement.style.fontSize = '100%';
    }
  }, []);

  const handleSetFontSize = (option: FontSizeOption) => {
    setCurrentLevel(option.id);
    document.documentElement.style.fontSize = option.percentage;
    try {
      localStorage.setItem(STORAGE_KEY, option.id);
    } catch {
      // Ignore localStorage errors (e.g. incognito quota)
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-[#E2DDD5] bg-white p-0.5 shadow-2xs ${className}`}
      role="group"
      aria-label="Font size adjustment controls"
      id="font-size-toggle-group"
    >
      <span className="sr-only">Font Size Controls</span>
      {FONT_SIZE_OPTIONS.map((option) => {
        const isActive = currentLevel === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSetFontSize(option)}
            aria-pressed={isActive}
            aria-label={option.ariaLabel}
            title={option.title}
            className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 px-1.5 sm:px-2 rounded-md text-xs sm:text-sm font-bold transition-all select-none cursor-pointer flex items-center justify-center ${
              isActive
                ? 'bg-[#1B4B8F] text-white shadow-2xs'
                : 'text-[#1B1E22] hover:bg-[#EEF3FA] hover:text-[#1B4B8F]'
            }`}
          >
            <span
              className={`${
                option.id === 'small'
                  ? 'text-[11px] sm:text-xs'
                  : option.id === 'large'
                  ? 'text-xs sm:text-sm font-black'
                  : 'text-xs font-bold'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
