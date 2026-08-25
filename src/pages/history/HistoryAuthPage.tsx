import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { FormSection } from '../../components/forms/FormSection';
import { FormField } from '../../components/forms/FormField';
import { TextInput } from '../../components/forms/TextInput';
import { EMAIL_REGEX } from '../../lib/validation';
import { mockApi } from '../../lib/mockApi';
import { ShieldCheck, Mail, ArrowRight, RotateCw, History, UserCheck, Sparkles, KeyRound } from 'lucide-react';
import { EmblemLogo } from '../../components/layout/EmblemLogo';

interface HistoryAuthPageProps {
  onOtpRequested: (identifier: string) => void;
  onDirectLogin?: (email: string) => void;
  onNavigateHome: () => void;
}

export const HistoryAuthPage: React.FC<HistoryAuthPageProps> = ({ onOtpRequested, onDirectLogin, onNavigateHome }) => {
  const [identifier, setIdentifier] = useState('aarav.sharma@example.com');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();

    if (!val) {
      setError('Please enter your registered email address or 10-digit mobile number.');
      return;
    }

    const isEmail = EMAIL_REGEX.test(val);
    const isMobile = /^[6-9]\d{9}$/.test(val);

    if (!isEmail && !isMobile) {
      // In mock mode, allow any entered value to proceed
      if (onDirectLogin) {
        onDirectLogin(val.includes('@') ? val : `${val}@citizen.gov.in`);
        return;
      }
    }

    setError(null);
    setIsLoading(true);

    try {
      await mockApi.requestHistoryOtp(val);
      onOtpRequested(val);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Citizen History', current: true },
        ]}
      />

      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#1B4B8F] text-white flex items-center justify-center mx-auto shadow-sm p-1.5">
          <EmblemLogo variant="white" size="sm" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1B1E22] font-display">
          Citizen Application History & Dashboard
        </h1>
        <p className="text-xs text-[#575D65] max-w-md mx-auto leading-relaxed">
          Access your consolidated history of filed RTI applications, pending action notices, and First Appeals.
        </p>
      </div>

      {/* Quick Access Card for Judges */}
      <div className="bg-[#EEF3FA] border border-[#1B4B8F]/30 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#1B4B8F] font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Hackathon Evaluation & Judge Quick Access:</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => onDirectLogin ? onDirectLogin('judge.evaluator@nic.in') : onOtpRequested('judge.evaluator@nic.in')}
            className="px-3 py-1.5 bg-[#1B4B8F] text-white rounded-lg font-semibold hover:bg-[#123362] transition-colors"
          >
            ⚡ Instant Login as Evaluator Judge
          </button>
          <button
            type="button"
            onClick={() => onDirectLogin ? onDirectLogin('aarav.sharma@example.com') : onOtpRequested('aarav.sharma@example.com')}
            className="px-3 py-1.5 bg-white border border-[#1B4B8F] text-[#1B4B8F] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Aarav Sharma (Demo Citizen)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="history-identifier"
            label="Registered Email Address or Mobile Number"
            required
            error={error || undefined}
            helperText="e.g. aarav.sharma@example.com or any email (Demo uses 123456 as OTP)"
          >
            <TextInput
              id="history-identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(null);
              }}
              placeholder="e.g. aarav.sharma@example.com"
              leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
              error={!!error}
            />
          </FormField>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#1B4B8F] text-white font-semibold text-sm rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Sending Verification Code...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Verify & Access Dashboard (OTP)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

