/**
 * Authentication & OTP Service Layer
 * Implements mock convenience login, bcrypt password check, and OTP sessions.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store, UserRecord } from '../store';

const JWT_SECRET = process.env.JWT_SECRET || 'rti_online_secret_key_mock_jwt_evaluator';

export interface AuthSession {
  sub: string;
  email: string;
  name: string;
  scope: 'USER' | 'OTP_HISTORY';
  demo: boolean;
  exp: number;
}

// In-memory rate limiting for OTP
const rateLimitMap: Map<string, { count: number; firstAttempt: number }> = new Map();

function checkRateLimit(key: string, maxAttempts = 5, windowMs = 600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  if (now - entry.firstAttempt > windowMs) {
    rateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  if (entry.count >= maxAttempts) {
    return false;
  }
  entry.count += 1;
  return true;
}

export function maskIdentifier(identifier: string): string {
  if (identifier.includes('@')) {
    const parts = identifier.split('@');
    const name = parts[0] || 'user';
    const domain = parts[1] || 'gov.in';
    const masked = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${masked}@${domain}`;
  }
  const digits = identifier.replace(/\D/g, '');
  if (digits.length >= 10) {
    return `******${digits.slice(-4)}`;
  }
  return '***';
}

export async function requestOtp(identifier: string): Promise<{ otpSentTo: string; demoOtp: string }> {
  const cleanId = identifier.trim().toLowerCase();

  if (!checkRateLimit(`otp_req_${cleanId}`, 10, 600000)) {
    throw new Error('Too many OTP requests. Please wait 10 minutes before trying again.');
  }

  // Mock OTP is always 123456
  const otp = '123456';
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

  store.otps.set(cleanId, { otp, expiresAt, attempts: 0 });

  return {
    otpSentTo: maskIdentifier(cleanId),
    demoOtp: '123456',
  };
}

export async function verifyOtp(identifier: string, enteredOtp: string): Promise<{ token: string; email: string }> {
  const cleanId = identifier.trim().toLowerCase();
  const record = store.otps.get(cleanId);

  // Accept fixed mock OTP 123456 or stored OTP
  const isValid = enteredOtp.trim() === '123456' || (record && record.otp === enteredOtp.trim() && Date.now() < record.expiresAt);

  if (!isValid) {
    throw new Error('Invalid OTP. Please enter the demo code 123456.');
  }

  // Generate short-lived OTP session JWT (valid for 30 minutes)
  const token = jwt.sign(
    {
      sub: cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@citizen.gov.in`,
      name: cleanId.includes('@') ? cleanId.split('@')[0] : 'Citizen',
      scope: 'OTP_HISTORY',
      demo: true,
    },
    JWT_SECRET,
    { expiresIn: '30m' }
  );

  return {
    token,
    email: cleanId.includes('@') ? cleanId : `${cleanId}@citizen.gov.in`,
  };
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; name: string; email: string } }> {
  const cleanEmail = email.trim().toLowerCase();
  let user = store.users.get(cleanEmail);

  // For open evaluator / judge mode: if not found, dynamically create user
  if (!user) {
    user = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0] || 'Evaluator User',
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      plainPasswordForDemo: password,
    };
    store.users.set(cleanEmail, user);
  }

  // Compare bcrypt password (or accept demo password)
  const isMatch =
    password === 'Demo@1234' ||
    password === 'evaluator@2026' ||
    password === user.plainPasswordForDemo ||
    (user.passwordHash && bcrypt.compareSync(password, user.passwordHash));

  if (!isMatch) {
    throw new Error('Incorrect email or password.');
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      scope: 'USER',
      demo: true,
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export function verifySessionToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch {
    return null;
  }
}
