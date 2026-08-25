import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface OTPInputProps {
  id?: string;
  label?: string;
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  id = 'otp-input',
  label = '6-Digit Verification Code',
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = new Array(length).fill('');
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i];
    }
    return arr;
  });

  useEffect(() => {
    const arr = new Array(length).fill('');
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i];
    }
    setDigits(arr);
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    if (disabled) return;

    const lastChar = val.slice(-1);
    if (lastChar && !/^\d$/.test(lastChar)) return;

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);

    const fullCode = newDigits.join('');
    onChange(fullCode);

    // Auto-advance to next box if char entered
    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (fullCode.length === length && onComplete && !newDigits.includes('')) {
      onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pasteData)) return;

    const newDigits = [...digits];
    for (let i = 0; i < length; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setDigits(newDigits);

    const fullCode = newDigits.join('');
    onChange(fullCode);

    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (fullCode.length === length && onComplete) {
      onComplete(fullCode);
    }
  };

  const fillDemoOtp = () => {
    const demo = '123456';
    const newDigits = demo.split('');
    setDigits(newDigits);
    onChange(demo);
    inputRefs.current[5]?.focus();
    if (onComplete) {
      onComplete(demo);
    }
  };

  return (
    <div className="space-y-3 w-full max-w-full">
      {/* Persistent visually rendered Label */}
      <label id={`${id}-label`} htmlFor={`${id}-0`} className="block text-sm font-medium text-[#1B1E22]">
        {label} <span className="text-[#C23B22] font-bold" aria-hidden="true">*</span>
      </label>

      {/* 6 Inputs Grid with responsive width for 320px screens */}
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className="flex items-center gap-1.5 sm:gap-2.5 max-w-full overflow-x-auto py-1"
        onPaste={handlePaste}
      >
        {Array.from({ length }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            id={`${id}-${idx}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[idx] || ''}
            disabled={disabled}
            aria-label={`Digit ${idx + 1} of 6 verification code`}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-9 sm:w-12 h-11 sm:h-13 text-center text-lg sm:text-2xl font-mono-code font-bold rounded-lg border transition-all select-none shrink-0 ${
              error
                ? 'border-2 border-[#C23B22] text-[#C23B22] bg-[#FDEEED]/40 focus:ring-2 focus:ring-[#C23B22]/20'
                : digits[idx]
                ? 'border-[#1B4B8F] text-[#1B4B8F] bg-[#EEF3FA]/30 focus:ring-2 focus:ring-[#1B4B8F]/20'
                : 'border-[#E2DDD5] bg-white text-[#1B1E22] focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20'
            }`}
          />
        ))}
      </div>

      {/* Mandatory Demo Mode Disclosure directly beneath */}
      <div className="bg-[#FEF8E7] border border-[#F4E3B5] rounded-lg p-3 text-xs text-[#7C4E0A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-md">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#B7791F] shrink-0" aria-hidden="true" />
          <span>Demo mode — OTP: <strong className="font-mono-code text-sm text-[#1B1E22]">123456</strong> (a real deployment would SMS this).</span>
        </div>
        <button
          type="button"
          onClick={fillDemoOtp}
          className="self-start sm:self-center px-2.5 py-1 bg-[#B7791F] text-white rounded font-medium hover:bg-[#7C4E0A] transition-colors shrink-0 text-xs"
        >
          Auto-fill 123456
        </button>
      </div>

      {error && (
        <div id={`${id}-error`} role="alert" aria-live="assertive" className="text-xs text-[#C23B22] font-semibold">
          {error}
        </div>
      )}
    </div>
  );
};

