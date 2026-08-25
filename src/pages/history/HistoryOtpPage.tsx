import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { OTPInput } from '../../components/forms/OTPInput';
import { mockApi } from '../../lib/mockApi';
import { ArrowLeft, ArrowRight, RotateCw, ShieldCheck, Mail } from 'lucide-react';

interface HistoryOtpPageProps {
  identifier: string;
  onVerified: (email: string) => void;
  onBack: () => void;
}

export const HistoryOtpPage: React.FC<HistoryOtpPageProps> = ({
  identifier,
  onVerified,
  onBack,
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (code: string) => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await mockApi.verifyHistoryOtp(identifier, code);
      if (res.verified) {
        onVerified(res.email);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Citizen History', onClick: onBack },
          { label: 'Verify OTP', current: true },
        ]}
      />

      <div className="text-center space-y-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
          Two-Factor Authentication
        </span>
        <h1 className="text-2xl font-bold text-[#1B1E22] font-display">
          Enter Verification Code
        </h1>
        <p className="text-xs text-[#575D65]">
          A 6-digit verification code was sent to <strong className="font-mono-code text-gray-800">{identifier}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs space-y-6">
        <OTPInput
          value={otp}
          onChange={(val) => {
            setOtp(val);
            if (error) setError(null);
          }}
          onComplete={(val) => handleVerify(val)}
          error={error || undefined}
        />

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Identifier</span>
          </button>

          <button
            type="button"
            disabled={otp.length !== 6 || isLoading}
            onClick={() => handleVerify(otp)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1B4B8F] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#123362] transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Open History</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
