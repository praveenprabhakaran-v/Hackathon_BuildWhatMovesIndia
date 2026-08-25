/**
 * RTI Online - Type Definitions
 */

export type ApplicationStatus =
  | "DRAFT"
  | "PAYMENT_PENDING"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "SUBMITTED"
  | "RECEIVED"
  | "UNDER_PROCESSING"
  | "TRANSFERRED"
  | "MULTIPLE_CPIO"
  | "ADDITIONAL_FEE_REQUIRED"
  | "SUPPORTING_DOCUMENT_REQUIRED"
  | "DOCUMENT_SUBMITTED"
  | "RETURNED"
  | "RESPONSE_AVAILABLE"
  | "CLOSED";

export interface Authority {
  id: string;
  code: string;
  name: string;
  ministry: string;
  department?: string;
  type: "Central Government";
  active: boolean;
  cpioName: string;
  cpioDesignation: string;
  cpioEmail: string;
  cpioPhone: string;
  faaName: string;
  faaDesignation: string;
  address: string;
  avgTurnaroundDays: number;
}

export interface ApplicantDetails {
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | "";
  email: string;
  mobile: string;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  category?: "RURAL" | "URBAN";
  educationalStatus?: "LITERATE" | "ILLITERATE";
}

export interface BplDetails {
  isBpl: boolean;
  cardNumber?: string;
  yearOfIssue?: string;
  issuingAuthority?: string;
  docId?: string;
  docName?: string;
  docSizeKb?: number;
}

export interface SupportingDocument {
  fileId: string;
  fileName: string;
  sizeKb: number;
  uploadedAt: string;
}

export interface RTIDraft {
  draftId?: string;
  guidelinesAcknowledged: boolean;
  authority?: Authority;
  applicant?: ApplicantDetails;
  bpl?: BplDetails;
  request?: {
    text: string;
    supportingDocId?: string;
    wordCount?: number;
  };
  documents?: SupportingDocument[];
  captchaToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineEvent {
  state: ApplicationStatus;
  title: string;
  description: string;
  at: string;
  actor?: string;
}

export interface ActionRequiredDetails {
  type: "ADDITIONAL_FEE" | "SUPPORTING_DOCUMENT_REQUIRED";
  amount?: number;
  reason: string;
  deadline?: string;
  feeBreakdown?: {
    pages?: number;
    ratePerPage?: number;
    sampleFee?: number;
    inspectionFee?: number;
  };
}

export interface ChildApplication {
  registrationNumber: string;
  authority: string;
  cpioName: string;
  subject: string;
  status: ApplicationStatus;
  transferredOn: string;
}

export interface TransferredDetails {
  registrationNumber: string;
  authority: string;
  transferredOn: string;
  reason: string;
  section: string;
}

export interface RTIApplication {
  registrationNumber: string;
  draftId?: string;
  status: ApplicationStatus;
  authority: Authority;
  applicant: ApplicantDetails;
  bpl: BplDetails;
  requestText: string;
  supportingDocuments: SupportingDocument[];
  applicationFee: number;
  isBplExempt: boolean;
  paymentRef?: string;
  paymentMethod?: string;
  filedOn: string;
  lastUpdated: string;
  timeline: TimelineEvent[];
  actionRequired?: ActionRequiredDetails | null;
  childApplications?: ChildApplication[];
  transferredTo?: TransferredDetails | null;
  responseDocument?: {
    fileId: string;
    fileName: string;
    releasedOn: string;
    cpioRemarks: string;
    dispatchRef: string;
  };
  returnReason?: string;
  returnSection?: string;
  canAppeal?: boolean;
}

export type AppealGround =
  | "NO_RESPONSE_RECEIVED"
  | "INCOMPLETE_INFORMATION"
  | "INFORMATION_REFUSED"
  | "MISLEADING_INFORMATION"
  | "EXORBITANT_FEES_DEMANDED"
  | "OTHER";

export interface FirstAppealDraft {
  originalRegistrationNumber: string;
  applicantEmail: string;
  originalAuthority?: Authority;
  originalFilingDate?: string;
  ground: AppealGround;
  appealText: string;
  supportingDocuments?: SupportingDocument[];
  guidelinesAcknowledged: boolean;
}

export interface FirstAppealApplication {
  appealRegistrationNumber: string;
  originalRegistrationNumber: string;
  ground: AppealGround;
  groundLabel: string;
  appealText: string;
  applicant: ApplicantDetails;
  authority: Authority;
  faaOfficer: {
    name: string;
    designation: string;
    email: string;
  };
  status: "SUBMITTED" | "UNDER_HEARING" | "DECISION_ISSUED" | "DISPOSED";
  fee: 0;
  filedOn: string;
  timeline: TimelineEvent[];
  decisionDocument?: {
    fileId: string;
    fileName: string;
    issuedOn: string;
    summary: string;
  };
}

export interface ApiError {
  error: string;
  fieldErrors?: Record<string, string>;
}
