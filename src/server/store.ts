/**
 * In-Memory Data Store for Backend Services
 * Manages mutable state, atomic serial numbering per authority per year,
 * seed data initialization, and session registries.
 */

import { Authority, RTIApplication, FirstAppealApplication, RTIDraft } from '../types/rti';
import seedAuthorities from './data/seed-authorities.json';
import seedUsers from './data/seed-users.json';
import seedApplications from './data/seed-applications.json';
import seedFaq from './data/seed-faq.json';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plainPasswordForDemo?: string;
}

export interface PaymentTransaction {
  txnId: string;
  draftId?: string;
  registrationNumber?: string;
  amount: number;
  method: string;
  status: 'PAYMENT_PENDING' | 'PAYMENT_PROCESSING' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
  createdAt: string;
  completedAt?: string;
}

export interface StoredAppeal extends FirstAppealApplication {
  applicantEmail: string;
}

class BackendDataStore {
  public authorities: Map<string, Authority> = new Map();
  public applications: Map<string, RTIApplication> = new Map();
  public drafts: Map<string, RTIDraft> = new Map();
  public appeals: Map<string, StoredAppeal> = new Map();
  public users: Map<string, UserRecord> = new Map();
  public payments: Map<string, PaymentTransaction> = new Map();
  public faqs: any[] = [];
  
  // Rate-limiting and OTP storage
  public otps: Map<string, { otp: string; expiresAt: number; attempts: number }> = new Map();
  
  // Serial number counters: authorityCode_year -> nextSerial
  private serialCounters: Map<string, number> = new Map();

  constructor() {
    this.init();
  }

  public init() {
    // 1. Seed Authorities
    for (const auth of seedAuthorities as Authority[]) {
      this.authorities.set(auth.id, auth);
      this.authorities.set(auth.code.toLowerCase(), auth);
    }

    // 2. Seed Users
    for (const user of seedUsers as UserRecord[]) {
      this.users.set(user.email.toLowerCase(), user);
    }

    // 3. Seed FAQs
    this.faqs = [...seedFaq];

    // 4. Seed Applications
    for (const app of seedApplications as unknown as RTIApplication[]) {
      this.applications.set(app.registrationNumber, app);
    }

    // 5. Pre-seed First Appeal for Scenario G
    const gApp = this.applications.get('MORTH/R/E/26/00341');
    if (gApp) {
      const appealNo = 'MORTH/A/E/26/00142';
      const appeal: StoredAppeal = {
        appealRegistrationNumber: appealNo,
        originalRegistrationNumber: 'MORTH/R/E/26/00341',
        applicantEmail: gApp.applicant.email,
        ground: 'INCOMPLETE_INFORMATION',
        groundLabel: 'Incomplete / Misleading Information provided by CPIO',
        appealText: 'The CPIO has failed to furnish the structural load test reports and withheld safety certifications without citing any valid statutory exemption.',
        applicant: gApp.applicant,
        authority: gApp.authority,
        faaOfficer: {
          name: gApp.authority.faaName,
          designation: gApp.authority.faaDesignation,
          email: 'faa.morth@nic.in',
        },
        status: 'UNDER_HEARING',
        fee: 0,
        filedOn: '2026-08-05T11:00:00.000Z',
        timeline: [
          {
            state: 'SUBMITTED',
            title: 'First Appeal Lodged',
            description: 'Lodged under Section 19(1) of RTI Act 2005 at zero fee.',
            at: '2026-08-05T11:00:00.000Z',
          },
          {
            state: 'UNDER_PROCESSING',
            title: 'Under Hearing by FAA',
            description: 'First Appellate Authority Dr. Alok Deepankar reviewing original query and CPIO reply.',
            at: '2026-08-08T14:30:00.000Z',
          },
        ],
      };
      this.appeals.set(appealNo, appeal);
    }
  }

  /**
   * Generates a unique Registration Number in standard RTI format:
   * {AuthorityCode}/{R|A}/E/{YY}/{Serial}
   * e.g., DORF/R/E/26/00482
   */
  public generateRegistrationNumber(authorityCode: string, isAppeal = false): string {
    const code = (authorityCode || 'GOV').toUpperCase();
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const key = `${code}_${yy}_${isAppeal ? 'A' : 'R'}`;
    
    let current = this.serialCounters.get(key) || 100 + Math.floor(Math.random() * 50);
    current += 1;
    this.serialCounters.set(key, current);

    const type = isAppeal ? 'A' : 'R';
    const serial = current.toString().padStart(5, '0');
    return `${code}/${type}/E/${yy}/${serial}`;
  }

  public getAuthority(idOrCode: string): Authority | undefined {
    return this.authorities.get(idOrCode) || this.authorities.get(idOrCode.toLowerCase());
  }

  public getApplication(regNo: string): RTIApplication | undefined {
    return this.applications.get(regNo);
  }

  public getAppeal(appealNo: string): StoredAppeal | undefined {
    return this.appeals.get(appealNo);
  }
}

export const store = new BackendDataStore();
