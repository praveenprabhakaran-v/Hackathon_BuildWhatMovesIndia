/**
 * Validation Schemas and Utilities
 * Single source of truth shared by both frontend form handlers and backend API routes.
 */

import { z } from 'zod';
import {
  ApplicantSchema,
  BplSchema,
  RtiRequestTextSchema,
  CreateAppealSchema,
  EMAIL_REGEX,
  MOBILE_REGEX,
  PINCODE_REGEX,
  REG_NO_REGEX,
} from './validation/schemas';
import { t } from './i18n';

export * from './validation/schemas';

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      // Map standard validation codes/messages if translation key exists
      errors[path] = issue.message;
    }
  }
  return errors;
}

export function validateApplicantDetails(data: any): ValidationResult<any> {
  const parsed = ApplicantSchema.safeParse(data);
  if (parsed.success) {
    return { isValid: true, errors: {}, data: parsed.data };
  }
  return {
    isValid: false,
    errors: formatZodErrors(parsed.error),
  };
}

export function validateBplDetails(data: any): ValidationResult<any> {
  const parsed = BplSchema.safeParse(data);
  if (parsed.success) {
    return { isValid: true, errors: {}, data: parsed.data };
  }
  return {
    isValid: false,
    errors: formatZodErrors(parsed.error),
  };
}

export function validateRtiRequestText(text?: string): ValidationResult<{ text: string }> {
  const parsed = RtiRequestTextSchema.safeParse({ text });
  if (parsed.success) {
    return { isValid: true, errors: {}, data: parsed.data };
  }
  return {
    isValid: false,
    errors: formatZodErrors(parsed.error),
  };
}

export function validateAppealSubmission(data: any): ValidationResult<any> {
  const parsed = CreateAppealSchema.safeParse(data);
  if (parsed.success) {
    return { isValid: true, errors: {}, data: parsed.data };
  }
  return {
    isValid: false,
    errors: formatZodErrors(parsed.error),
  };
}
