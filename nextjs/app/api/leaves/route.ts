import { NextRequest, NextResponse } from 'next/server';
import { getLeaves, saveLeaves, getEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { LeaveRequest } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  const leaves = getLeaves();

  if (session && session.role === 'EMPLOYEE') {
    return NextResponse.json(leaves.filter(l => l.empId === session.empId));
  }

  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  if (empId) {
    return NextResponse.json(leaves.filter(l => l.empId === empId));
  }

  return NextResponse.json(leaves);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { empId, type, from, to, reason } = body;

    if (!empId || !type || !from || !to) {
      return NextResponse.json({ error: 'Missing required leave fields' }, { status: 400 });
    }

    if (session.role === 'EMPLOYEE' && session.empId && session.empId !== empId) {
      return NextResponse.json({ error: 'Forbidden: You can only apply leave for yourself' }, { status: 403 });
    }

    const employees = getEmployees();
    const emp = employees.find(e => e.id === empId);

    // Calculate days
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaves = getLeaves();
    const newLeave: LeaveRequest = {
      id: `lv_${Date.now()}`,
      empId,
      type,
      from,
      to,
      days: isNaN(days) ? 1 : Math.max(days, 1),
      reason: reason || 'Personal reasons',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    leaves.unshift(newLeave);
    saveLeaves(leaves);

    addActivity(
      `Leave requested: ${emp ? emp.name : empId} applied for ${newLeave.days}d ${type}`,
      session.name,
      'warning'
    );

    return NextResponse.json({ success: true, leave: newLeave }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating leave request' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Only Admin or HR Manager can approve/reject leaves' }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const leaves = getLeaves();
    const leave = leaves.find(l => l.id === id);
    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    leave.status = status;
    leave.reviewedBy = session.name;
    leave.reviewedAt = new Date().toISOString();

    saveLeaves(leaves);

    const employees = getEmployees();
    const emp = employees.find(e => e.id === leave.empId);

    addActivity(
      `Leave request ${status.toUpperCase()}: ${emp ? emp.name : leave.empId} (${leave.days}d ${leave.type}) by ${session.name}`,
      session.name,
      status === 'approved' ? 'success' : 'danger'
    );

    return NextResponse.json({ success: true, leave });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error reviewing leave' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Leave ID required' }, { status: 400 });
    }

    const leaves = getLeaves();
    const target = leaves.find(l => l.id === id);
    if (!target) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    // Employees can only cancel their own pending requests
    if (session.role === 'EMPLOYEE') {
      if (target.empId !== session.empId) {
        return NextResponse.json({ error: 'Forbidden: You cannot cancel another employee request' }, { status: 403 });
      }
      if (target.status !== 'pending') {
        return NextResponse.json({ error: 'Only pending leave requests can be cancelled' }, { status: 400 });
      }
    }

    const updated = leaves.filter(l => l.id !== id);
    saveLeaves(updated);

    addActivity(
      `Leave request cancelled: ${target.days}d ${target.type} by ${session.name}`,
      session.name,
      'info'
    );

    return NextResponse.json({ success: true, message: 'Leave request cancelled' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error cancelling leave' }, { status: 500 });
  }
}

