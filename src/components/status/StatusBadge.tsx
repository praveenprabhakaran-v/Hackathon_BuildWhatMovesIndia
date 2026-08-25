import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  CircleDot,
  Clock,
  Archive,
  Layers,
  Send,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { ApplicationStatus } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const { t } = useLanguage();

  const getBadgeConfig = (st: ApplicationStatus) => {
    switch (st) {
      case 'RESPONSE_AVAILABLE':
        return {
          bg: 'bg-[#EAF6EE] text-[#1E7A46] border border-[#1E7A46]/30',
          icon: CheckCircle2,
          defaultLabel: 'Response Available',
        };
      case 'ADDITIONAL_FEE_REQUIRED':
        return {
          bg: 'bg-[#FEF8E7] text-[#B7791F] border border-[#B7791F]/40',
          icon: AlertTriangle,
          defaultLabel: 'Action Required: Additional Fee',
        };
      case 'SUPPORTING_DOCUMENT_REQUIRED':
        return {
          bg: 'bg-[#FEF8E7] text-[#B7791F] border border-[#B7791F]/40',
          icon: AlertTriangle,
          defaultLabel: 'Action Required: Supporting Document',
        };
      case 'RETURNED':
        return {
          bg: 'bg-[#FDEEED] text-[#C23B22] border border-[#C23B22]/30',
          icon: XCircle,
          defaultLabel: 'Returned / Exempted',
        };
      case 'PAYMENT_FAILED':
        return {
          bg: 'bg-[#FDEEED] text-[#C23B22] border border-[#C23B22]/30',
          icon: XCircle,
          defaultLabel: 'Payment Failed',
        };
      case 'TRANSFERRED':
        return {
          bg: 'bg-white text-[#1B4B8F] border-2 border-[#1B4B8F]',
          icon: ArrowRightCircle,
          defaultLabel: 'Transferred (Sec 6(3))',
        };
      case 'CLOSED':
        return {
          bg: 'bg-gray-100 text-[#1B1E22]/70 border border-gray-300',
          icon: Archive,
          defaultLabel: 'Case Closed',
        };
      case 'MULTIPLE_CPIO':
        return {
          bg: 'bg-[#EEF3FA] text-[#1B4B8F] border border-[#1B4B8F]/30',
          icon: Layers,
          defaultLabel: 'Multiple CPIOs (Parallel)',
        };
      case 'SUBMITTED':
        return {
          bg: 'bg-[#EEF3FA] text-[#1B4B8F] border border-[#1B4B8F]/30',
          icon: Send,
          defaultLabel: 'Application Submitted',
        };
      case 'RECEIVED':
        return {
          bg: 'bg-[#EEF3FA] text-[#1B4B8F] border border-[#1B4B8F]/30',
          icon: CircleDot,
          defaultLabel: 'Application Received',
        };
      case 'PAYMENT_SUCCESS':
        return {
          bg: 'bg-[#EAF6EE] text-[#1E7A46] border border-[#1E7A46]/30',
          icon: CheckCircle2,
          defaultLabel: 'Payment Successful',
        };
      case 'PAYMENT_PENDING':
        return {
          bg: 'bg-[#FEF8E7] text-[#B7791F] border border-[#B7791F]/30',
          icon: Clock,
          defaultLabel: 'Payment Pending',
        };
      case 'PAYMENT_PROCESSING':
        return {
          bg: 'bg-[#EEF3FA] text-[#1B4B8F] border border-[#1B4B8F]/30',
          icon: RefreshCw,
          defaultLabel: 'Payment Processing',
        };
      case 'UNDER_PROCESSING':
      default:
        return {
          bg: 'bg-[#EEF3FA] text-[#1B4B8F] border border-[#1B4B8F]/30',
          icon: Clock,
          defaultLabel: 'Under Processing',
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const label = t(`status.${status}`) || config.defaultLabel;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full select-none whitespace-normal break-words text-left leading-tight ${padding} ${config.bg} ${className}`}
    >
      <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

