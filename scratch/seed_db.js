const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const employees = [
  {
    id: "emp_001",
    empCode: "EMP001",
    name: "Rajesh Sharma",
    email: "rajesh.sharma@company.com",
    dept: "Engineering",
    role: "Senior Developer",
    status: "active",
    phone: "+91 98765 11111",
    avatar: "RS",
    color: "#2563eb",
    doj: "2023-01-15",
    dob: "1990-05-12",
    salary: 85000,
    ctc: 1200000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_002",
    empCode: "EMP002",
    name: "Priya Patel",
    email: "priya.patel@company.com",
    dept: "Human Resources",
    role: "HR Manager",
    status: "active",
    phone: "+91 98765 22222",
    avatar: "PP",
    color: "#059669",
    doj: "2022-06-01",
    dob: "1992-08-24",
    salary: 75000,
    ctc: 1050000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_003",
    empCode: "EMP003",
    name: "Amit Verma",
    email: "amit.verma@company.com",
    dept: "Engineering",
    role: "Tech Lead",
    status: "active",
    phone: "+91 98765 33333",
    avatar: "AV",
    color: "#7c3aed",
    doj: "2021-03-10",
    dob: "1988-11-15",
    salary: 110000,
    ctc: 1550000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_004",
    empCode: "EMP004",
    name: "Sneha Reddy",
    email: "sneha.reddy@company.com",
    dept: "Engineering",
    role: "UI/UX Designer",
    status: "active",
    phone: "+91 98765 44444",
    avatar: "SR",
    color: "#dc2626",
    doj: "2023-09-15",
    dob: "1995-02-18",
    salary: 65000,
    ctc: 920000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_005",
    empCode: "EMP005",
    name: "Vikram Malhotra",
    email: "vikram.m@company.com",
    dept: "Finance",
    role: "Finance Head",
    status: "active",
    phone: "+91 98765 55555",
    avatar: "VM",
    color: "#d97706",
    doj: "2020-11-01",
    dob: "1986-07-30",
    salary: 125000,
    ctc: 1800000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_006",
    empCode: "EMP006",
    name: "Ananya Iyer",
    email: "ananya.iyer@company.com",
    dept: "Legal & Compliance",
    role: "Legal Advisor",
    status: "active",
    phone: "+91 98765 66666",
    avatar: "AI",
    color: "#0891b2",
    doj: "2022-04-12",
    dob: "1991-12-05",
    salary: 80000,
    ctc: 1150000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_007",
    empCode: "EMP007",
    name: "Rahul Nair",
    email: "rahul.nair@company.com",
    dept: "Marketing",
    role: "Marketing Lead",
    status: "active",
    phone: "+91 98765 77777",
    avatar: "RN",
    color: "#4f46e5",
    doj: "2023-02-20",
    dob: "1993-09-14",
    salary: 70000,
    ctc: 1000000,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp_008",
    empCode: "EMP008",
    name: "Pooja Joshi",
    email: "pooja.joshi@company.com",
    dept: "Operations",
    role: "Operations Specialist",
    status: "active",
    phone: "+91 98765 88888",
    avatar: "PJ",
    color: "#db2777",
    doj: "2024-01-10",
    dob: "1996-03-22",
    salary: 50000,
    ctc: 700000,
    createdAt: new Date().toISOString()
  }
];

const leaves = [
  {
    id: "lv_001",
    empId: "emp_004",
    type: "Sick Leave",
    from: "2026-10-09",
    to: "2026-10-10",
    days: 2,
    reason: "Viral fever and doctor consultation",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    id: "lv_002",
    empId: "emp_007",
    type: "Casual Leave",
    from: "2026-10-14",
    to: "2026-10-15",
    days: 2,
    reason: "Family function",
    status: "approved",
    createdAt: new Date().toISOString()
  }
];

// Generate last 7 days of attendance
const attendance = [];
const dates = [];
for (let i = 6; i >= 0; i--) {
  const d = new Date(Date.now() - i * 86400000);
  dates.push(d.toISOString().slice(0, 10));
}

dates.forEach((d, dIdx) => {
  // emp_001: Rajesh - Always present, biometric face
  attendance.push({ id: `att_001_${d}`, empId: "emp_001", date: d, inTime: "09:12", outTime: "18:05", status: "present", method: "face" });
  // emp_002: Priya - Present on time
  attendance.push({ id: `att_002_${d}`, empId: "emp_002", date: d, inTime: "09:05", outTime: "18:15", status: "present", method: "manual" });
  // emp_003: Amit - Present (Engineering lead)
  attendance.push({ id: `att_003_${d}`, empId: "emp_003", date: d, inTime: "09:28", outTime: "18:30", status: "present", method: "face" });
  // emp_004: Sneha - On leave today (Sick Leave), present on other days
  if (dIdx === dates.length - 1) {
    attendance.push({ id: `att_004_${d}`, empId: "emp_004", date: d, inTime: "", outTime: "", status: "leave", method: "leave" });
  } else {
    attendance.push({ id: `att_004_${d}`, empId: "emp_004", date: d, inTime: "09:45", outTime: "18:00", status: "late", method: "face" });
  }
  // emp_005: Vikram - Finance head, present early
  attendance.push({ id: `att_005_${d}`, empId: "emp_005", date: d, inTime: "08:55", outTime: "17:50", status: "present", method: "face" });
  // emp_006: Ananya - Legal Advisor, on-duty occasionally
  if (dIdx % 3 === 0) {
    attendance.push({ id: `att_006_${d}`, empId: "emp_006", date: d, inTime: "10:00", outTime: "17:30", status: "od", method: "od" });
  } else {
    attendance.push({ id: `att_006_${d}`, empId: "emp_006", date: d, inTime: "09:18", outTime: "18:02", status: "present", method: "manual" });
  }
  // emp_007: Rahul - Marketing
  attendance.push({ id: `att_007_${d}`, empId: "emp_007", date: d, inTime: "09:40", outTime: "18:10", status: "late", method: "face" });
  // emp_008: Pooja - Operations, on time
  attendance.push({ id: `att_008_${d}`, empId: "emp_008", date: d, inTime: "09:02", outTime: "18:10", status: "present", method: "face" });
});

const activities = [
  { id: "act_001", text: "Rajesh Sharma checked in via Biometric Face Recognition (09:12 AM)", time: new Date(Date.now() - 3600000).toISOString(), color: "green" },
  { id: "act_002", text: "Priya Patel confirmed October Leave Policy guidelines", time: new Date(Date.now() - 7200000).toISOString(), color: "blue" },
  { id: "act_003", text: "Sneha Reddy submitted Sick Leave request (Awaiting HR approval)", time: new Date(Date.now() - 10800000).toISOString(), color: "yellow" },
  { id: "act_004", text: "Biometric Attendance Device #1 synced 8 staff records successfully", time: new Date(Date.now() - 14400000).toISOString(), color: "green" }
];

const state = {
  hrms_employees: JSON.stringify(employees),
  hrms_leaves: JSON.stringify(leaves),
  hrms_attendance: JSON.stringify(attendance),
  hrms_activities: JSON.stringify(activities),
  hrms_departments: JSON.stringify(["Engineering", "Human Resources", "Finance", "Legal & Compliance", "Marketing", "Operations"]),
  hrms_ctc: JSON.stringify({
    emp_001: 1200000,
    emp_002: 1050000,
    emp_003: 1550000,
    emp_004: 920000,
    emp_005: 1800000,
    emp_006: 1150000,
    emp_007: 1000000,
    emp_008: 700000
  })
};

const dbFile = path.join(dataDir, 'data.json');
fs.writeFileSync(dbFile, JSON.stringify(state, null, 2), 'utf8');
console.log('Seeded database written to:', dbFile, 'with 7 days of attendance!');
