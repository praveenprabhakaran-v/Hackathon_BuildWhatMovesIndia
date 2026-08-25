import React, { useState } from 'react';
import { useRTIDraft } from '../../lib/context/rti-draft';
import { useLanguage } from '../../lib/context/LanguageContext';
import { FormSection } from '../../components/forms/FormSection';
import { MockPaymentGateway } from '../../components/payments/MockPaymentGateway';
import { Notice } from '../../components/status/Notice';
import { mockApi } from '../../lib/mockApi';
import { RTIApplication } from '../../types/rti';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

interface Step8PaymentProps {
  onSuccess: (app: RTIApplication) => void;
  onBack: () => void;
  onNavigateReconciliation: () => void;
}

export const Step8Payment: React.FC<Step8PaymentProps> = ({
  onSuccess,
  onBack,
  onNavigateReconciliation,
}) => {
  const { draft } = useRTIDraft();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeoutNotice, setTimeoutNotice] = useState(false);

  const handleSimulateSuccess = async (method: 'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING') => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeoutNotice(false);

    try {
      const res = await mockApi.processMockPayment(draft, method, 'SUCCESS');
      if (res.status === 'PAYMENT_SUCCESS' && res.application) {
        onSuccess(res.application);
      } else if (res.status === 'PAYMENT_SUCCESS' && res.registrationNumber) {
        const fullApp = await mockApi.getApplicationByRegNo(res.registrationNumber);
        if (fullApp) {
          onSuccess(fullApp);
        } else if (res.application) {
          onSuccess(res.application);
        } else {
          throw new Error('Could not retrieve application details after payment.');
        }
      } else {
        throw new Error(res.error || 'Payment could not be completed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateFailure = async (method: 'UPI' | 'CARD' | 'RUPAY' | 'NETBANKING') => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeoutNotice(false);

    try {
      const res = await mockApi.processMockPayment(draft, method, 'FAILURE');
      setErrorMessage(
        res.error ||
          'Simulated Transaction Failed: The issuing bank / card network declined authorization (Code: 91). No amount has been deducted. You may try again with another method or retry.'
      );
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Simulated Transaction Failed: Payment gateway returned rejection. Please retry or choose another payment method.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTimeout = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeoutNotice(false);

    try {
      await mockApi.processMockPayment(draft, 'UPI', 'TIMEOUT');
      setTimeoutNotice(true);
    } catch (err: any) {
      setTimeoutNotice(true);
      setErrorMessage(err.message || 'Payment gateway connection timed out (Simulated).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormSection
        title={t('form.payment.title')}
        description={t('form.payment.desc')}
      >
        {/* Error Notice */}
        {errorMessage && !timeoutNotice && (
          <div role="alert" className="mb-4">
            <Notice variant="error" title="Transaction Declined (Simulated)">
              <div className="space-y-2">
                <p className="text-xs break-words">{errorMessage}</p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#C23B22] hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Dismiss and Try Again</span>
                  </button>
                </div>
              </div>
            </Notice>
          </div>
        )}

        {/* Timeout Notice with Reconciliation Link */}
        {timeoutNotice && (
          <div role="alert" className="mb-4">
            <Notice
              variant="warning"
              title="Gateway Session Timed Out (Simulated)"
              action={
                <button
                  type="button"
                  onClick={onNavigateReconciliation}
                  className="text-xs font-bold text-[#1B4B8F] hover:underline inline-flex items-center gap-1"
                >
                  <span>Go to Payment Reconciliation Tool →</span>
                </button>
              }
            >
              <p className="text-xs break-words">
                Transaction state is pending at bank aggregator. You can verify or recover payment status using the Reconciliation tool with your draft reference.
              </p>
            </Notice>
          </div>
        )}

        {/* Mock Payment Gateway Component */}
        <MockPaymentGateway
          amount={10}
          draftId={draft.draftId}
          purpose="Statutory RTI Application Fee (Section 6(1))"
          beneficiary="Central Public Information Officer (CPIO), Consolidated Fund of India"
          isLoading={isLoading}
          onSimulateSuccess={handleSimulateSuccess}
          onSimulateFailure={handleSimulateFailure}
          onSimulateTimeout={handleSimulateTimeout}
          onSuccess={handleSimulateSuccess}
          onFailure={handleSimulateFailure}
          onTimeout={handleSimulateTimeout}
        />
      </FormSection>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-gray-700 bg-white border border-[#E2DDD5] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-normal break-words"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>{t('btn.back')}</span>
        </button>
      </div>
    </div>
  );
};
