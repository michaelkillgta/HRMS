import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getSessionFromRequest } from '@/lib/auth';
import { addActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (session) {
    addActivity(`User ${session.name} signed out`, session.name, 'info');
  }

  const res = NextResponse.json({ success: true, message: 'Signed out successfully' });
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0
  });
  return res;
}
