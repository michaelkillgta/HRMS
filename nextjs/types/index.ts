export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  empId?: string;
  dept?: string;
}

export interface Employee {
  id: string;
  empCode: string;
  name: string;
  email: string;
  dept: string;
  role: string;
  status: 'active' | 'on-leave' | 'probation' | 'resigned' | 'inactive';
  phone: string;
  avatar: string;
  color: string;
  doj: string;
  dob?: string;
  relievingDate?: string;
  salary: number;
  ctc: number;
  pan?: string;
  bankAccount?: string;
  bankIfsc?: string;
  faceDescriptor?: number[];
  faceProfileEnrolled?: boolean;
  assignedOfficeLat?: number;
  assignedOfficeLng?: number;
  geofenceRadiusMeters?: number;
  createdAt?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'leave' | 'half-day' | 'od' | 'unmarked';
export type AttendanceMethod = 'face' | 'manual' | 'gps' | 'web';

export interface AttendanceRecord {
  id: string;
  empId: string;
  date: string; // YYYY-MM-DD
  inTime?: string; // HH:MM
  outTime?: string; // HH:MM
  status: AttendanceStatus;
  method?: AttendanceMethod;
  notes?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  faceMatchScore?: number;
  deviceInfo?: string;
}

export interface LeaveRequest {
  id: string;
  empId: string;
  type: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave';
  from: string;
  to: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PermissionRequest {
  id: string;
  empId: string;
  date: string;
  hours: number;
  fromTime: string;
  toTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

export interface PayrollRecord {
  empId: string;
  empCode: string;
  name: string;
  dept: string;
  role: string;
  monthlyGross: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  pfDeduction: number;
  ptDeduction: number;
  tdsDeduction: number;
  totalDeductions: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
}

// Recruitment
export type CandidateStage = 'Applied' | 'Screening' | 'Technical Interview' | 'Partner / Final Interview' | 'Offer' | 'Hired' | 'Rejected';

export interface JobOpening {
  id: string;
  title: string;
  dept: string;
  area: string;
  type: string;
  qual: string;
  exp: string;
  vacancies: number;
  salary: string;
  loc: string;
  desc: string;
  status: 'Open' | 'On Hold' | 'Closed';
  posted: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  qual: string;
  memNo?: string;
  exp?: number;
  employer?: string;
  cctc?: number;
  ectc?: number;
  notice?: number;
  interview?: string;
  stage: CandidateStage;
  rating?: number;
  notes?: string;
  applied: string;
  empId?: string;
}

// Performance
export interface PerformanceCycle {
  id: string;
  name: string;
  from: string;
  to: string;
  status: 'active' | 'closed';
}

export interface PerformanceGoal {
  id: string;
  empId: string;
  cycleId: string;
  title: string;
  weight: number;
  target: string;
  progress: number;
}

export interface AppraisalReview {
  id: string;
  empId: string;
  cycleId: string;
  status: 'draft' | 'self_submitted' | 'done';
  self?: {
    ratings: number[];
    notes: string;
  };
  hr?: {
    ratings: number[];
    strengths: string;
    improve: string;
    reco: 'No action' | 'Increment' | 'Promotion' | 'Increment + Promotion' | 'Performance Improvement Plan';
    incr?: number;
  };
  avg: number;
}

// Departments & Designations
export interface Designation {
  id: string;
  name: string;
  dept: string;
}

// Statutory Modules
export interface StatutoryModule {
  key: string;
  name: string;
  description: string;
  on: boolean;
  activatedBy?: string;
  activatedAt?: string;
}

// Permissions & On-Duty
export interface PermissionRecord {
  id: string;
  empId: string;
  type?: 'permission' | 'od';
  hours: number;
  fromTime: string;
  toTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  decidedBy?: string;
  decidedAt?: string;
}

// Official Letters
export interface LetterRecord {
  id: string;
  empId: string;
  type: 'appointment' | 'relieving' | 'experience' | 'increment';
  title: string;
  refNo: string;
  issuedDate: string;
  status: 'issued' | 'draft';
  content?: string;
  issuedBy?: string;
}

// Resignations
export interface ResignationRecord {
  id: string;
  empId: string;
  reason: string;
  submittedDate: string;
  noticePeriodDays: number;
  expectedRelievingDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  handoverNotes?: string;
  decidedBy?: string;
  decidedAt?: string;
}

// Service Register
export interface ServiceRecord {
  id: string;
  empId: string;
  doj: string;
  confirmationDate?: string;
  totalServiceYears: number;
  status: 'active' | 'relieved';
  promotions: {
    date: string;
    designation: string;
    salary: number;
  }[];
}

