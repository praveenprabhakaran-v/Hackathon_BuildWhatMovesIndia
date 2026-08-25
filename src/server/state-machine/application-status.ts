/**
 * Application & Appeal State Machine
 * Defines valid lifecycle state transitions as specified in Backend Spec §8.
 * No route handler is permitted to set status directly.
 */

import { ApplicationStatus } from '../../types/rti';

export class StateTransitionError extends Error {
  statusCode: number;
  current: ApplicationStatus;
  event: string;

  constructor(current: ApplicationStatus, event: string) {
    super(`Illegal state transition: Event '${event}' is not permitted from current status '${current}'.`);
    this.name = 'StateTransitionError';
    this.statusCode = 409;
    this.current = current;
    this.event = event;
  }
}

export type Transition = {
  from: ApplicationStatus[];
  to: ApplicationStatus;
  event: string;
  description?: string;
};

export const TRANSITIONS: Transition[] = [
  { from: ['DRAFT'], to: 'PAYMENT_PENDING', event: 'SUBMIT_DRAFT', description: 'Citizen finalized draft, awaiting payment fee' },
  { from: ['PAYMENT_PENDING'], to: 'PAYMENT_PROCESSING', event: 'START_PAYMENT', description: 'Initiated gateway checkout' },
  { from: ['PAYMENT_PROCESSING'], to: 'PAYMENT_SUCCESS', event: 'PAYMENT_OK', description: 'Payment captured and verified' },
  { from: ['PAYMENT_PROCESSING'], to: 'PAYMENT_FAILED', event: 'PAYMENT_FAIL', description: 'Payment declined or timed out' },
  { from: ['PAYMENT_SUCCESS', 'DRAFT'], to: 'SUBMITTED', event: 'REGISTER', description: 'Statutory registration minted and lodged' },
  { from: ['SUBMITTED'], to: 'RECEIVED', event: 'RECEIVE', description: 'Public Authority CPIO received application' },
  { from: ['RECEIVED'], to: 'UNDER_PROCESSING', event: 'START_PROCESSING', description: 'Under active review by Nodal Officer' },
  { from: ['UNDER_PROCESSING'], to: 'TRANSFERRED', event: 'TRANSFER', description: 'Transferred under Section 6(3) to competent Ministry' },
  { from: ['UNDER_PROCESSING'], to: 'MULTIPLE_CPIO', event: 'SPLIT', description: 'Split across multiple CPIO custodians' },
  { from: ['UNDER_PROCESSING'], to: 'ADDITIONAL_FEE_REQUIRED', event: 'REQUEST_FEE', description: 'Additional reproduction fee demanded under Sec 7(3)' },
  { from: ['ADDITIONAL_FEE_REQUIRED'], to: 'UNDER_PROCESSING', event: 'FEE_PAID', description: 'Additional fee paid, resume processing' },
  { from: ['UNDER_PROCESSING'], to: 'SUPPORTING_DOCUMENT_REQUIRED', event: 'REQUEST_DOCUMENT', description: 'Supporting clarification requested' },
  { from: ['SUPPORTING_DOCUMENT_REQUIRED'], to: 'DOCUMENT_SUBMITTED', event: 'DOCUMENT_UPLOADED', description: 'Citizen provided requested PDF document' },
  { from: ['DOCUMENT_SUBMITTED'], to: 'UNDER_PROCESSING', event: 'RESUME_PROCESSING', description: 'Processing resumed after document verification' },
  { from: ['UNDER_PROCESSING'], to: 'RETURNED', event: 'RETURN', description: 'Rejected or returned under Section 8/9 exemptions' },
  { from: ['UNDER_PROCESSING'], to: 'RESPONSE_AVAILABLE', event: 'RESPOND', description: 'CPIO response and signed annexures uploaded' },
  { from: ['RESPONSE_AVAILABLE'], to: 'CLOSED', event: 'CLOSE', description: 'Application concluded' },
];

export function transition(current: ApplicationStatus, event: string): ApplicationStatus {
  const match = TRANSITIONS.find((t) => t.event === event && t.from.includes(current));
  if (!match) {
    throw new StateTransitionError(current, event);
  }
  return match.to;
}

export function canTransition(current: ApplicationStatus, event: string): boolean {
  return TRANSITIONS.some((t) => t.event === event && t.from.includes(current));
}
