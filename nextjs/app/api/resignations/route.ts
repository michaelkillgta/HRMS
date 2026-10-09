import { NextRequest, NextResponse } from 'next/server';
import { getResignations, saveResignations, getEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { ResignationRecord } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resignations = getResignations();

  if (session.role === 'EMPLOYEE') {
    const myResignations = resignations.filter(r => r.empId === session.empId);
    return NextResponse.json(myResignations);
  }

  return NextResponse.json(resignations);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const targetEmpId = session.role === 'EMPLOYEE' ? session.empId : (data.empId || session.empId);

    if (!targetEmpId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const employees = getEmployees();
    const emp = employees.find(e => e.id === targetEmpId);

    const submitDate = new Date();
    const noticeDays = Number(data.noticePeriodDays) || 60;
    const relievingDate = new Date(submitDate);
    relievingDate.setDate(relievingDate.getDate() + noticeDays);

    const newResignation: ResignationRecord = {
      id: `res_${Date.now()}`,
      empId: targetEmpId,
      reason: data.reason || 'Personal career transition',
      submittedDate: submitDate.toISOString().split('T')[0],
      noticePeriodDays: noticeDays,
      expectedRelievingDate: data.expectedRelievingDate || relievingDate.toISOString().split('T')[0],
      status: 'pending',
      handoverNotes: data.handoverNotes || ''
    };

    const resignations = getResignations();
    resignations.unshift(newResignation);
    saveResignations(resignations);

    addActivity(
      `Resignation submitted: ${emp?.name || targetEmpId} initiated exit workflow (${noticeDays}d notice)`,
      session.name,
      'danger'
    );

    return NextResponse.json({ success: true, resignation: newResignation }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error submitting resignation' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Only Admin can review resignations' }, { status: 403 });
  }

  try {
    const { id, status, expectedRelievingDate } = await req.json();
    if (!id || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const resignations = getResignations();
    const target = resignations.find(r => r.id === id);
    if (!target) {
      return NextResponse.json({ error: 'Resignation record not found' }, { status: 404 });
    }

    target.status = status;
    target.decidedBy = session.name;
    target.decidedAt = new Date().toISOString();
    if (expectedRelievingDate) {
      target.expectedRelievingDate = expectedRelievingDate;
    }

    saveResignations(resignations);

    const employees = getEmployees();
    const emp = employees.find(e => e.id === target.empId);

    // If approved, update employee relieving date in directory
    if (status === 'approved' && emp) {
      emp.relievingDate = target.expectedRelievingDate;
      const { saveEmployees } = await import('@/lib/db');
      saveEmployees(employees);
    }

    addActivity(
      `Resignation ${status.toUpperCase()}: ${emp?.name || target.empId} by ${session.name}`,
      session.name,
      status === 'approved' ? 'danger' : 'info'
    );

    return NextResponse.json({ success: true, resignation: target });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error reviewing resignation' }, { status: 500 });
  }
}
