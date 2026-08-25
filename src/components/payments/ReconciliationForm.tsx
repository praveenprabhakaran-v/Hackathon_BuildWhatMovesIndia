import React, { useState } from 'react';
import { Search, RotateCw, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { mockApi } from '../../lib/mockApi';
import { FormField } from '../forms/FormField';
import { TextInput } from '../forms/TextInput';
import { Notice } from '../status/Notice';

interface ReconciliationFormProps {
  onApplicationFound?: (regNo: string) => void;
}

export const ReconciliationForm: React.FC<ReconciliationFormProps> = ({ onApplicationFound }) => {
  const [refInput, setRefInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    status?: string;
    registrationNumber?: string;
    amount?: number;
    date?: string;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) {
      setError('Please enter a Transaction Reference (e.g. UPI/2026/...) or Registration Number.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await mockApi.reconcilePayment(refInput.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to reconcile transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 sm:p-8 max-w-xl mx-auto shadow-xs">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-[#1B1E22] font-display">
          Reconcile Fee Payment
        </h3>
        <p className="text-xs text-[#575D65] mt-1 leading-relaxed">
          If money was debited from your bank account or UPI app but your RTI Registration Number was not displayed due to connection disruption or session timeout, check transaction settlement status here.
        </p>
      </div>

      <form onSubmit={handleReconcile} className="space-y-4">
        <FormField
          id="rec-ref"
          label="Bank Transaction Ref / Order Number / RTI Registration No."
          required
          error={error || undefined}
          helperText="e.g. UPI/2026/789123849, RUPAY/2026/339182, or DOTEL/R/2026/10492"
        >
          <TextInput
            id="rec-ref"
            value={refInput}
            onChange={(e) => {
              setRefInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter payment reference or registration number"
            error={!!error}
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1B4B8F] text-white text-sm font-semibold rounded-lg hover:bg-[#123362] transition-colors focus:ring-4 focus:ring-[#1B4B8F]/20 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Checking Treasury Log...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Verify Transaction</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result announcement */}
      {result && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          {result.found ? (
            <Notice variant="success" title="Payment Reconciled & Confirmed">
              <p className="text-xs">{result.message}</p>
              <div className="bg-white rounded-lg p-3 border border-emerald-200 mt-2 space-y-1 font-mono-code text-xs">
                <div>Registration Number: <strong className="text-[#1B4B8F]">{result.registrationNumber}</strong></div>
                <div>Status: <span className="font-semibold text-[#1E7A46]">{result.status}</span></div>
                {result.amount !== undefined && <div>Amount Verified: ₹{result.amount}.00</div>}
              </div>

              {result.registrationNumber && onApplicationFound && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => onApplicationFound(result.registrationNumber!)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4B8F] hover:underline"
                  >
                    <span>Go to Tracking Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </Notice>
          ) : (
            <Notice variant="warning" title="No Settlement Record Found">
              <p className="text-xs">{result.message}</p>
            </Notice>
          )}
        </div>
      )}
    </div>
  );
};
