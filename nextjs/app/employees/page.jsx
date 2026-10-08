'use client';

import { useState } from 'react';

const INITIAL_EMPLOYEES = [
  { id: '1', name: "Aisha Khan", email: "aisha.khan@company.com", dept: "Engineering", role: "Senior Developer", status: "active", phone: "+91 98765 11111", avatar: "AK", color: "#2563eb" },
  { id: '2', name: "Rahul Sharma", email: "rahul.sharma@company.com", dept: "Marketing", role: "Marketing Lead", status: "active", phone: "+91 98765 22222", avatar: "RS", color: "#7c3aed" },
  { id: '3', name: "Priya Patel", email: "priya.patel@company.com", dept: "Human Resources", role: "HR Manager", status: "on-leave", phone: "+91 98765 33333", avatar: "PP", color: "#059669" },
  { id: '4', name: "James Wilson", email: "james.wilson@company.com", dept: "Finance", role: "Accountant", status: "active", phone: "+91 98765 44444", avatar: "JW", color: "#d97706" },
  { id: '5', name: "Sneha Reddy", email: "sneha.reddy@company.com", dept: "Engineering", role: "UI/UX Designer", status: "probation", phone: "+91 98765 55555", avatar: "SR", color: "#dc2626" },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.dept === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Employees Directory</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => alert('New employee modal')}>
            + Add Employee
          </button>
        </div>
      </header>

      <div className="content">
        <div className="filter-bar">
          <div className="filter-group">
            <input
              type="text"
              className="text-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '260px' }}
            />
            <select
              className="select-input"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div className="dept-tag">Showing {filtered.length} employees</div>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="emp-cell">
                        <div className="emp-avatar" style={{ backgroundColor: e.color }}>
                          {e.avatar}
                        </div>
                        <div>
                          <div className="emp-name">{e.name}</div>
                          <div className="emp-email">{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{e.dept}</td>
                    <td>{e.role}</td>
                    <td>
                      <span className={`badge ${e.status === 'active' ? 'badge-success' : e.status === 'on-leave' ? 'badge-warning' : 'badge-blue'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td>{e.phone}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-outline btn-sm">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
