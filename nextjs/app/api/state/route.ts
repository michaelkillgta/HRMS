import { NextRequest, NextResponse } from 'next/server';
import { readRawState, writeRawState } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

function getBackendBaseUrl(): string | null {
  return process.env.BACKEND_URL || process.env.APP_BACKEND_URL || null;
}

export async function GET(req: NextRequest) {
  const backendBase = getBackendBaseUrl();
  if (backendBase) {
    try {
      const targetUrl = new URL('/api/state', backendBase);
      const res = await fetch(targetUrl);
      if (res.ok) {
        const state = await res.json();
        return NextResponse.json(state);
      }
    } catch (err) {
      console.warn('Backend service state request failed, falling back to local DB:', err);
    }
  }

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
  const backendBase = getBackendBaseUrl();
  if (backendBase) {
    try {
      const targetUrl = new URL(`/api/state/${key}`, backendBase);
      const res = await fetch(targetUrl, {
        method: 'PUT',
        body,
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return new NextResponse(null, { status: 204 });
      }
    } catch (err) {
      console.warn('Backend service state PUT failed, falling back to local DB:', err);
    }
  }

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

  const backendBase = getBackendBaseUrl();
  if (backendBase) {
    try {
      const targetUrl = new URL(`/api/state/${key}`, backendBase);
      const res = await fetch(targetUrl, { method: 'DELETE' });
      if (res.ok) {
        return new NextResponse(null, { status: 204 });
      }
    } catch (err) {
      console.warn('Backend service state DELETE failed, falling back to local DB:', err);
    }
  }

  const state = readRawState();
  delete state[key];
  writeRawState(state);

  return new NextResponse(null, { status: 204 });
}
