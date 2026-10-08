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
    empId: "emp_001",
    type: "Casual Leave",
    from: "2026-10-12",
    to: "2026-10-13",
    days: 2,
    reason: "Personal family event",
    status: "approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "lv_002",
    empId: "emp_004",
    type: "Sick Leave",
    from: "2026-10-08",
    to: "2026-10-09",
    days: 2,
    reason: "Viral fever",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

const today = new Date().toISOString().slice(0, 10);
const attendance = [
  { id: "att_001", empId: "emp_001", date: today, inTime: "09:12", outTime: "18:05", status: "present", method: "face" },
  { id: "att_002", empId: "emp_002", date: today, inTime: "09:05", outTime: "18:15", status: "present", method: "manual" },
  { id: "att_003", empId: "emp_003", date: today, inTime: "09:28", outTime: "", status: "present", method: "face" },
  { id: "att_004", empId: "emp_004", date: today, inTime: "", outTime: "", status: "on-leave", method: "leave" },
  { id: "att_005", empId: "emp_005", date: today, inTime: "08:55", outTime: "17:50", status: "present", method: "face" },
  { id: "att_006", empId: "emp_006", date: today, inTime: "09:18", outTime: "18:02", status: "present", method: "manual" },
  { id: "att_007", empId: "emp_007", date: today, inTime: "09:40", outTime: "", status: "present", method: "face" },
  { id: "att_008", empId: "emp_008", date: today, inTime: "09:02", outTime: "18:10", status: "present", method: "face" }
];

const activities = [
  { id: "act_001", text: "HRMS database initialized successfully", time: new Date().toISOString(), color: "green" },
  { id: "act_002", text: "Rajesh Sharma checked in via Biometric Face Recognition", time: new Date(Date.now() - 3600000).toISOString(), color: "blue" },
  { id: "act_003", text: "Sneha Reddy submitted Sick Leave request", time: new Date(Date.now() - 7200000).toISOString(), color: "yellow" }
];

const state = {
  hrms_employees: JSON.stringify(employees),
  hrms_leaves: JSON.stringify(leaves),
  hrms_attendance: JSON.stringify(attendance),
  hrms_activities: JSON.stringify(activities),
  hrms_departments: JSON.stringify(["Engineering", "Human Resources", "Finance", "Legal & Compliance", "Marketing", "Operations"])
};

const dbFile = path.join(dataDir, 'data.json');
fs.writeFileSync(dbFile, JSON.stringify(state, null, 2), 'utf8');
console.log('Seeded state written to:', dbFile);
