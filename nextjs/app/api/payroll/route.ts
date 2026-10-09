import { NextRequest, NextResponse } from 'next/server';
import { getEmployees } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');

  const employees = getEmployees();

  // If role is EMPLOYEE, restrict strictly to their own payroll record
  if (session.role === 'EMPLOYEE') {
    const myEmp = employees.find(e => e.id === session.empId);
    if (!myEmp) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    const record = calculatePayroll(myEmp);
    return NextResponse.json([record]);
  }

  // Admin or HR can view single or all
  if (empId) {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    return NextResponse.json([calculatePayroll(emp)]);
  }

  const payrolls = employees.map(e => calculatePayroll(e));
  return NextResponse.json(payrolls);
}

function calculatePayroll(emp: any) {
  const monthlyGross = Math.round((emp.ctc || emp.salary * 12 || 600000) / 12);
  const basic = Math.round(monthlyGross * 0.50);
  const hra = Math.round(basic * 0.40);
  const specialAllowance = Math.max(0, monthlyGross - (basic + hra));

  const pfDeduction = Math.min(1800, Math.round(basic * 0.12));
  const ptDeduction = monthlyGross > 20000 ? 200 : 0;
  const taxableAnnual = monthlyGross * 12 - 75000; // Standard deduction
  const tdsDeduction = taxableAnnual > 700000 ? Math.round((taxableAnnual * 0.05) / 12) : 0;

  const totalDeductions = pfDeduction + ptDeduction + tdsDeduction;
  const netSalary = monthlyGross - totalDeductions;

  return {
    empId: emp.id,
    empCode: emp.empCode,
    name: emp.name,
    dept: emp.dept,
    role: emp.role,
    monthlyGross,
    basic,
    hra,
    specialAllowance,
    pfDeduction,
    ptDeduction,
    tdsDeduction,
    totalDeductions,
    netSalary,
    status: 'processed'
  };
}
