import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  term?: string;
  title?: string;
  placement?: 'top' | 'bottom';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  term,
  title,
  placement = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span className="inline-flex items-center relative ml-1 align-middle">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={term ? `Learn more about ${term}` : 'Help information'}
        className="inline-flex items-center justify-center p-0.5 text-gray-500 hover:text-[#1B4B8F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4B8F] rounded transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={`absolute z-50 w-72 p-3 bg-[#1B1E22] text-white text-xs rounded-lg shadow-xl border border-gray-700 transition-all ${
            placement === 'top'
              ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
              : 'top-full left-1/2 -translate-x-1/2 mt-2'
          }`}
        >
          {title && <div className="font-semibold text-amber-300 mb-1">{title}</div>}
          <div className="leading-relaxed text-gray-200">{content}</div>
          <div className="mt-2 pt-1.5 border-t border-gray-700/60 flex justify-between items-center text-[10px] text-gray-400">
            <span>RTI Act, 2005 explainer</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
