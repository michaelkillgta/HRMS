import { NextRequest, NextResponse } from 'next/server';
import { getActivities } from '@/lib/db';

export async function GET(req: NextRequest) {
  const activities = getActivities();
  return NextResponse.json(activities);
}
