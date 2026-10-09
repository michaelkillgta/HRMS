import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, saveEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { Employee } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  const employees = getEmployees();

  // If role is EMPLOYEE, sanitize sensitive compensation & statutory data of other staff
  if (session && session.role === 'EMPLOYEE') {
    const sanitized = employees.map(e => {
      if (e.id === session.empId) return e; // full access to own profile
      return {
        id: e.id,
        empCode: e.empCode,
        name: e.name,
        email: e.email,
        dept: e.dept,
        role: e.role,
        status: e.status,
        avatar: e.avatar,
        color: e.color,
        doj: e.doj
      };
    });
    return NextResponse.json(sanitized);
  }

  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Admin or HR Manager access required' }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!data.name || !data.email || !data.dept) {
      return NextResponse.json({ error: 'Name, email, and department are required' }, { status: 400 });
    }

    const employees = getEmployees();

    // Generate unique code & initials
    const codeNum = employees.length + 1;
    const empCode = data.empCode || `EMP${String(codeNum).padStart(3, '0')}`;
    const initials = data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      empCode,
      name: data.name,
      email: data.email,
      dept: data.dept,
      role: data.role || 'Staff Member',
      status: data.status || 'active',
      phone: data.phone || '+91 98000 00000',
      avatar: data.avatar || initials,
      color: data.color || randomColor,
      doj: data.doj || new Date().toISOString().split('T')[0],
      dob: data.dob,
      salary: Number(data.salary) || 50000,
      ctc: Number(data.ctc) || (Number(data.salary) || 50000) * 12,
      pan: data.pan,
      bankAccount: data.bankAccount,
      bankIfsc: data.bankIfsc,
      faceProfileEnrolled: data.faceProfileEnrolled ?? Boolean(data.avatar && data.avatar.length > 5),
      createdAt: new Date().toISOString()
    };

    employees.push(newEmp);
    saveEmployees(employees);
    addActivity(`New employee onboarded: ${newEmp.name} (${newEmp.empCode})`, session.name, 'success');

    return NextResponse.json({ success: true, employee: newEmp }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating employee' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employees = getEmployees();
    const idx = employees.findIndex(e => e.id === data.id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    employees[idx] = {
      ...employees[idx],
      ...data,
      salary: data.salary !== undefined ? Number(data.salary) : employees[idx].salary,
      ctc: data.ctc !== undefined ? Number(data.ctc) : employees[idx].ctc
    };

    saveEmployees(employees);
    addActivity(`Updated employee profile: ${employees[idx].name}`, session.name, 'info');

    return NextResponse.json({ success: true, employee: employees[idx] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating employee' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Only Admin can delete employees' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const employees = getEmployees();
    const target = employees.find(e => e.id === id);
    if (!target) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const filtered = employees.filter(e => e.id !== id);
    saveEmployees(filtered);
    addActivity(`Deleted employee record: ${target.name} (${target.empCode})`, session.name, 'danger');

    return NextResponse.json({ success: true, message: 'Employee deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting employee' }, { status: 500 });
  }
}
