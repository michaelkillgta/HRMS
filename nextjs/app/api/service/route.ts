import { NextRequest, NextResponse } from 'next/server';
import { getServiceRecords, getEmployees } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceRecords = getServiceRecords();
  const employees = getEmployees();

  // Helper to ensure every employee has a populated service record
  const enriched = employees.map(emp => {
    const existing = serviceRecords.find(s => s.empId === emp.id);
    const dojDate = emp.doj ? new Date(emp.doj) : new Date('2023-01-15');
    const now = new Date();
    const diffYears = Math.max(0.1, Number(((now.getTime() - dojDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1)));

    return {
      id: existing?.id || `svc_${emp.id}`,
      empId: emp.id,
      doj: emp.doj || '2023-01-15',
      confirmationDate: existing?.confirmationDate || '2023-07-15',
      totalServiceYears: existing?.totalServiceYears || diffYears,
      status: emp.status === 'resigned' ? 'relieved' : 'active',
      promotions: existing?.promotions || [
        { date: emp.doj || '2023-01-15', designation: emp.role, salary: emp.salary }
      ]
    };
  });

  if (session.role === 'EMPLOYEE') {
    const mine = enriched.find(s => s.empId === session.empId);
    return NextResponse.json(mine ? [mine] : []);
  }

  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  if (empId) {
    const target = enriched.find(s => s.empId === empId);
    return NextResponse.json(target ? [target] : []);
  }

  return NextResponse.json(enriched);
}
