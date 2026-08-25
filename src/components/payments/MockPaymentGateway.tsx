import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, ShieldAlert, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export interface MockPaymentGatewayProps {
  amount: number;
  draftId?: string;
  registrationNumberPreview?: string;
  purpose?: string;
  beneficiary?: string;
  // Handler prop name flexibility
  onSimulateSuccess?: (method: 'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING') => void;
  onSimulateFailure?: (method: 'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING') => void;
  onSimulateTimeout?: () => void;
  onSuccess?: (method: 'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING') => void;
  onFailure?: (method: 'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING') => void;
  onTimeout?: () => void;
  isLoading?: boolean;
}

export const MockPaymentGateway: React.FC<MockPaymentGatewayProps> = ({
  amount = 10,
  draftId,
  purpose = 'Statutory RTI Application Fee (Section 6(1))',
  beneficiary = 'Central Public Information Officer (CPIO), Consolidated Fund of India',
  onSimulateSuccess,
  onSimulateFailure,
  onSimulateTimeout,
  onSuccess,
  onFailure,
  onTimeout,
  isLoading = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING'>('UPI');
  const [activeSimulation, setActiveSimulation] = useState<'SUCCESS' | 'FAILURE' | 'TIMEOUT' | null>(null);

  const methods = [
    { id: 'UPI', label: 'UPI / QR / VPA', icon: Smartphone, subtitle: 'Google Pay, PhonePe, BHIM, Paytm' },
    { id: 'RUPAY', label: 'RuPay Debit Card', icon: CreditCard, subtitle: 'Zero MDR statutory government fee' },
    { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Visa, MasterCard, Maestro' },
    { id: 'NETBANKING', label: 'Internet Banking', icon: Building, subtitle: 'SBI, PNB, HDFC, ICICI, Canara Bank' },
  ];

  const handleSuccessClick = () => {
    setActiveSimulation('SUCCESS');
    const fn = onSimulateSuccess || onSuccess;
    if (fn) {
      fn(selectedMethod);
    }
  };

  const handleFailureClick = () => {
    setActiveSimulation('FAILURE');
    const fn = onSimulateFailure || onFailure;
    if (fn) {
      fn(selectedMethod);
    }
  };

  const handleTimeoutClick = () => {
    setActiveSimulation('TIMEOUT');
    const fn = onSimulateTimeout || onTimeout;
    if (fn) {
      fn();
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-400 bg-gray-100 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-md">
      {/* Header: Payment Gateway — DEMO MODE */}
      <div className="border-b border-gray-300 pb-4 mb-6 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-mono-code text-xs font-bold tracking-wider uppercase text-gray-700 bg-gray-200 px-3 py-1 rounded border border-gray-400">
            Payment Gateway — DEMO MODE
          </span>
          <h3 className="text-xl font-bold text-gray-900 mt-2 font-display">
            Simulated Treasury Gateway (Bharatkosh Non-Real)
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">{purpose}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-gray-500 block font-mono-code">Total Payable</span>
          <span className="text-2xl font-bold text-gray-900 font-mono-code">₹{amount}.00</span>
        </div>
      </div>

      {/* Mandatory Demo Warning */}
      <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded-r-md text-xs text-amber-900 mb-6 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          <strong>Simulated Sandbox:</strong> No actual money will be deducted from your bank account or card. Click <strong>Simulate Successful Payment</strong> to complete your application, or <strong>Simulate Failed Payment</strong> / <strong>Gateway Timeout</strong> to test edge case handling.
        </span>
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-2 mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
          Select Payment Instrument:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {methods.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id as any)}
                className={`p-3 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-gray-300 bg-gray-50 hover:bg-white'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-gray-900 truncate">{m.label}</div>
                  <div className="text-[10px] text-gray-500 truncate">{m.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Trigger Buttons */}
      <div className="space-y-3 pt-4 border-t border-gray-300">
        <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 text-center">
          Payment Simulation Controls:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSuccessClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1E7A46] text-white font-semibold text-sm hover:bg-[#155a33] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isLoading && activeSimulation === 'SUCCESS' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Simulate Successful Payment</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleFailureClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#C23B22] text-white font-semibold text-sm hover:bg-[#962a16] transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isLoading && activeSimulation === 'FAILURE' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Simulating Decline...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Simulate Failed Payment</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleTimeoutClick}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-200 text-gray-700 font-medium text-xs hover:bg-gray-300 transition-colors border border-gray-400 disabled:opacity-60 cursor-pointer"
        >
          {isLoading && activeSimulation === 'TIMEOUT' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              <span>Simulating Network Timeout...</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Simulate Gateway Timeout (Test Payment Reconciliation)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
