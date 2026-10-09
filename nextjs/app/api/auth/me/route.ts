import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getEmployees } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null, employee: null }, { status: 401 });
  }

  let employee = null;
  if (session.empId) {
    const employees = getEmployees();
    employee = employees.find(e => e.id === session.empId) || null;
  }

  return NextResponse.json({ authenticated: true, user: session, employee });
}
