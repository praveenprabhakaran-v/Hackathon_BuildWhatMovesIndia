/**
 * RTI Applications Service Layer
 * Enforces business logic, registration number format, and state machine transitions.
 */

import { store } from '../store';
import { transition } from '../state-machine/application-status';
import { RTIApplication, RTIDraft, ApplicationStatus, SupportingDocument, ApplicantDetails } from '../../types/rti';

export interface CreateApplicationInput {
  authorityId: string;
  applicant: {
    fullName: string;
    gender: any;
    email: string;
    mobile: string;
    country?: string;
    state: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    pincode: string;
    category?: any;
    educationalStatus?: any;
  };
  bpl?: {
    isBpl: boolean;
    cardNumber?: string;
    yearOfIssue?: string;
    issuingAuthority?: string;
    docId?: string;
    docName?: string;
    docSizeKb?: number;
  };
  request: {
    text: string;
    supportingDocId?: string | null;
  };
  guidelinesAcknowledged: boolean;
  captchaToken?: string;
}

export async function createApplicationDraft(input: CreateApplicationInput): Promise<{
  draftId: string;
  applicationFee: number;
  isBplExempt: boolean;
  nextStep: 'PAYMENT' | 'SUBMITTED';
  registrationNumber?: string;
}> {
  const auth = store.getAuthority(input.authorityId);
  if (!auth) {
    throw new Error('Selected Public Authority is invalid or inactive.');
  }

  const isBpl = Boolean(input.bpl?.isBpl);
  const fee = isBpl ? 0 : 10;
  const draftId = `d_${Math.random().toString(36).substring(2, 9)}`;

  const applicantDetails: ApplicantDetails = {
    ...input.applicant,
    country: input.applicant.country || 'India',
    gender: (input.applicant.gender as any) || 'PREFER_NOT_TO_SAY',
  };

  const draft: RTIDraft = {
    draftId,
    guidelinesAcknowledged: input.guidelinesAcknowledged,
    authority: auth,
    applicant: applicantDetails,
    bpl: input.bpl || { isBpl: false },
    request: {
      text: input.request.text,
      supportingDocId: input.request.supportingDocId || undefined,
      wordCount: input.request.text.trim().split(/\s+/).length,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.drafts.set(draftId, draft);

  // If BPL is exempt from fee (₹0), we can transition directly from DRAFT -> REGISTER -> SUBMITTED
  if (isBpl) {
    const regNo = store.generateRegistrationNumber(auth.code, false);
    const now = new Date().toISOString();

    const application: RTIApplication = {
      registrationNumber: regNo,
      draftId,
      status: 'SUBMITTED',
      authority: auth,
      applicant: applicantDetails,
      bpl: input.bpl || { isBpl: true },
      requestText: input.request.text,
      supportingDocuments: input.bpl?.docName ? [
        {
          fileId: input.bpl.docId || 'bpl_proof_1',
          fileName: input.bpl.docName,
          sizeKb: input.bpl.docSizeKb || 450,
          uploadedAt: now,
        }
      ] : [],
      applicationFee: 0,
      isBplExempt: true,
      filedOn: now,
      lastUpdated: now,
      timeline: [
        {
          state: 'SUBMITTED',
          title: 'Application Lodged (BPL Exemption)',
          description: 'RTI application lodged under Section 6(1) with statutory BPL fee waiver.',
          at: now,
        },
      ],
      canAppeal: true,
    };

    store.applications.set(regNo, application);

    return {
      draftId,
      applicationFee: 0,
      isBplExempt: true,
      nextStep: 'SUBMITTED',
      registrationNumber: regNo,
    };
  }

  return {
    draftId,
    applicationFee: fee,
    isBplExempt: false,
    nextStep: 'PAYMENT',
  };
}

export async function getApplicationByRegNo(regNo: string): Promise<RTIApplication | null> {
  const cleanReg = regNo.trim().toUpperCase();
  const app = store.getApplication(cleanReg);
  return app || null;
}

export async function payAdditionalFee(
  regNo: string,
  simulate: 'SUCCESS' | 'FAILURE' | 'TIMEOUT' = 'SUCCESS'
): Promise<{ status: ApplicationStatus; amountPaid?: number }> {
  const cleanReg = regNo.trim().toUpperCase();
  const app = store.getApplication(cleanReg);
  if (!app) {
    throw new Error('No application found for that registration number.');
  }

  if (app.status !== 'ADDITIONAL_FEE_REQUIRED') {
    throw new Error(`Application is not currently awaiting additional fee payment (current status: ${app.status}).`);
  }

  if (simulate === 'TIMEOUT') {
    throw new Error('Payment gateway session timed out. Please try again.');
  }

  if (simulate === 'FAILURE') {
    return { status: 'PAYMENT_FAILED' };
  }

  // Trigger state machine transition: ADDITIONAL_FEE_REQUIRED -> FEE_PAID -> UNDER_PROCESSING
  const nextStatus = transition(app.status, 'FEE_PAID');
  const now = new Date().toISOString();
  const amount = app.actionRequired?.amount || 120;

  app.status = nextStatus;
  app.lastUpdated = now;
  app.actionRequired = null;
  app.timeline.push({
    state: 'UNDER_PROCESSING',
    title: 'Additional Fee Paid & Confirmed',
    description: `Additional reproduction fee of ₹${amount} received via Bharatkosh. CPIO has resumed information dispatch.`,
    at: now,
  });

  store.applications.set(cleanReg, app);

  return {
    status: app.status,
    amountPaid: amount,
  };
}

export async function uploadSupportingDocument(
  regNo: string,
  file: { originalname: string; size: number; buffer?: Buffer }
): Promise<{ fileId: string; fileName: string; sizeKb: number; applicationStatus: ApplicationStatus }> {
  const cleanReg = regNo.trim().toUpperCase();
  const app = store.getApplication(cleanReg);
  if (!app) {
    throw new Error('No application found for that registration number.');
  }

  const fileId = `f_${Math.floor(1000 + Math.random() * 9000)}`;
  const sizeKb = Math.round(file.size / 1024);
  const now = new Date().toISOString();

  const doc: SupportingDocument = {
    fileId,
    fileName: file.originalname,
    sizeKb,
    uploadedAt: now,
  };

  app.supportingDocuments = app.supportingDocuments || [];
  app.supportingDocuments.push(doc);

  if (app.status === 'SUPPORTING_DOCUMENT_REQUIRED') {
    // Transition DOCUMENT_UPLOADED -> DOCUMENT_SUBMITTED -> RESUME_PROCESSING -> UNDER_PROCESSING
    const s1 = transition(app.status, 'DOCUMENT_UPLOADED');
    const s2 = transition(s1, 'RESUME_PROCESSING');
    app.status = s2;
    app.actionRequired = null;
    app.lastUpdated = now;
    app.timeline.push({
      state: 'UNDER_PROCESSING',
      title: 'Supporting Document Verified',
      description: `Citizen uploaded ${file.originalname} (${sizeKb} KB). Record compilation resumed by CPIO.`,
      at: now,
    });
  }

  store.applications.set(cleanReg, app);

  return {
    fileId,
    fileName: file.originalname,
    sizeKb,
    applicationStatus: app.status,
  };
}
