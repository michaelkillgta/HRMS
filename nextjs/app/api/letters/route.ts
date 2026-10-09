import { NextRequest, NextResponse } from 'next/server';
import { getLetters, saveLetters, getEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { LetterRecord } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const letters = getLetters();

  if (session.role === 'EMPLOYEE') {
    const myLetters = letters.filter(l => l.empId === session.empId);
    return NextResponse.json(myLetters);
  }

  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  if (empId) {
    return NextResponse.json(letters.filter(l => l.empId === empId));
  }

  return NextResponse.json(letters);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Admin or HR access required' }, { status: 403 });
  }

  try {
    const data = await req.json();
    if (!data.empId || !data.type) {
      return NextResponse.json({ error: 'empId and type are required' }, { status: 400 });
    }

    const employees = getEmployees();
    const emp = employees.find(e => e.id === data.empId);

    const newLetter: LetterRecord = {
      id: `let_${Date.now()}`,
      empId: data.empId,
      type: data.type,
      title: data.title || `${data.type.toUpperCase()} Letter`,
      refNo: data.refNo || `HRMS/DOC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      issuedDate: data.issuedDate || new Date().toISOString().split('T')[0],
      status: 'issued',
      content: data.content,
      issuedBy: session.name
    };

    const letters = getLetters();
    letters.unshift(newLetter);
    saveLetters(letters);

    addActivity(
      `Official letter issued: ${newLetter.title} for ${emp?.name || data.empId}`,
      session.name,
      'info'
    );

    return NextResponse.json({ success: true, letter: newLetter }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating letter' }, { status: 500 });
  }
}
