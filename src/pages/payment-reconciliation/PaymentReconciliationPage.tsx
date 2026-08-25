import React from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { ReconciliationForm } from '../../components/payments/ReconciliationForm';

interface PaymentReconciliationPageProps {
  onApplicationFound: (regNo: string) => void;
}

export const PaymentReconciliationPage: React.FC<PaymentReconciliationPageProps> = ({
  onApplicationFound,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Breadcrumbs
        items={[
          { label: 'Payment Reconciliation', current: true },
        ]}
      />

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#1B4B8F] bg-[#EEF3FA] px-2.5 py-0.5 rounded">
          Treasury Gateway Settlement
        </span>
        <h1 className="text-3xl font-bold text-[#1B1E22] font-display">
          Reconcile Dropped / Pending Fee Payments
        </h1>
        <p className="text-xs sm:text-sm text-[#575D65]">
          Verify settlement status for payments where session timed out or transaction receipt was not displayed.
        </p>
      </div>

      <ReconciliationForm onApplicationFound={onApplicationFound} />
    </div>
  );
};
