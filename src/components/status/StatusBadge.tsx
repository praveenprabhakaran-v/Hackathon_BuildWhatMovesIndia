import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  Clock,
  Archive,
  Layers,
  Send,
  CircleDot,
  RefreshCw,
} from 'lucide-react';
import { ApplicationStatus } from '../../types/rti';
import { useLanguage } from '../../lib/context/LanguageContext';
import { getStatusConfig } from '../../lib/statusHelper';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const { t } = useLanguage();
  const statusCfg = getStatusConfig(status);

  const getStatusIcon = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'RESPONSE_AVAILABLE':
      case 'PAYMENT_SUCCESS':
        return CheckCircle2;
      case 'ADDITIONAL_FEE_REQUIRED':
      case 'SUPPORTING_DOCUMENT_REQUIRED':
      case 'DOC_REQUIRED':
      case 'PAYMENT_PENDING':
        return AlertTriangle;
      case 'RETURNED':
      case 'REJECTED':
      case 'PAYMENT_FAILED':
        return XCircle;
      case 'TRANSFERRED':
        return ArrowRightCircle;
      case 'MULTIPLE_CPIO':
      case 'MULTIPLE_CPIOS':
        return Layers;
      case 'SUBMITTED':
        return Send;
      case 'RECEIVED':
        return CircleDot;
      case 'PAYMENT_PROCESSING':
        return RefreshCw;
      case 'CLOSED':
        return Archive;
      case 'UNDER_PROCESSING':
      default:
        return Clock;
    }
  };

  const Icon = getStatusIcon(status);
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  
  // Prefer translated label if available and not identical to raw key, else fallback to standard label
  const translated = t(`status.${status}`);
  const label = translated && !translated.startsWith('status.') ? translated : statusCfg.label;

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full select-none whitespace-normal break-words text-left leading-tight ${padding} ${statusCfg.pillClass} ${className}`}
    >
      <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};


