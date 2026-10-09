import { NextRequest, NextResponse } from 'next/server';
import { getStatutoryModules, saveStatutoryModules, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const mods = getStatutoryModules();
  return NextResponse.json(mods);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Admin or HR Manager access required' }, { status: 403 });
  }

  try {
    const { key, on } = await req.json();
    if (!key) {
      return NextResponse.json({ error: 'Module key is required' }, { status: 400 });
    }

    const mods = getStatutoryModules();
    mods[key] = {
      on: !!on,
      by: session.name,
      at: new Date().toISOString()
    };

    saveStatutoryModules(mods);
    addActivity(`Statutory Module [${key.toUpperCase()}] ${on ? 'activated' : 'revoked'} by ${session.name}`, session.name, on ? 'success' : 'warning');

    return NextResponse.json({ success: true, modules: mods });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error updating statutory module' }, { status: 500 });
  }
}
