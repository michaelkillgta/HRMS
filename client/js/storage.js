// ==========================================================================
// R & A ASSOCIATES HRMS - STORAGE & STATE PERSISTENCE
// ==========================================================================

import { STORAGE_KEYS, uid } from './config.js';

export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Data accessors
export function getEmployees() { return load(STORAGE_KEYS.employees) || []; }
export function setEmployees(list) { save(STORAGE_KEYS.employees, list); }

export function getLeaves() { return load(STORAGE_KEYS.leaves) || []; }
export function setLeaves(list) { save(STORAGE_KEYS.leaves, list); }

export function getAttendance() { return load(STORAGE_KEYS.attendance) || []; }
export function setAttendance(list) { save(STORAGE_KEYS.attendance, list); }

export function getActivities() { return load(STORAGE_KEYS.activities) || []; }

export function addActivity(text, color = 'blue') {
  const acts = getActivities();
  acts.unshift({ id: uid(), text, time: new Date().toISOString(), color });
  if (acts.length > 50) acts.pop();
  save(STORAGE_KEYS.activities, acts);
}

export function findEmployee(id) {
  return getEmployees().find(e => e.id === id);
}

// Seed default dataset if clean install
export function seedIfEmpty() {
  if (!load(STORAGE_KEYS.employees)) {
    const seedEmployees = [
      { id: uid(), name: "Aisha Khan", email: "aisha.khan@company.com", dept: "Engineering", role: "Senior Developer", status: "active", phone: "+91 98765 11111", avatar: "AK", color: "#2563eb", createdAt: new Date().toISOString() },
      { id: uid(), name: "Rahul Sharma", email: "rahul.sharma@company.com", dept: "Marketing", role: "Marketing Lead", status: "active", phone: "+91 98765 22222", avatar: "RS", color: "#7c3aed", createdAt: new Date().toISOString() },
      { id: uid(), name: "Priya Patel", email: "priya.patel@company.com", dept: "Human Resources", role: "HR Manager", status: "on-leave", phone: "+91 98765 33333", avatar: "PP", color: "#059669", createdAt: new Date().toISOString() },
      { id: uid(), name: "James Wilson", email: "james.wilson@company.com", dept: "Finance", role: "Accountant", status: "active", phone: "+91 98765 44444", avatar: "JW", color: "#d97706", createdAt: new Date().toISOString() },
      { id: uid(), name: "Sneha Reddy", email: "sneha.reddy@company.com", dept: "Engineering", role: "UI/UX Designer", status: "probation", phone: "+91 98765 55555", avatar: "SR", color: "#dc2626", createdAt: new Date().toISOString() },
      { id: uid(), name: "Michael Chen", email: "michael.chen@company.com", dept: "Sales", role: "Sales Executive", status: "active", phone: "+91 98765 66666", avatar: "MC", color: "#0891b2", createdAt: new Date().toISOString() },
    ];
    save(STORAGE_KEYS.employees, seedEmployees);

    const seedLeaves = [
      { id: uid(), empId: seedEmployees[0].id, type: "Casual Leave", from: "2026-10-05", to: "2026-10-07", reason: "Family function", status: "pending", createdAt: new Date().toISOString() },
      { id: uid(), empId: seedEmployees[2].id, type: "Sick Leave", from: "2026-10-02", to: "2026-10-04", reason: "Fever", status: "pending", createdAt: new Date().toISOString() },
      { id: uid(), empId: seedEmployees[5].id, type: "Annual Leave", from: "2026-10-10", to: "2026-10-14", reason: "Vacation", status: "pending", createdAt: new Date().toISOString() },
    ];
    save(STORAGE_KEYS.leaves, seedLeaves);
    save(STORAGE_KEYS.attendance, []);
    save(STORAGE_KEYS.activities, [
      { id: uid(), text: "System initialized with sample data", time: new Date().toISOString(), color: "blue" }
    ]);
  }
}

// Background sync with /api/state
export function initDataSync(onDataChange) {
  if (typeof window === 'undefined' || location.protocol === 'file:') return;

  const nSet = Storage.prototype.setItem;
  const nDel = Storage.prototype.removeItem;
  const mine = k => typeof k === 'string' && k.startsWith('hrms_');
  const push = (m, k, v) => fetch('/api/state/' + k, { method: m, body: v }).catch(() => {});

  async function pull(sync) {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const d = await res.json();
      const keys = Object.keys(d);
      let changed = false;

      if (!keys.length) {
        Object.keys(localStorage).filter(mine).forEach(k => push('PUT', k, localStorage.getItem(k)));
        return;
      }

      keys.forEach(k => {
        if (localStorage.getItem(k) !== d[k]) {
          nSet.call(localStorage, k, d[k]);
          changed = true;
        }
      });

      Object.keys(localStorage).filter(mine).forEach(k => {
        if (!(k in d)) {
          nDel.call(localStorage, k);
          changed = true;
        }
      });

      if (changed && typeof onDataChange === 'function') {
        onDataChange();
      }
    } catch (e) {
      // offline or server unavailable
    }
  }

  pull(true);

  // Hook localStorage writes
  Storage.prototype.setItem = function (k, v) {
    nSet.call(this, k, v);
    if (this === localStorage && mine(k)) push('PUT', k, v);
  };
  Storage.prototype.removeItem = function (k) {
    nDel.call(this, k);
    if (this === localStorage && mine(k)) push('DELETE', k);
  };

  setInterval(() => pull(false), 30000);
}
