import React from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { Authority } from '../../types/rti';

interface PaymentCardProps {
  amount: number;
  authority?: Authority;
  isBpl?: boolean;
  applicantName?: string;
  className?: string;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  amount,
  authority,
  isBpl = false,
  applicantName,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EEF3FA] text-[#1B4B8F] flex items-center justify-center">
            <CreditCard className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#1B1E22] font-display">
              Statutory Fee Summary
            </h4>
            <p className="text-xs text-[#575D65]">
              RTI Rules 2012 · Department of Personnel & Training
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono-code text-[#1B4B8F]">
            ₹{amount}.00
          </span>
          <span className="block text-[10px] text-gray-500 uppercase font-medium">
            {isBpl ? 'Statutory Waiver' : 'Single Application'}
          </span>
        </div>
      </div>

      {/* Itemized breakdown */}
      <div className="space-y-2 text-xs divide-y divide-gray-100">
        <div className="flex justify-between py-1.5 text-gray-600">
          <span>Standard Application Fee (Section 6(1)):</span>
          <span className="font-mono-code font-semibold text-gray-900">₹10.00</span>
        </div>

        {isBpl && (
          <div className="flex justify-between py-1.5 text-[#1E7A46] font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Below Poverty Line (BPL) Exemption:</span>
            </span>
            <span className="font-mono-code font-bold">- ₹10.00</span>
          </div>
        )}

        <div className="flex justify-between py-1.5 text-gray-600">
          <span>Payment Gateway Charges (MDR):</span>
          <span className="font-mono-code text-emerald-600 font-semibold">₹0.00 (Waived)</span>
        </div>

        <div className="flex justify-between pt-3 font-bold text-sm text-[#1B1E22]">
          <span>Net Amount Due:</span>
          <span className="font-mono-code text-base text-[#1B4B8F]">₹{amount}.00</span>
        </div>
      </div>

      {authority && (
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          Payable to Head of Account: <strong className="text-gray-700">{authority.name}</strong>
        </div>
      )}
    </div>
  );
};
