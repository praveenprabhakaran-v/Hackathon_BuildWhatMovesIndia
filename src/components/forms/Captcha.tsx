import React, { useState, useEffect } from 'react';
import { RotateCw, Volume2, ShieldCheck, Check, AlertCircle } from 'lucide-react';

interface CaptchaProps {
  id?: string;
  onVerify: (isValid: boolean, token: string) => void;
  error?: string;
  className?: string;
}

const CAPTCHA_WORDS = ['7K9X2', '4M8P3', '9R2W5', '3L6T8', '8V4N7', '5B9Y1', '2P8K4'];

export const Captcha: React.FC<CaptchaProps> = ({
  id = 'captcha-input',
  onVerify,
  error,
  className = '',
}) => {
  const [captchaIndex, setCaptchaIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isPassed, setIsPassed] = useState(false);

  const errorId = `${id}-error`;
  const currentCode = CAPTCHA_WORDS[captchaIndex];

  const reloadCaptcha = () => {
    const next = (captchaIndex + 1) % CAPTCHA_WORDS.length;
    setCaptchaIndex(next);
    setUserInput('');
    setIsPassed(false);
    onVerify(false, '');
  };

  const handleInputChange = (val: string) => {
    const uppercase = val.toUpperCase().trim();
    setUserInput(uppercase);

    if (uppercase === currentCode) {
      setIsPassed(true);
      onVerify(true, `token_${Date.now()}`);
    } else {
      setIsPassed(false);
      onVerify(false, '');
    }
  };

  const speakCaptcha = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = currentCode.split('').join(' ');
      msg.rate = 0.8;
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className={`space-y-2 w-full max-w-[640px] ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[#1B1E22]">
        <span>Security Verification (Captcha)</span>
        <span className="text-[#C23B22] ml-1 font-bold" aria-hidden="true">*</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {/* Captcha Image Simulation Card */}
        <div className="h-12 px-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 rounded-lg border border-gray-400 flex items-center justify-center select-none shadow-inner relative overflow-hidden shrink-0">
          {/* Subtle security lines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
            <svg width="100%" height="100%">
              <line x1="0" y1="10" x2="100%" y2="35" stroke="#000" strokeWidth="1.5" />
              <line x1="0" y1="35" x2="100%" y2="15" stroke="#000" strokeWidth="1.5" />
            </svg>
          </div>

          <span className="font-mono-code font-black text-2xl tracking-[0.3em] text-[#123362] italic transform -skew-x-6">
            {currentCode}
          </span>
        </div>

        {/* Action buttons: Reload & Voice */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={reloadCaptcha}
            aria-label="Reload new captcha image"
            className="p-2.5 rounded-lg border border-[#E2DDD5] bg-white text-gray-700 hover:text-[#1B4B8F] hover:bg-[#EEF3FA] transition-colors focus:ring-2 focus:ring-[#1B4B8F]"
          >
            <RotateCw className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={speakCaptcha}
            aria-label="Read captcha characters aloud for accessibility"
            className="p-2.5 rounded-lg border border-[#E2DDD5] bg-white text-gray-700 hover:text-[#1B4B8F] hover:bg-[#EEF3FA] transition-colors focus:ring-2 focus:ring-[#1B4B8F]"
          >
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Input box */}
        <div className="flex-1 min-w-[120px]">
          <div className="relative">
            <input
              id={id}
              type="text"
              value={userInput}
              maxLength={6}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter code"
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`w-full min-h-[44px] px-3.5 py-2 text-base font-mono-code uppercase rounded-lg border transition-all ${
                isPassed
                  ? 'border-2 border-[#1E7A46] bg-[#EAF6EE]/30 pr-10'
                  : error
                  ? 'border-2 border-[#C23B22] bg-[#FDEEED]/30'
                  : 'border-[#E2DDD5] bg-white focus:border-[#1B4B8F] focus:ring-2 focus:ring-[#1B4B8F]/20'
              }`}
            />
            {isPassed && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E7A46]">
                <Check className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div id={errorId} role="alert" aria-live="assertive" className="flex items-center gap-1.5 text-xs text-[#C23B22] font-semibold pt-0.5">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

