import { NextRequest, NextResponse } from 'next/server';
import { getPermissions, savePermissions, getEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { PermissionRecord } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const permissions = getPermissions();

  if (session.role === 'EMPLOYEE') {
    const myPerms = permissions.filter(p => p.empId === session.empId);
    return NextResponse.json(myPerms);
  }

  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  if (empId) {
    return NextResponse.json(permissions.filter(p => p.empId === empId));
  }

  return NextResponse.json(permissions);
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
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employees = getEmployees();
    const emp = employees.find(e => e.id === targetEmpId);

    const newPerm: PermissionRecord = {
      id: `perm_${Date.now()}`,
      empId: targetEmpId,
      type: data.type || 'permission',
      hours: Number(data.hours) || 1,
      fromTime: data.fromTime || '14:00',
      toTime: data.toTime || '15:00',
      reason: data.reason || 'Personal requisition',
      status: 'pending',
      date: data.date || new Date().toISOString().split('T')[0]
    };

    const permissions = getPermissions();
    permissions.unshift(newPerm);
    savePermissions(permissions);

    addActivity(
      `Permission requested: ${emp?.name || targetEmpId} (${newPerm.hours}h - ${newPerm.reason})`,
      session.name,
      'warning'
    );

    return NextResponse.json({ success: true, permission: newPerm }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating permission' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required to review permissions' }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const permissions = getPermissions();
    const perm = permissions.find(p => p.id === id);
    if (!perm) {
      return NextResponse.json({ error: 'Permission request not found' }, { status: 404 });
    }

    perm.status = status;
    perm.decidedBy = session.name;
    perm.decidedAt = new Date().toISOString();
    savePermissions(permissions);

    const employees = getEmployees();
    const emp = employees.find(e => e.id === perm.empId);

    addActivity(
      `Permission request ${status.toUpperCase()}: ${emp?.name || perm.empId} by ${session.name}`,
      session.name,
      status === 'approved' ? 'success' : 'danger'
    );

    return NextResponse.json({ success: true, permission: perm });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error reviewing permission' }, { status: 500 });
  }
}
