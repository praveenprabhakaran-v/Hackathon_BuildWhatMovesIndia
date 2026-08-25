/**
 * First Appeals Service Layer
 * Statutory appeals under Section 19(1) of RTI Act 2005 (Always ₹0 fee).
 */

import { store, StoredAppeal } from '../store';
import { FirstAppealApplication, AppealGround } from '../../types/rti';

export interface CreateAppealInput {
  originalRegistrationNumber: string;
  email: string;
  ground: AppealGround;
  appealText: string;
  supportingDocId?: string | null;
  guidelinesAcknowledged?: boolean;
}

const GROUND_LABELS: Record<AppealGround, string> = {
  NO_RESPONSE_RECEIVED: 'No Response Received within 30 days (Deemed Refusal under Sec 7(2))',
  INCOMPLETE_INFORMATION: 'Incomplete / Misleading Information provided by CPIO',
  INFORMATION_REFUSED: 'Information Refused under illegal / misapplied Section 8 exemption',
  MISLEADING_INFORMATION: 'Information furnished is factually incorrect or ambiguous',
  EXORBITANT_FEES_DEMANDED: 'Unreasonable or disproportionate additional fee demanded by CPIO',
  OTHER: 'Other grievance against CPIO order / non-compliance',
};

export async function createFirstAppeal(input: CreateAppealInput): Promise<{
  appealRegistrationNumber: string;
  originalRegistrationNumber: string;
  fee: 0;
  status: 'SUBMITTED';
  appeal: FirstAppealApplication;
}> {
  const origReg = input.originalRegistrationNumber.trim().toUpperCase();
  const origApp = store.getApplication(origReg);

  const auth = origApp?.authority || store.getAuthority('auth_mohfw')!;
  const authorityCode = auth.code || 'RTI';
  const appealRegNo = store.generateRegistrationNumber(authorityCode, true);
  const now = new Date().toISOString();

  const applicant = origApp?.applicant || {
    fullName: input.email.split('@')[0] || 'Citizen Applicant',
    gender: 'PREFER_NOT_TO_SAY' as any,
    email: input.email,
    mobile: '9876543210',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    addressLine1: 'Address on Record',
    pincode: '110001',
  };

  const appeal: StoredAppeal = {
    appealRegistrationNumber: appealRegNo,
    originalRegistrationNumber: origReg,
    applicantEmail: input.email.toLowerCase(),
    ground: input.ground,
    groundLabel: GROUND_LABELS[input.ground] || input.ground,
    appealText: input.appealText,
    applicant,
    authority: auth,
    faaOfficer: {
      name: auth.faaName || 'First Appellate Authority',
      designation: auth.faaDesignation || 'Joint Secretary & FAA',
      email: 'faa-desk@gov.in',
    },
    status: 'SUBMITTED',
    fee: 0,
    filedOn: now,
    timeline: [
      {
        state: 'SUBMITTED',
        title: 'First Appeal Registered',
        description: `Statutory appeal registered under Section 19(1) on grounds: ${GROUND_LABELS[input.ground]}. Application fee: ₹0.`,
        at: now,
      },
    ],
  };

  store.appeals.set(appealRegNo, appeal);

  return {
    appealRegistrationNumber: appealRegNo,
    originalRegistrationNumber: origReg,
    fee: 0,
    status: 'SUBMITTED',
    appeal,
  };
}

export async function getAppealByNumber(appealNo: string): Promise<FirstAppealApplication | null> {
  const cleanNo = appealNo.trim().toUpperCase();
  const appeal = store.getAppeal(cleanNo);
  return appeal || null;
}
