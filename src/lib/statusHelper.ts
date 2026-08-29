import { ApplicationStatus } from '../types/rti';

export interface StatusConfig {
  label: string;
  shortLabel: string;
  pillClass: string;
  badgeClass: string;
  category: 'green' | 'amber' | 'red' | 'blue' | 'gray';
}

export const STATUS_MAPPING: Record<string, StatusConfig> = {
  RESPONSE_AVAILABLE: {
    label: 'Response Available',
    shortLabel: 'Response Available',
    pillClass: 'bg-green-100 text-green-800 border border-green-200',
    badgeClass: 'bg-green-100 text-green-800 border border-green-200',
    category: 'green',
  },
  PAYMENT_SUCCESS: {
    label: 'Payment Successful',
    shortLabel: 'Payment Success',
    pillClass: 'bg-green-100 text-green-800 border border-green-200',
    badgeClass: 'bg-green-100 text-green-800 border border-green-200',
    category: 'green',
  },
  ADDITIONAL_FEE_REQUIRED: {
    label: 'Action Required: Additional Fee',
    shortLabel: 'Action Required: Fee',
    pillClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    category: 'amber',
  },
  SUPPORTING_DOCUMENT_REQUIRED: {
    label: 'Action Required: Document',
    shortLabel: 'Action Required: Document',
    pillClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    category: 'amber',
  },
  DOC_REQUIRED: {
    label: 'Action Required: Document',
    shortLabel: 'Action Required: Document',
    pillClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    category: 'amber',
  },
  PAYMENT_PENDING: {
    label: 'Action Required: Payment Pending',
    shortLabel: 'Payment Pending',
    pillClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    category: 'amber',
  },
  RETURNED: {
    label: 'Rejected / Returned',
    shortLabel: 'Rejected / Returned',
    pillClass: 'bg-red-100 text-red-800 border border-red-200',
    badgeClass: 'bg-red-100 text-red-800 border border-red-200',
    category: 'red',
  },
  REJECTED: {
    label: 'Rejected / Returned',
    shortLabel: 'Rejected / Returned',
    pillClass: 'bg-red-100 text-red-800 border border-red-200',
    badgeClass: 'bg-red-100 text-red-800 border border-red-200',
    category: 'red',
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    shortLabel: 'Payment Failed',
    pillClass: 'bg-red-100 text-red-800 border border-red-200',
    badgeClass: 'bg-red-100 text-red-800 border border-red-200',
    category: 'red',
  },
  UNDER_PROCESSING: {
    label: 'Under Processing',
    shortLabel: 'Under Processing',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  TRANSFERRED: {
    label: 'Transferred',
    shortLabel: 'Transferred',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  MULTIPLE_CPIO: {
    label: 'Multiple CPIO',
    shortLabel: 'Multiple CPIO',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  MULTIPLE_CPIOS: {
    label: 'Multiple CPIO',
    shortLabel: 'Multiple CPIO',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  SUBMITTED: {
    label: 'Under Processing',
    shortLabel: 'Submitted',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  RECEIVED: {
    label: 'Under Processing',
    shortLabel: 'Received',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  DOCUMENT_SUBMITTED: {
    label: 'Under Processing',
    shortLabel: 'Document Submitted',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  PAYMENT_PROCESSING: {
    label: 'Under Processing',
    shortLabel: 'Payment Processing',
    pillClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    category: 'blue',
  },
  CLOSED: {
    label: 'Closed / Disposed',
    shortLabel: 'Closed',
    pillClass: 'bg-gray-100 text-gray-800 border border-gray-200',
    badgeClass: 'bg-gray-100 text-gray-800 border border-gray-200',
    category: 'gray',
  },
  DRAFT: {
    label: 'Draft',
    shortLabel: 'Draft',
    pillClass: 'bg-gray-100 text-gray-800 border border-gray-200',
    badgeClass: 'bg-gray-100 text-gray-800 border border-gray-200',
    category: 'gray',
  },
};

/**
 * Converts a raw ApplicationStatus enum or status string into human-readable label and Tailwind styles.
 */
export function getStatusConfig(status: ApplicationStatus | string | undefined | null): StatusConfig {
  if (!status) {
    return STATUS_MAPPING.DRAFT;
  }
  const key = String(status).trim().toUpperCase();
  return (
    STATUS_MAPPING[key] || {
      label: key.replace(/_/g, ' '),
      shortLabel: key.replace(/_/g, ' '),
      pillClass: 'bg-gray-100 text-gray-800 border border-gray-200',
      badgeClass: 'bg-gray-100 text-gray-800 border border-gray-200',
      category: 'gray',
    }
  );
}

/**
 * Returns human-readable status label for any status key.
 */
export function getStatusLabel(status: ApplicationStatus | string | undefined | null): string {
  return getStatusConfig(status).label;
}

/**
 * Returns specific Tailwind color pill class for any status.
 */
export function getStatusPillClass(status: ApplicationStatus | string | undefined | null): string {
  return getStatusConfig(status).pillClass;
}
