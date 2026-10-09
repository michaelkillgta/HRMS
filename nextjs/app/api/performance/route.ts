import { NextRequest, NextResponse } from 'next/server';
import {
  getPerformanceCycles, savePerformanceCycles,
  getPerformanceGoals, savePerformanceGoals,
  getPerformanceReviews, savePerformanceReviews,
  getEmployees, addActivity
} from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { PerformanceCycle, PerformanceGoal, AppraisalReview } from '@/types';

export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  const cycles = getPerformanceCycles();
  const goals = getPerformanceGoals();
  const reviews = getPerformanceReviews();
  const employees = getEmployees();

  if (session && session.role === 'EMPLOYEE') {
    const myGoals = goals.filter(g => g.empId === session.empId);
    const myReviews = reviews.filter(r => r.empId === session.empId);
    const myEmployee = employees.filter(e => e.id === session.empId);
    return NextResponse.json({
      cycles,
      goals: myGoals,
      reviews: myReviews,
      employees: myEmployee
    });
  }

  return NextResponse.json({ cycles, goals, reviews, employees });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'add_goal') {
      const { empId, cycleId, title, weight, target } = body.goal;
      const goals = getPerformanceGoals();
      const newGoal: PerformanceGoal = {
        id: `goal_${Date.now()}`,
        empId,
        cycleId,
        title,
        weight: Number(weight) || 25,
        target: target || 'Achieve 100% compliance',
        progress: 0
      };
      goals.push(newGoal);
      savePerformanceGoals(goals);
      addActivity(`Goal assigned: ${newGoal.title}`, session.name, 'info');
      return NextResponse.json({ success: true, goal: newGoal });
    }

    if (action === 'update_goal_progress') {
      const { id, progress } = body;
      const goals = getPerformanceGoals();
      const g = goals.find(x => x.id === id);
      if (g) {
        g.progress = Math.min(100, Math.max(0, Number(progress)));
        savePerformanceGoals(goals);
      }
      return NextResponse.json({ success: true, goal: g });
    }

    if (action === 'submit_review') {
      const { empId, cycleId, hrRatings, strengths, improve, reco, incr } = body;
      const reviews = getPerformanceReviews();
      let r = reviews.find(x => x.empId === empId && x.cycleId === cycleId);
      const ratings = hrRatings || [4, 4, 5, 4, 4, 4];
      const avg = Number((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1));

      if (!r) {
        r = {
          id: `rev_${Date.now()}`,
          empId,
          cycleId,
          status: 'done',
          avg,
          hr: {
            ratings,
            strengths: strengths || 'High performance and reliable delivery.',
            improve: improve || 'Expand leadership participation.',
            reco: reco || 'Increment',
            incr: Number(incr) || 12
          }
        };
        reviews.push(r);
      } else {
        r.status = 'done';
        r.avg = avg;
        r.hr = {
          ratings,
          strengths: strengths || r.hr?.strengths || '',
          improve: improve || r.hr?.improve || '',
          reco: reco || r.hr?.reco || 'Increment',
          incr: Number(incr) || r.hr?.incr || 10
        };
      }
      savePerformanceReviews(reviews);
      addActivity(`Appraisal finalized for employee ${empId} (Score: ${avg}/5.0)`, session.name, 'success');
      return NextResponse.json({ success: true, review: r });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error processing review' }, { status: 500 });
  }
}
