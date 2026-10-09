import { NextRequest, NextResponse } from 'next/server';
import { getJobs, saveJobs, getCandidates, saveCandidates, getEmployees, saveEmployees, addActivity } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { JobOpening, Candidate, Employee } from '@/types';

export async function GET(req: NextRequest) {
  const jobs = getJobs();
  const candidates = getCandidates();
  return NextResponse.json({ jobs, candidates });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session || (session.role !== 'ADMIN' && session.role !== 'HR_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'add_job') {
      const { title, dept, area, type, qual, exp, vacancies, salary, loc, desc, status } = body.job;
      const jobs = getJobs();
      const newJob: JobOpening = {
        id: `job_${Date.now()}`,
        title: title || 'New Role',
        dept: dept || 'Legal & Compliance',
        area: area || 'Company Secretarial',
        type: type || 'Full-time',
        qual: qual || 'CS (Qualified – ACS/FCS)',
        exp: exp || '2-4 years',
        vacancies: Number(vacancies) || 1,
        salary: salary || '₹50,000 / mo',
        loc: loc || 'HQ',
        desc: desc || '',
        status: status || 'Open',
        posted: new Date().toISOString().split('T')[0]
      };
      jobs.unshift(newJob);
      saveJobs(jobs);
      addActivity(`Recruitment: Job opening posted for ${newJob.title}`, session.name, 'success');
      return NextResponse.json({ success: true, job: newJob });
    }

    if (action === 'add_candidate') {
      const { jobId, name, phone, email, source, qual, exp, employer, cctc, ectc, notice, stage, rating, notes } = body.candidate;
      const candidates = getCandidates();
      const newCand: Candidate = {
        id: `cand_${Date.now()}`,
        jobId: jobId || 'job_1',
        name,
        phone: phone || '',
        email: email || '',
        source: source || 'LinkedIn',
        qual: qual || 'CS / LLB',
        exp: Number(exp) || 0,
        employer: employer || '',
        cctc: Number(cctc) || 0,
        ectc: Number(ectc) || 0,
        notice: Number(notice) || 30,
        stage: stage || 'Applied',
        rating: Number(rating) || 4,
        notes: notes || '',
        applied: new Date().toISOString().split('T')[0]
      };
      candidates.unshift(newCand);
      saveCandidates(candidates);
      addActivity(`Candidate applied: ${newCand.name}`, session.name, 'info');
      return NextResponse.json({ success: true, candidate: newCand });
    }

    if (action === 'update_stage') {
      const { id, stage } = body;
      const candidates = getCandidates();
      const target = candidates.find(c => c.id === id);
      if (!target) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

      target.stage = stage;
      saveCandidates(candidates);
      addActivity(`Candidate ${target.name} progressed to [${stage}]`, session.name, stage === 'Hired' ? 'success' : 'info');

      // If hired, auto create employee!
      if (stage === 'Hired' && !target.empId) {
        const employees = getEmployees();
        const codeNum = employees.length + 1;
        const empCode = `EMP${String(codeNum).padStart(3, '0')}`;
        const newEmp: Employee = {
          id: `emp_${Date.now()}`,
          empCode,
          name: target.name,
          email: target.email || `${target.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
          dept: 'Legal & Compliance',
          role: 'Staff Associate',
          status: 'probation',
          phone: target.phone || '+91 98000 00000',
          avatar: target.name.slice(0, 2).toUpperCase(),
          color: '#2563eb',
          doj: new Date().toISOString().split('T')[0],
          salary: Math.round((target.ectc || 600000) / 12),
          ctc: target.ectc || 600000,
          createdAt: new Date().toISOString()
        };
        employees.push(newEmp);
        saveEmployees(employees);
        target.empId = newEmp.id;
        saveCandidates(candidates);
        addActivity(`Candidate ${target.name} onboarded as ${newEmp.empCode}`, session.name, 'success');
      }

      return NextResponse.json({ success: true, candidate: target });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error processing request' }, { status: 500 });
  }
}
