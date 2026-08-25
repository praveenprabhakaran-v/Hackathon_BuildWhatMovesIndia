import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  User,
  KeyRound,
  Copy,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { EmblemLogo } from '../../components/layout/EmblemLogo';
import { mockApi } from '../../lib/mockApi';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; name?: string }) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('demo.citizen@example.com');
  const [password, setPassword] = useState('Demo@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFillDemoCredentials = () => {
    setEmail('demo.citizen@example.com');
    setPassword('Demo@1234');
    setErrorMessage(null);
  };

  const handleFillEvaluatorCredentials = () => {
    setEmail('judge.evaluator@nic.in');
    setPassword('evaluator@2026');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await mockApi.login(email.trim(), password);
      onLoginSuccess({
        email: response.user.email,
        name: response.user.name,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      <Breadcrumbs
        items={[
          { label: 'Citizen Services', onClick: onNavigateHome },
          { label: 'Convenience Login', current: true },
        ]}
      />

      {/* Header Emblem & Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-[#1B4B8F] text-white flex items-center justify-center mx-auto shadow-md p-2">
          <EmblemLogo variant="white" size="md" />
        </div>
        <div>
          <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-3 py-1 rounded-full border border-[#1B4B8F]/20">
            RTI Reconstruction Prototype
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1E22] font-display mt-2">
            Citizen Convenience Login
          </h1>
          <p className="text-xs sm:text-sm text-[#575D65] max-w-md mx-auto mt-1">
            Sign in to access your consolidated dashboard of filed RTI applications, pending CPIO responses, and First Appeals.
          </p>
        </div>
      </div>

      {/* VISIBLE DUMMY CREDENTIALS BANNER */}
      <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-2.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Judge & Evaluator Credentials
              </span>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-[11px] font-semibold text-[#1B4B8F] hover:text-[#123362] bg-white px-2.5 py-1 rounded-md border border-amber-200 shadow-xs hover:border-[#1B4B8F]"
              >
                Auto-Fill Demo Credentials
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 font-medium block text-[10px]">Email:</span>
                  <span className="font-mono-code font-bold text-gray-800 select-all">
                    demo.citizen@example.com
                  </span>
                </div>
                <button
                  type="button"
                  title="Copy email"
                  onClick={() => handleCopy('demo.citizen@example.com', 'email')}
                  className="text-gray-400 hover:text-[#1B4B8F] p-1"
                >
                  {copiedField === 'email' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 font-medium block text-[10px]">Password:</span>
                  <span className="font-mono-code font-bold text-gray-800 select-all">
                    Demo@1234
                  </span>
                </div>
                <button
                  type="button"
                  title="Copy password"
                  onClick={() => handleCopy('Demo@1234', 'password')}
                  className="text-gray-400 hover:text-[#1B4B8F] p-1"
                >
                  {copiedField === 'password' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-amber-800/90 leading-tight">
              Pre-seeded with historical RTI application status <span className="font-semibold text-amber-950">UNDER_PROCESSING</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Form Box */}
      <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 sm:p-8 shadow-sm">
        {/* Fast 1-Click Access Buttons for Judges */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
            Quick 1-Click Access for Evaluation
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left shadow-xs ${
                email === 'demo.citizen@example.com'
                  ? 'border-[#1B4B8F] bg-[#EEF3FA] text-[#1B4B8F]'
                  : 'border-gray-200 bg-white hover:border-[#1B4B8F] text-gray-800'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0 text-[#1B4B8F]" />
              <div>
                <div className="font-bold text-xs">Demo Citizen</div>
                <div className="text-[10px] opacity-80">demo.citizen@example.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleFillEvaluatorCredentials}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                email === 'judge.evaluator@nic.in'
                  ? 'border-[#1B4B8F] bg-[#EEF3FA] text-[#1B4B8F]'
                  : 'border-gray-200 bg-white hover:border-[#1B4B8F] text-gray-800'
              }`}
            >
              <User className="w-4 h-4 shrink-0 text-emerald-600" />
              <div>
                <div className="font-bold text-xs">Evaluator Judge</div>
                <div className="text-[10px] text-gray-500">judge.evaluator@nic.in</div>
              </div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Custom Credential Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1B1E22] mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo.citizen@example.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E2DDD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4B8F]/20 text-[#1B1E22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B1E22] mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Demo@1234"
                className="w-full pl-10 pr-12 py-2.5 text-sm bg-white border border-[#E2DDD5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B4B8F]/20 text-[#1B1E22]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B4B8F] p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input type="checkbox" defaultChecked className="rounded text-[#1B4B8F] focus:ring-[#1B4B8F]" />
              <span>Remember me on this browser</span>
            </label>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="text-[#1B4B8F] hover:underline"
            >
              Reset to Demo Credentials
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#1B4B8F] text-white font-semibold text-sm rounded-xl hover:bg-[#123362] transition-colors shadow-sm focus:ring-4 focus:ring-[#1B4B8F]/20 disabled:opacity-60 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating Session...</span>
              </span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Log In to Citizen Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Filing an RTI does not require an existing account —{' '}
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-[#1B4B8F] font-semibold underline hover:text-[#123362]"
          >
            File directly as Guest Citizen
          </button>
        </p>
      </div>
    </div>
  );
};
