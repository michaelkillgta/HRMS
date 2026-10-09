import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { addActivity } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const session = authenticateUser(username, password);

    if (!session) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = createSessionToken(session);
    addActivity(`User ${session.name} (${session.role}) signed in successfully`, session.name, 'success');

    const res = NextResponse.json({
      success: true,
      user: session
    });

    // Set secure HttpOnly cookie
    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 });
  }
}
