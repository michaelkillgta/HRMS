import fs from 'fs';
import path from 'path';
import {
  Employee, AttendanceRecord, LeaveRequest, ActivityItem,
  JobOpening, Candidate, PerformanceCycle, PerformanceGoal,
  AppraisalReview, Designation, StatutoryModule,
  PermissionRecord, LetterRecord, ResignationRecord, ServiceRecord
} from '../types';

function getDbPath(): string {
  const candidatePaths = [
    path.resolve(process.cwd(), 'data', 'data.json'),
    path.resolve(process.cwd(), '..', 'data', 'data.json'),
    path.resolve(__dirname, '../../data/data.json'),
    path.resolve(__dirname, '../../../data/data.json')
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  const defaultPath = path.resolve(process.cwd(), 'data', 'data.json');
  const dir = path.dirname(defaultPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return defaultPath;
}

export function readRawState(): Record<string, string> {
  const dbPath = getDbPath();
  try {
    if (!fs.existsSync(dbPath)) return {};
    const content = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return {};
  }
}

export function writeRawState(state: Record<string, string>): void {
  const dbPath = getDbPath();
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${dbPath}.tmp`;
    const jsonStr = JSON.stringify(state, null, 2);
    fs.writeFileSync(tempPath, jsonStr, 'utf8');
    fs.renameSync(tempPath, dbPath);

    const mirrorPath = dbPath.includes('nextjs')
      ? path.resolve(dbPath, '../../data/data.json')
      : path.resolve(dbPath, '../nextjs/data/data.json');
    if (mirrorPath !== dbPath && fs.existsSync(path.dirname(mirrorPath))) {
      try {
        fs.writeFileSync(mirrorPath, jsonStr, 'utf8');
      } catch {}
    }
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// EMPLOYEES
export function getEmployees(): Employee[] {
  const state = readRawState();
  try {
    return JSON.parse(state['hrms_employees'] || '[]');
  } catch {
    return [];
  }
}

export function saveEmployees(employees: Employee[]): void {
  const state = readRawState();
  state['hrms_employees'] = JSON.stringify(employees);
  writeRawState(state);
}

// ATTENDANCE
export function getAttendance(): AttendanceRecord[] {
  const state = readRawState();
  try {
    return JSON.parse(state['hrms_attendance'] || '[]');
  } catch {
    return [];
  }
}

export function saveAttendance(records: AttendanceRecord[]): void {
  const state = readRawState();
  state['hrms_attendance'] = JSON.stringify(records);
  writeRawState(state);
}

// LEAVES
export function getLeaves(): LeaveRequest[] {
  const state = readRawState();
  try {
    return JSON.parse(state['hrms_leaves'] || '[]');
  } catch {
    return [];
  }
}

export function saveLeaves(leaves: LeaveRequest[]): void {
  const state = readRawState();
  state['hrms_leaves'] = JSON.stringify(leaves);
  writeRawState(state);
}

// ACTIVITIES
export function getActivities(): ActivityItem[] {
  const state = readRawState();
  try {
    return JSON.parse(state['hrms_activities'] || '[]');
  } catch {
    return [];
  }
}

export function addActivity(action: string, user: string = 'System', type: 'success' | 'warning' | 'info' | 'danger' = 'info'): void {
  const state = readRawState();
  let activities: ActivityItem[] = [];
  try {
    activities = JSON.parse(state['hrms_activities'] || '[]');
  } catch {}

  const newItem: ActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user,
    action,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type
  };

  activities.unshift(newItem);
  if (activities.length > 50) activities = activities.slice(0, 50);

  state['hrms_activities'] = JSON.stringify(activities);
  writeRawState(state);
}

// RECRUITMENT (JOBS & CANDIDATES)
export function getJobs(): JobOpening[] {
  const state = readRawState();
  try {
    const jobs = JSON.parse(state['hrms_rec_jobs'] || '[]');
    if (jobs.length > 0) return jobs;
  } catch {}

  // Defaults
  return [
    {
      id: 'job_1',
      title: 'Company Secretary',
      dept: 'Legal & Compliance',
      area: 'Company Secretarial',
      type: 'Full-time',
      qual: 'CS (Qualified – ACS/FCS)',
      exp: '3-6 years',
      vacancies: 2,
      salary: '₹60,000 – 85,000 / mo',
      loc: 'Corporate HQ, Hyderabad',
      desc: 'ROC filings (MGT-7, AOC-4), Board & AGM management, secretarial audit and MCA compliance.',
      status: 'Open',
      posted: '2026-10-01'
    },
    {
      id: 'job_2',
      title: 'Legal Associate',
      dept: 'Legal & Compliance',
      area: 'Contracts & Drafting',
      type: 'Full-time',
      qual: 'LLB / LLM',
      exp: '2-4 years',
      vacancies: 1,
      salary: '₹45,000 – 65,000 / mo',
      loc: 'Corporate HQ, Hyderabad',
      desc: 'Commercial contract drafting, vendor agreements, dispute resolution, and legal vetting.',
      status: 'Open',
      posted: '2026-10-04'
    }
  ];
}

export function saveJobs(jobs: JobOpening[]): void {
  const state = readRawState();
  state['hrms_rec_jobs'] = JSON.stringify(jobs);
  writeRawState(state);
}

export function getCandidates(): Candidate[] {
  const state = readRawState();
  try {
    const cands = JSON.parse(state['hrms_rec_cands'] || '[]');
    if (cands.length > 0) return cands;
  } catch {}

  return [
    {
      id: 'cand_1',
      jobId: 'job_1',
      name: 'Naveen Kumar ACS',
      phone: '+91 98480 12345',
      email: 'naveen.cs@gmail.com',
      source: 'LinkedIn',
      qual: 'CS (Qualified – ACS/FCS)',
      memNo: 'ACS 54210',
      exp: 4,
      employer: 'Kedia & Co Associates',
      cctc: 720000,
      ectc: 900000,
      notice: 30,
      stage: 'Technical Interview',
      rating: 4,
      notes: 'Strong understanding of Companies Act 2013 and LODR compliances.',
      applied: '2026-10-05'
    },
    {
      id: 'cand_2',
      jobId: 'job_2',
      name: 'Harika Reddy',
      phone: '+91 97000 88990',
      email: 'harika.reddy.law@gmail.com',
      source: 'Referral',
      qual: 'LLB + CS',
      exp: 3,
      employer: 'Reddy Law Chambers',
      cctc: 540000,
      ectc: 700000,
      notice: 15,
      stage: 'Screening',
      rating: 5,
      notes: 'Excellent contract drafting speed and communication.',
      applied: '2026-10-07'
    }
  ];
}

export function saveCandidates(candidates: Candidate[]): void {
  const state = readRawState();
  state['hrms_rec_cands'] = JSON.stringify(candidates);
  writeRawState(state);
}

// PERFORMANCE
export function getPerformanceCycles(): PerformanceCycle[] {
  const state = readRawState();
  try {
    const cycles = JSON.parse(state['hrms_perf_cycles'] || '[]');
    if (cycles.length > 0) return cycles;
  } catch {}

  return [
    {
      id: 'cycle_h2_2026',
      name: 'FY 2026-27 (H2 Review)',
      from: '2026-10-01',
      to: '2027-03-31',
      status: 'active'
    },
    {
      id: 'cycle_h1_2026',
      name: 'FY 2026-27 (H1 Review)',
      from: '2026-04-01',
      to: '2026-09-30',
      status: 'closed'
    }
  ];
}

export function savePerformanceCycles(cycles: PerformanceCycle[]): void {
  const state = readRawState();
  state['hrms_perf_cycles'] = JSON.stringify(cycles);
  writeRawState(state);
}

export function getPerformanceGoals(): PerformanceGoal[] {
  const state = readRawState();
  try {
    const goals = JSON.parse(state['hrms_perf_goals'] || '[]');
    if (goals.length > 0) return goals;
  } catch {}

  return [
    {
      id: 'goal_1',
      empId: 'emp_001',
      cycleId: 'cycle_h2_2026',
      title: 'Deliver Core Microservices Architecture and CI/CD',
      weight: 40,
      target: '100% test coverage & zero downtime release',
      progress: 75
    },
    {
      id: 'goal_2',
      empId: 'emp_001',
      cycleId: 'cycle_h2_2026',
      title: 'Mentor Junior Engineering Staff & Lead Code Audits',
      weight: 30,
      target: 'Bi-weekly tech talks & 100% PR review SLA',
      progress: 80
    },
    {
      id: 'goal_3',
      empId: 'emp_002',
      cycleId: 'cycle_h2_2026',
      title: 'HR Compliance & EPF/ESI Audit Certification',
      weight: 50,
      target: 'Zero defect audit and 100% on-time filings',
      progress: 90
    }
  ];
}

export function savePerformanceGoals(goals: PerformanceGoal[]): void {
  const state = readRawState();
  state['hrms_perf_goals'] = JSON.stringify(goals);
  writeRawState(state);
}

export function getPerformanceReviews(): AppraisalReview[] {
  const state = readRawState();
  try {
    return JSON.parse(state['hrms_perf_reviews'] || '[]');
  } catch {
    return [];
  }
}

export function savePerformanceReviews(reviews: AppraisalReview[]): void {
  const state = readRawState();
  state['hrms_perf_reviews'] = JSON.stringify(reviews);
  writeRawState(state);
}

// DEPARTMENTS & DESIGNATIONS
export function getDepartmentsList(): string[] {
  const state = readRawState();
  try {
    const depts = JSON.parse(state['hrms_departments'] || '[]');
    if (depts.length > 0) return depts;
  } catch {}

  return ['Engineering', 'Marketing', 'Human Resources', 'Finance', 'Legal & Compliance', 'Operations'];
}

export function saveDepartmentsList(departments: string[]): void {
  const state = readRawState();
  state['hrms_departments'] = JSON.stringify(departments);
  writeRawState(state);
}

export function getDesignationsList(): Designation[] {
  const state = readRawState();
  try {
    const desigs = JSON.parse(state['hrms_designations'] || '[]');
    if (desigs.length > 0) return desigs;
  } catch {}

  return [
    { id: 'des_1', name: 'Senior Developer', dept: 'Engineering' },
    { id: 'des_2', name: 'Software Engineer', dept: 'Engineering' },
    { id: 'des_3', name: 'HR Manager', dept: 'Human Resources' },
    { id: 'des_4', name: 'Talent Acquisition Specialist', dept: 'Human Resources' },
    { id: 'des_5', name: 'Finance Controller', dept: 'Finance' },
    { id: 'des_6', name: 'Accountant', dept: 'Finance' },
    { id: 'des_7', name: 'Company Secretary', dept: 'Legal & Compliance' },
    { id: 'des_8', name: 'Legal Associate', dept: 'Legal & Compliance' }
  ];
}

export function saveDesignationsList(designations: Designation[]): void {
  const state = readRawState();
  state['hrms_designations'] = JSON.stringify(designations);
  writeRawState(state);
}

// STATUTORY MODULES
export function getStatutoryModules(): Record<string, { on: boolean; by?: string; at?: string }> {
  const state = readRawState();
  try {
    const mods = JSON.parse(state['hrms_modules'] || '{}');
    if (Object.keys(mods).length > 0) return mods;
  } catch {}

  return {
    bonus: { on: true, by: 'Admin User', at: '2026-10-01' },
    ot: { on: true, by: 'Admin User', at: '2026-10-01' },
    minwage: { on: true, by: 'Admin User', at: '2026-10-01' },
    encash: { on: false },
    fnf: { on: true, by: 'Admin User', at: '2026-10-01' },
    arrears: { on: false },
    f12bb: { on: true, by: 'Admin User', at: '2026-10-01' },
    registers: { on: true, by: 'Admin User', at: '2026-10-01' },
    tds: { on: true, by: 'Admin User', at: '2026-10-01' }
  };
}

export function saveStatutoryModules(mods: Record<string, { on: boolean; by?: string; at?: string }>): void {
  const state = readRawState();
  state['hrms_modules'] = JSON.stringify(mods);
  writeRawState(state);
}

// MENU ACCESS PRIVILEGES
export function getMenuPrivileges(): { defaults: Record<string, boolean>; byEmp: Record<string, Record<string, boolean>> } {
  const state = readRawState();
  try {
    const privs = JSON.parse(state['hrms_privs'] || '{}');
    if (privs.defaults) return privs;
  } catch {}

  return {
    defaults: {
      myleave: true,
      myresign: true,
      myletters: true,
      myatt: true,
      myperm: true,
      myperf: true,
      mystat: true,
      myservice: true
    },
    byEmp: {}
  };
}

export function saveMenuPrivileges(privs: { defaults: Record<string, boolean>; byEmp: Record<string, Record<string, boolean>> }): void {
  const state = readRawState();
  state['hrms_privs'] = JSON.stringify(privs);
  writeRawState(state);
}

// PERMISSIONS & ON-DUTY (OD)
export function getPermissions(): PermissionRecord[] {
  const state = readRawState();
  try {
    const list = JSON.parse(state['hrms_permissions'] || '[]');
    if (list.length > 0) return list;
  } catch {}

  return [
    {
      id: 'perm_1',
      empId: 'emp_001',
      type: 'permission',
      hours: 2,
      fromTime: '15:00',
      toTime: '17:00',
      reason: 'Personal banking and tax audit appointment',
      status: 'approved',
      date: new Date().toISOString().split('T')[0],
      decidedBy: 'Admin User',
      decidedAt: new Date().toISOString()
    },
    {
      id: 'perm_2',
      empId: 'emp_002',
      type: 'od',
      hours: 4,
      fromTime: '10:00',
      toTime: '14:00',
      reason: 'Client site technical architecture presentation',
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    }
  ];
}

export function savePermissions(records: PermissionRecord[]): void {
  const state = readRawState();
  state['hrms_permissions'] = JSON.stringify(records);
  writeRawState(state);
}

// OFFICIAL LETTERS
export function getLetters(): LetterRecord[] {
  const state = readRawState();
  try {
    const letters = JSON.parse(state['hrms_letters'] || '[]');
    if (letters.length > 0) return letters;
  } catch {}

  return [
    {
      id: 'let_1',
      empId: 'emp_001',
      type: 'appointment',
      title: 'Letter of Appointment - Senior Developer',
      refNo: 'HRMS/APP/2023/001',
      issuedDate: '2023-01-15',
      status: 'issued',
      issuedBy: 'HR Administration'
    },
    {
      id: 'let_2',
      empId: 'emp_001',
      type: 'increment',
      title: 'Annual Compensation Increment & Revision',
      refNo: 'HRMS/INC/2026/089',
      issuedDate: '2026-04-01',
      status: 'issued',
      issuedBy: 'HR Administration'
    },
    {
      id: 'let_3',
      empId: 'emp_002',
      type: 'appointment',
      title: 'Letter of Appointment - Marketing Lead',
      refNo: 'HRMS/APP/2023/002',
      issuedDate: '2023-03-01',
      status: 'issued',
      issuedBy: 'HR Administration'
    }
  ];
}

export function saveLetters(letters: LetterRecord[]): void {
  const state = readRawState();
  state['hrms_letters'] = JSON.stringify(letters);
  writeRawState(state);
}

// RESIGNATIONS
export function getResignations(): ResignationRecord[] {
  const state = readRawState();
  try {
    const list = JSON.parse(state['hrms_resignations'] || '[]');
    if (list.length > 0) return list;
  } catch {}

  return [
    {
      id: 'res_1',
      empId: 'emp_006',
      reason: 'Pursuing higher academic opportunities abroad',
      submittedDate: '2026-09-15',
      noticePeriodDays: 60,
      expectedRelievingDate: '2026-11-15',
      status: 'pending',
      handoverNotes: 'Handing over client portfolio and ongoing enterprise deals to senior sales executive.'
    }
  ];
}

export function saveResignations(records: ResignationRecord[]): void {
  const state = readRawState();
  state['hrms_resignations'] = JSON.stringify(records);
  writeRawState(state);
}

// SERVICE RECORDS
export function getServiceRecords(): ServiceRecord[] {
  const state = readRawState();
  try {
    const records = JSON.parse(state['hrms_service'] || '[]');
    if (records.length > 0) return records;
  } catch {}

  return [
    {
      id: 'svc_emp_001',
      empId: 'emp_001',
      doj: '2023-01-15',
      confirmationDate: '2023-07-15',
      totalServiceYears: 3.7,
      status: 'active',
      promotions: [
        { date: '2023-01-15', designation: 'Software Engineer', salary: 65000 },
        { date: '2024-04-01', designation: 'Senior Developer', salary: 85000 }
      ]
    },
    {
      id: 'svc_emp_002',
      empId: 'emp_002',
      doj: '2023-03-01',
      confirmationDate: '2023-09-01',
      totalServiceYears: 3.6,
      status: 'active',
      promotions: [
        { date: '2023-03-01', designation: 'Marketing Specialist', salary: 55000 },
        { date: '2025-01-01', designation: 'Marketing Lead', salary: 72000 }
      ]
    }
  ];
}

export function saveServiceRecords(records: ServiceRecord[]): void {
  const state = readRawState();
  state['hrms_service'] = JSON.stringify(records);
  writeRawState(state);
}

