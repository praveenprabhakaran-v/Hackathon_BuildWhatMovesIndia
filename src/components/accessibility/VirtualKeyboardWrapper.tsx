'use client';

import React, { useState, useRef } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Keyboard, X, Delete, CornerDownLeft, Space, GripHorizontal, Move } from 'lucide-react';
import { useLanguage } from '../../lib/context/LanguageContext';

export interface VirtualKeyboardWrapperProps {
  /** The current value of the controlled input or textarea */
  value: string;
  /** Callback fired when text changes via virtual keyboard */
  onChange: (newValue: string) => void;
  /** Target input or textarea ref for cursor position tracking */
  targetInputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  /** Optional custom button label override */
  buttonLabel?: string;
  className?: string;
}

// Indic Script Keyboard Layouts (Devanagari, Bengali, Telugu, Tamil)
const INDIC_KEYBOARD_LAYOUTS: Record<string, { default: string[][]; shift: string[][] }> = {
  // Hindi (Devanagari)
  hi: {
    default: [
      ['१', '२', '३', '४', '५', '६', '७', '८', '९', '०', '-', 'ृ'],
      ['ौ', 'ै', 'ा', 'ी', 'ू', 'ब', 'ह', 'ग', 'द', 'ज', 'ड', '़'],
      ['ो', 'े', '्', 'ि', 'ु', 'प', 'र', 'क', 'त', 'च', 'ट'],
      ['ं', 'म', 'न', 'व', 'ल', 'स', 'य', 'ष', 'श', 'ख', 'थ'],
      ['।', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'],
    ],
    shift: [
      ['ऍ', 'ॅ', '्र', 'र्', 'ज्ञ', 'त्र', 'क्ष', 'श्र', 'ऋ', 'ॐ', '—', 'दृ'],
      ['औ', 'ऐ', 'आ', 'ई', 'ऊ', 'भ', 'ङ', 'घ', 'ध', 'झ', 'ढ', 'ञ'],
      ['ओ', 'ए', 'अ', 'इ', 'उ', 'फ', 'ऱ', 'ख', 'थ', 'छ', 'ठ'],
      ['ँ', 'ण', 'ऩ', 'ऴ', 'ळ', 'श', 'य़', 'ष', 'स', 'ग', 'ध'],
      ['॥', '!', '?', ',', '.', ':', ';', '(', ')', '%', '/'],
    ],
  },
  // Marathi (Devanagari with ळ)
  mr: {
    default: [
      ['१', '२', '३', '४', '५', '६', '७', '८', '९', '०', '-', 'ृ'],
      ['ौ', 'ै', 'ा', 'ी', 'ू', 'ब', 'ह', 'ग', 'द', 'ज', 'ड', 'ळ'],
      ['ो', 'े', '्', 'ि', 'ु', 'प', 'र', 'क', 'त', 'च', 'ट'],
      ['ं', 'म', 'न', 'व', 'ल', 'स', 'य', 'ष', 'श', 'ख', 'थ'],
      ['।', 'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'],
    ],
    shift: [
      ['ऍ', 'ऑ', '्र', 'र्', 'ज्ञ', 'त्र', 'क्ष', 'श्र', 'ऋ', 'ॐ', '—', 'दृ'],
      ['औ', 'ऐ', 'आ', 'ई', 'ऊ', 'भ', 'ङ', 'घ', 'ध', 'झ', 'ढ', 'ञ'],
      ['ओ', 'ए', 'अ', 'इ', 'उ', 'फ', 'ऱ', 'ख', 'थ', 'छ', 'ठ'],
      ['ँ', 'ण', 'ऩ', 'ऴ', 'ळ', 'श', 'य़', 'ष', 'स', 'ग', 'ध'],
      ['॥', '!', '?', ',', '.', ':', ';', '(', ')', '%', '/'],
    ],
  },
  // Bengali (বাংলা)
  bn: {
    default: [
      ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '০', '-', 'ৃ'],
      ['ৌ', 'ৈ', 'া', 'ী', 'ূ', 'ব', 'হ', 'গ', 'দ', 'জ', 'ড', 'ড়'],
      ['ো', 'ে', '্', 'ি', 'ু', 'প', 'র', 'ক', 'ত', 'চ', 'ট'],
      ['ং', 'ম', 'ন', 'ব', 'ল', 'স', 'য', 'ষ', 'শ', 'খ', 'থ'],
      ['।', 'অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'এ', 'ঐ', 'ও', 'ঔ'],
    ],
    shift: [
      ['ৠ', 'ৡ', '্র', 'র্ক', 'জ্ঞ', 'ত্র', 'ক্ষ', 'শ্র', 'ঋ', '৲', '—', 'ৎ'],
      ['ঔ', 'ঐ', 'আ', 'ঈ', 'ঊ', 'ভ', 'ঙ', 'ঘ', 'ধ', 'ঝ', 'ঢ', 'ঢ়'],
      ['ও', 'এ', 'অ', 'ই', 'উ', 'ফ', 'র', 'খ', 'থ', 'ছ', 'ঠ'],
      ['ঁ', 'ণ', 'ঞ', 'য়', 'ল', 'শ', 'য', 'ষ', 'স', 'ঃ', '্'],
      ['॥', '!', '?', ',', '.', ':', ';', '(', ')', '%', '/'],
    ],
  },
  // Telugu (తెలుగు)
  te: {
    default: [
      ['౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯', '౦', '-', 'ృ'],
      ['ౌ', 'ై', 'ా', 'ీ', 'ూ', 'బ', 'హ', 'గ', 'ద', 'జ', 'డ', 'ఱ'],
      ['ో', 'ే', '్', 'ి', 'ు', 'ప', 'ర', 'క', 'త', 'చ', 'ట'],
      ['ం', 'మ', 'న', 'వ', 'ల', 'స', 'య', 'ష', 'శ', 'ఖ', 'థ'],
      ['।', 'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఐ', 'ఒ'],
    ],
    shift: [
      ['ౠ', 'ౡ', '్ర', 'ర్', 'జ్ఞ', 'త్ర', 'క్ష', 'శ్ర', 'ఋ', 'ౘ', '—', 'ౙ'],
      ['ఔ', 'ఐ', 'ఆ', 'ఈ', 'ఊ', 'భ', 'ఙ', 'ఘ', 'ధ', 'ఝ', 'ఢ', 'ఞ'],
      ['ఓ', 'ఏ', 'అ', 'ఇ', 'ఉ', 'ఫ', 'ఱ', 'ఖ', 'థ', 'ఛ', 'ఠ'],
      ['ఁ', 'ణ', 'న', 'ళ', 'ఴ', 'శ', 'య', 'ష', 'స', 'ః', '్'],
      ['॥', '!', '?', ',', '.', ':', ';', '(', ')', '%', '/'],
    ],
  },
  // Tamil (தமிழ்)
  ta: {
    default: [
      ['௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '௦', '-', 'ஃ'],
      ['ௌ', 'ை', 'ா', 'ீ', 'ூ', 'ப', 'ஹ', 'க', 'த', 'ச', 'ட', 'ற'],
      ['ோ', 'ே', '்', 'ி', 'ு', 'ப', 'ர', 'க', 'த', 'ச', 'ட'],
      ['ஂ', 'ம', 'ந', 'வ', 'ல', 'ஸ', 'ய', 'ஷ', 'ஶ', 'ள', 'ழ'],
      ['।', 'அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ'],
    ],
    shift: [
      ['ௐ', '௹', '௺', 'ஸ்ரீ', 'க்ஷ', 'ஜ்ஞ', 'த்ர', 'க்ஷ', '௳', '௴', '—', 'ஃ'],
      ['ஔ', 'ஐ', 'ஆ', 'ஈ', 'ஊ', 'ப', 'ங', 'க', 'த', 'ஜ', 'ட', 'ன'],
      ['ஓ', 'ஏ', 'அ', 'இ', 'உ', 'ப', 'ற', 'க', 'த', 'ச', 'ட'],
      ['ஂ', 'ண', 'ஞ', 'வ', 'ள', 'ஶ', 'ய', 'ஷ', 'ஸ', 'ஃ', '்'],
      ['॥', '!', '?', ',', '.', ':', ';', '(', ')', '%', '/'],
    ],
  },
};

const LANGUAGE_KEYBOARD_NAMES: Record<string, { label: string; title: string }> = {
  hi: { label: 'हिन्दी कीबोर्ड', title: 'हिन्दी ऑन-स्क्रीन कीबोर्ड (Hindi Virtual Keyboard)' },
  mr: { label: 'मराठी कीबोर्ड', title: 'मराठी ऑन-स्क्रीन कीबोर्ड (Marathi Virtual Keyboard)' },
  bn: { label: 'বাংলা কীবোর্ড', title: 'বাংলা অন-স্ক্রিন কীবোর্ড (Bengali Virtual Keyboard)' },
  te: { label: 'తెలుగు కీబోర్డ్', title: 'తెలుగు ఆన్-స్క్రీన్ కీబోర్డ్ (Telugu Virtual Keyboard)' },
  ta: { label: 'தமிழ் விசைப்பலகை', title: 'தமிழ் விசைப்பலகை (Tamil Virtual Keyboard)' },
};

export const VirtualKeyboardWrapper: React.FC<VirtualKeyboardWrapperProps> = ({
  value,
  onChange,
  targetInputRef,
  buttonLabel,
  className = '',
}) => {
  const { currentLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isShift, setIsShift] = useState(false);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // If English is selected or layout is unavailable, do not render keyboard toggle
  const layout = INDIC_KEYBOARD_LAYOUTS[currentLocale];
  if (currentLocale === 'en' || !layout) {
    return null;
  }

  const langInfo = LANGUAGE_KEYBOARD_NAMES[currentLocale] || {
    label: 'कीबोर्ड',
    title: 'Virtual Keyboard',
  };

  const handleKeyPress = (char: string) => {
    if (!targetInputRef?.current) {
      onChange(value + char);
      return;
    }

    const input = targetInputRef.current;
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;

    const nextValue = value.substring(0, start) + char + value.substring(end);
    onChange(nextValue);

    // Maintain focus and update cursor position
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  const handleBackspace = () => {
    if (!targetInputRef?.current) {
      onChange(value.slice(0, -1));
      return;
    }

    const input = targetInputRef.current;
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;

    if (start === end && start > 0) {
      const nextValue = value.substring(0, start - 1) + value.substring(end);
      onChange(nextValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start - 1, start - 1);
      }, 0);
    } else if (start !== end) {
      const nextValue = value.substring(0, start) + value.substring(end);
      onChange(nextValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start, start);
      }, 0);
    }
  };

  const currentRows = isShift ? layout.shift : layout.default;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Keyboard Activation Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={langInfo.title}
        title={langInfo.title}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer select-none shrink-0 ${
          isOpen
            ? 'bg-[#1B4B8F] text-white border-[#1B4B8F] shadow-sm'
            : 'bg-white text-[#1B4B8F] border-[#1B4B8F]/30 hover:bg-[#EEF3FA] hover:border-[#1B4B8F]'
        }`}
      >
        <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
        <span>{buttonLabel || langInfo.label}</span>
      </button>

      {/* Floating Draggable On-Screen Keyboard Drawer */}
      {isOpen && (
        <motion.div
          ref={keyboardContainerRef}
          role="region"
          aria-label={langInfo.title}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.05}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{ zIndex: 9999 }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[9999] w-[96vw] max-w-[580px] bg-[#FAF9F5] border-2 border-[#1B4B8F] rounded-2xl p-3 sm:p-4 shadow-2xl touch-none"
        >
          {/* Header Bar with Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2DDD5] cursor-grab active:cursor-grabbing select-none bg-[#F3EFE6] -mx-3 -mt-3 sm:-mx-4 sm:-mt-4 px-3 sm:px-4 pt-2.5 pb-2 rounded-t-2xl"
            title="Click and drag to reposition keyboard"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 bg-white/80 rounded text-[#1B4B8F] border border-gray-200">
                <GripHorizontal className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Keyboard className="w-3.5 h-3.5 text-[#1B4B8F] shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-[#1B4B8F] font-display truncate">
                  {langInfo.title}
                </span>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-white/60 px-1.5 py-0.5 rounded">
                <Move className="w-2.5 h-2.5" />
                Drag to Move
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsShift(!isShift)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                  isShift
                    ? 'bg-[#1B4B8F] text-white border-[#1B4B8F]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {isShift ? 'Shift: ON' : 'Shift'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200/60 cursor-pointer"
                aria-label="Close virtual keyboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Rows */}
          <div className="space-y-1.5 select-none pt-1">
            {currentRows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-1">
                {row.map((char, charIdx) => (
                  <button
                    key={`${rowIdx}-${charIdx}`}
                    type="button"
                    onClick={() => handleKeyPress(char)}
                    className="flex-1 min-w-[24px] sm:min-w-[32px] h-8 sm:h-9 bg-white border border-[#E2DDD5] text-gray-900 text-xs sm:text-sm font-medium rounded-md hover:bg-[#EEF3FA] hover:border-[#1B4B8F] active:scale-95 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    {char}
                  </button>
                ))}
              </div>
            ))}

            {/* Action Bar / Spacebar / Controls */}
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleBackspace}
                className="px-3 h-8 sm:h-9 bg-[#FEECEC] border border-red-200 text-red-700 text-xs font-semibold rounded-md hover:bg-red-100 flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                title="Backspace"
              >
                <Delete className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Del</span>
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress(' ')}
                className="flex-1 h-8 sm:h-9 bg-white border border-[#E2DDD5] text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-100 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Space className="w-3.5 h-3.5" />
                <span>Space</span>
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('\n')}
                className="px-3 h-8 sm:h-9 bg-[#EEF3FA] border border-[#1B4B8F]/30 text-[#1B4B8F] text-xs font-semibold rounded-md hover:bg-[#1B4B8F] hover:text-white flex items-center justify-center gap-1 shrink-0 cursor-pointer transition-colors"
                title="New line"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enter</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

