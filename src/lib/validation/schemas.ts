import { z } from 'zod';

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;
export const REG_NO_REGEX = /^[A-Z0-9]{3,8}\/[R|A]\/[E|T|P]\/\d{2,4}\/\d{3,7}(\/\d+)?$/i;

// Applicant Details Schema
export const ApplicantSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Please enter your full legal name (at least 3 characters).')
    .max(100, 'Full name cannot exceed 100 characters.'),
  gender: z
    .string()
    .refine((val) => ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'].includes(val), {
      message: 'Please select a gender.',
    }),
  email: z
    .string()
    .regex(EMAIL_REGEX, 'Please enter a valid email address (e.g., name@example.com).'),
  mobile: z
    .string()
    .regex(MOBILE_REGEX, 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.'),
  country: z.string().default('India'),
  state: z.string().min(1, 'Please select your state or union territory.'),
  city: z.string().min(2, 'Please enter your city or district.'),
  addressLine1: z.string().min(5, 'Please enter your street address / house number (at least 5 characters).'),
  addressLine2: z.string().optional(),
  pincode: z.string().regex(PINCODE_REGEX, 'Please enter a valid 6-digit postal PIN code.'),
  category: z.string().optional(),
  educationalStatus: z.string().optional(),
});

// BPL Details Schema
export const BplSchema = z.object({
  isBpl: z.boolean().default(false),
  cardNumber: z.string().optional(),
  yearOfIssue: z.string().optional(),
  issuingAuthority: z.string().optional(),
  docId: z.string().optional(),
  docName: z.string().optional(),
  docSizeKb: z.number().optional(),
}).refine((data) => {
  if (data.isBpl) {
    return Boolean(data.cardNumber && data.cardNumber.trim().length >= 3);
  }
  return true;
}, {
  message: 'Please provide your valid BPL / Antyodaya / Ration card number.',
  path: ['cardNumber'],
}).refine((data) => {
  if (data.isBpl) {
    return Boolean(data.yearOfIssue && /^\d{4}$/.test(data.yearOfIssue.trim()));
  }
  return true;
}, {
  message: 'Please enter a valid 4-digit year of issue (e.g., 2022).',
  path: ['yearOfIssue'],
}).refine((data) => {
  if (data.isBpl) {
    return Boolean(data.issuingAuthority && data.issuingAuthority.trim().length >= 3);
  }
  return true;
}, {
  message: 'Please specify the issuing authority (e.g. Tehsildar / Food & Civil Supplies Dept).',
  path: ['issuingAuthority'],
});

// RTI Request Text Schema
export const RtiRequestTextSchema = z.object({
  text: z
    .string()
    .min(10, 'Please enter specific information sought under Section 6(1) of RTI Act (minimum 10 characters).')
    .max(3000, 'RTI question text exceeds the maximum permitted limit of 3,000 characters. Please attach longer queries as a supporting PDF.'),
  supportingDocId: z.string().nullable().optional(),
});

// Application Creation Payload
export const CreateApplicationSchema = z.object({
  authorityId: z.string().min(1, 'Please select a Public Authority before continuing.'),
  applicant: ApplicantSchema,
  bpl: BplSchema.optional().default({ isBpl: false }),
  request: RtiRequestTextSchema,
  guidelinesAcknowledged: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the RTI guidelines before submitting.',
  }),
  captchaToken: z.string().optional(),
});

// Mock Payment Simulation Schema
export const MockPaymentSchema = z.object({
  draftId: z.string().optional(),
  registrationNumber: z.string().optional(),
  method: z.string().default('UPI'),
  simulate: z.enum(['SUCCESS', 'FAILURE', 'TIMEOUT']).default('SUCCESS'),
});

// First Appeal Creation Schema
export const CreateAppealSchema = z.object({
  originalRegistrationNumber: z
    .string()
    .min(5, 'Please provide a valid original RTI registration number.'),
  email: z
    .string()
    .regex(EMAIL_REGEX, 'Please enter the email address used during original RTI filing.'),
  ground: z.enum([
    'NO_RESPONSE_RECEIVED',
    'INCOMPLETE_INFORMATION',
    'INFORMATION_REFUSED',
    'MISLEADING_INFORMATION',
    'EXORBITANT_FEES_DEMANDED',
    'OTHER',
  ]),
  appealText: z
    .string()
    .min(15, 'Please provide a clear statement of facts and grievance for the First Appellate Authority (min 15 characters).')
    .max(4000, 'Appeal grievance statement exceeds maximum allowed 4,000 characters.'),
  supportingDocId: z.string().nullable().optional(),
  guidelinesAcknowledged: z.boolean().optional().default(true),
});

// OTP Request & Verify Schemas
export const RequestOtpSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Please enter a valid email address.').optional(),
  mobile: z.string().regex(MOBILE_REGEX, 'Please enter a valid 10-digit mobile number.').optional(),
  identifier: z.string().min(3, 'Please enter your registered email or mobile number.').optional(),
}).refine((data) => Boolean(data.email || data.mobile || data.identifier), {
  message: 'Please provide either an email or mobile number.',
});

export const VerifyOtpSchema = z.object({
  email: z.string().optional(),
  mobile: z.string().optional(),
  identifier: z.string().optional(),
  otp: z.string().min(4, 'Please enter the complete 6-digit OTP.'),
});

// Login Schema (Mock Convenience Login)
export const LoginSchema = z.object({
  email: z.string().min(1, 'Please enter your email address or username.'),
  password: z.string().min(1, 'Please enter your password.'),
});

// Payment Reconciliation Schema
export const ReconcilePaymentSchema = z.object({
  registrationOrTransactionRef: z
    .string()
    .min(3, 'Reference must be at least 3 characters long.'),
});
