import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { UserSession, UserRole } from '../types';
import { getEmployees } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'hrms_super_secure_vault_key_2026_x89a';
export const SESSION_COOKIE_NAME = 'hrms_session_token';

// In-memory or signed token auth
export function createSessionToken(session: UserSession): string {
  const payload = JSON.stringify({
    ...session,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  return `${b64}.${signature}`;
}

export function verifySessionToken(token: string | undefined): UserSession | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [b64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');

  if (signature !== expectedSig) {
    return null; // Tampered token!
  }

  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) {
      return null; // Expired
    }
    return {
      id: data.id,
      username: data.username,
      name: data.name,
      role: data.role as UserRole,
      empId: data.empId,
      dept: data.dept
    };
  } catch {
    return null;
  }
}

function getDobPassword(dob?: string): string {
  if (!dob) return '01011900';
  const clean = dob.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}${parts[1]}${parts[0]}`; // DDMMYYYY (e.g. 15011990)
  }
  return '01011900';
}

export function authenticateUser(username: string, password: string): UserSession | null {
  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = password.trim();

  // 1. Admin login (admin or hradmin)
  if (
    (trimmedUser === 'admin' && (trimmedPass === 'admin123' || trimmedPass === 'admin')) ||
    (trimmedUser === 'hradmin' && (trimmedPass === 'hradmin' || trimmedPass === 'admin123'))
  ) {
    return {
      id: 'usr_admin',
      username: 'admin',
      name: 'HR Administrator',
      role: 'ADMIN',
      dept: 'Executive Management'
    };
  }

  // 2. HR Manager login
  if (trimmedUser === 'hr' && (trimmedPass === 'hr123' || trimmedPass === 'hr')) {
    return {
      id: 'usr_hr',
      username: 'hr',
      name: 'Priya Patel (HR Lead)',
      role: 'HR_MANAGER',
      dept: 'Human Resources'
    };
  }

  // 3. Employee self-service login (EMP001, EMP002, etc. or corporate email)
  const employees = getEmployees();
  const emp = employees.find(
    e => (e.empCode && e.empCode.toLowerCase() === trimmedUser) ||
         (e.email && e.email.toLowerCase() === trimmedUser) ||
         (e.id && e.id.toLowerCase() === trimmedUser)
  );

  if (emp && emp.status !== 'inactive') {
    const dobPass = getDobPassword(emp.dob);
    const validPasswords = [
      dobPass,
      '01011900',
      'emp123',
      'password',
      '123456',
      emp.empCode.toLowerCase(),
      emp.phone ? emp.phone.replace(/\D/g, '') : ''
    ];

    if (validPasswords.includes(trimmedPass) || trimmedPass === 'emp') {
      return {
        id: `usr_${emp.id}`,
        username: emp.empCode,
        name: emp.name,
        role: 'EMPLOYEE',
        empId: emp.id,
        dept: emp.dept
      };
    }
  }

  return null;
}

export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  return verifySessionToken(cookie?.value);
}
