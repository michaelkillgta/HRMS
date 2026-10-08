import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'data.json');

function readDb() {
  try {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeDb(data) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data), 'utf8');
  } catch (e) {
    console.error('Failed to write DB:', e);
  }
}

export async function GET() {
  const state = readDb();
  return NextResponse.json(state);
}

export async function PUT(req) {
  const url = new URL(req.url);
  const key = url.pathname.split('/').pop();
  if (!key || !key.startsWith('hrms_')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const body = await req.text();
  const state = readDb();
  state[key] = body;
  writeDb(state);

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const key = url.pathname.split('/').pop();
  if (!key || !key.startsWith('hrms_')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  const state = readDb();
  delete state[key];
  writeDb(state);

  return new NextResponse(null, { status: 204 });
}
