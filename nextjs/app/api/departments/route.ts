import { NextRequest, NextResponse } from 'next/server';
import {
  getDepartmentsList, saveDepartmentsList,
  getDesignationsList, saveDesignationsList,
  getEmployees, addActivity
} from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { Designation } from '@/types';

export async function GET(req: NextRequest) {
  const departments = getDepartmentsList();
  const designations = getDesignationsList();
  const employees = getEmployees();
  return NextResponse.json({ departments, designations, employees });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'add_dept') {
      const { name } = body;
      if (!name) return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
      const departments = getDepartmentsList();
      if (!departments.includes(name)) {
        departments.push(name);
        saveDepartmentsList(departments);
        addActivity(`Added department: ${name}`, session.name, 'success');
      }
      return NextResponse.json({ success: true, departments });
    }

    if (action === 'add_desig') {
      const { name, dept } = body;
      if (!name) return NextResponse.json({ error: 'Designation name is required' }, { status: 400 });
      const designations = getDesignationsList();
      const newDesig: Designation = {
        id: `des_${Date.now()}`,
        name,
        dept: dept || ''
      };
      designations.push(newDesig);
      saveDesignationsList(designations);
      addActivity(`Added designation: ${name} (${dept || 'All'})`, session.name, 'info');
      return NextResponse.json({ success: true, designation: newDesig });
    }

    if (action === 'delete_dept') {
      const { name } = body;
      const departments = getDepartmentsList();
      const filtered = departments.filter(d => d !== name);
      saveDepartmentsList(filtered);
      addActivity(`Removed department: ${name}`, session.name, 'warning');
      return NextResponse.json({ success: true, departments: filtered });
    }

    if (action === 'delete_desig') {
      const { id } = body;
      const designations = getDesignationsList();
      const filtered = designations.filter(d => d.id !== id);
      saveDesignationsList(filtered);
      return NextResponse.json({ success: true, designations: filtered });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error processing department operation' }, { status: 500 });
  }
}
