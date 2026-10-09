import { NextRequest, NextResponse } from 'next/server';
import { getMenuPrivileges, saveMenuPrivileges, getEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const privileges = getMenuPrivileges();
  const employees = getEmployees();
  return NextResponse.json({ privileges, employees });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Only Admin can configure Menu Access' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'set_default') {
      const { menu, allowed } = body;
      const privileges = getMenuPrivileges();
      privileges.defaults[menu] = !!allowed;
      saveMenuPrivileges(privileges);
      addActivity(`Menu access default for [${menu}] set to ${allowed ? 'Allowed' : 'Hidden'}`, session.name, 'info');
      return NextResponse.json({ success: true, privileges });
    }

    if (action === 'set_emp_priv') {
      const { empId, menu, allowed } = body;
      const privileges = getMenuPrivileges();
      if (!privileges.byEmp[empId]) privileges.byEmp[empId] = {};
      privileges.byEmp[empId][menu] = !!allowed;
      saveMenuPrivileges(privileges);
      return NextResponse.json({ success: true, privileges });
    }

    if (action === 'reset_all') {
      const privileges = getMenuPrivileges();
      privileges.byEmp = {};
      saveMenuPrivileges(privileges);
      addActivity(`Reset all employee custom menu privileges to defaults`, session.name, 'warning');
      return NextResponse.json({ success: true, privileges });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error configuring access' }, { status: 500 });
  }
}
