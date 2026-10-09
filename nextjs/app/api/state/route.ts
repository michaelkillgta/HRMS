import { NextRequest, NextResponse } from 'next/server';
import { readRawState, writeRawState } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const state = readRawState();
  return NextResponse.json(state);
}

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized: Admin or HR Manager access required' }, { status: 403 });
  }

  const url = new URL(req.url);
  const key = url.pathname.split('/').pop();
  if (!key || !key.startsWith('hrms_')) {
    return NextResponse.json({ error: 'Invalid state key' }, { status: 400 });
  }

  const body = await req.text();
  const state = readRawState();
  state[key] = body;
  writeRawState(state);

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const url = new URL(req.url);
  const key = url.pathname.split('/').pop();
  if (!key || !key.startsWith('hrms_')) {
    return NextResponse.json({ error: 'Invalid state key' }, { status: 400 });
  }

  const state = readRawState();
  delete state[key];
  writeRawState(state);

  return new NextResponse(null, { status: 204 });
}
