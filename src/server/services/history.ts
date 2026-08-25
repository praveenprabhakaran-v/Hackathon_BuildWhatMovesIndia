/**
 * Citizen Application & Appeal History Service Layer
 */

import { store } from '../store';
import { RTIApplication, FirstAppealApplication } from '../../types/rti';

export interface HistorySummary {
  requests: {
    all: number;
    pending: number;
    disposed: number;
    completed: number;
    transferred: number;
    items: RTIApplication[];
  };
  appeals: {
    all: number;
    pending: number;
    disposed: number;
    items: FirstAppealApplication[];
  };
  retentionNotice: string;
}

export async function getCitizenHistory(emailOrIdentifier?: string): Promise<HistorySummary> {
  const allApps = Array.from(store.applications.values());
  const allAppeals = Array.from(store.appeals.values());

  const targetEmail = (emailOrIdentifier || 'demo.citizen@example.com').trim().toLowerCase();

  // Filter in-memory applications matching user email (or mobile)
  const apps = allApps.filter((a) => {
    if (!a.applicant) return false;
    const emailMatch = a.applicant.email && a.applicant.email.trim().toLowerCase() === targetEmail;
    const mobileMatch = a.applicant.mobile && a.applicant.mobile.trim() === targetEmail;
    return Boolean(emailMatch || mobileMatch);
  });

  // Filter in-memory appeals matching user email or original application
  const appeals = allAppeals.filter((ap) => {
    const emailMatch =
      (ap.applicantEmail && ap.applicantEmail.trim().toLowerCase() === targetEmail) ||
      (ap.applicant?.email && ap.applicant.email.trim().toLowerCase() === targetEmail);
    const regMatch = apps.some((a) => a.registrationNumber === ap.originalRegistrationNumber);
    return Boolean(emailMatch || regMatch);
  });

  const pendingCount = apps.filter((a) =>
    [
      'SUBMITTED',
      'RECEIVED',
      'UNDER_PROCESSING',
      'ADDITIONAL_FEE_REQUIRED',
      'SUPPORTING_DOCUMENT_REQUIRED',
      'DOCUMENT_SUBMITTED',
      'MULTIPLE_CPIO',
    ].includes(a.status)
  ).length;

  const disposedCount = apps.filter((a) => ['RESPONSE_AVAILABLE', 'CLOSED', 'RETURNED'].includes(a.status)).length;
  const transferredCount = apps.filter((a) => a.status === 'TRANSFERRED').length;

  const appealsPending = appeals.filter((a) => ['SUBMITTED', 'UNDER_HEARING'].includes(a.status)).length;
  const appealsDisposed = appeals.filter((a) => ['DECISION_ISSUED', 'DISPOSED'].includes(a.status)).length;

  return {
    requests: {
      all: apps.length,
      pending: pendingCount,
      disposed: disposedCount,
      completed: disposedCount,
      transferred: transferredCount,
      items: apps,
    },
    appeals: {
      all: appeals.length,
      pending: appealsPending,
      disposed: appealsDisposed,
      items: appeals,
    },
    retentionNotice:
      'RTI applications and appellate records are retained on the citizen portal for 3 years from the date of filing.',
  };
}
