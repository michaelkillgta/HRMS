'use client';

import { useState } from 'react';

const INITIAL_PERMS = [
  { id: 'perm1', empName: "Rahul Sharma", date: "2026-10-09", duration: "1 Hour", timing: "04:30 PM - 05:30 PM", reason: "Bank work", status: "approved" },
  { id: 'perm2', empName: "Aisha Khan", date: "2026-10-09", duration: "2 Hours", timing: "10:00 AM - 12:00 PM", reason: "Medical checkup", status: "pending" },
  { id: 'perm3', empName: "James Wilson", date: "2026-10-08", duration: "On Duty (OD)", timing: "Full Day", reason: "ROC / MCA Office filing", status: "approved" },
];

export default function PermissionsPage() {
  const [perms, setPerms] = useState(INITIAL_PERMS);

  const handleDecision = (id, newStatus) => {
    setPerms(perms.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Permissions & On-Duty (OD) Outings</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => alert('New Permission / OD Outing')}>
            + Request Permission
          </button>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <h2>Permission Requests (1 hr / 2 hr short outings & OD)</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Type / Duration</th>
                  <th>Time Slot</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.empName}</strong></td>
                    <td>{p.date}</td>
                    <td><span className="badge badge-blue">{p.duration}</span></td>
                    <td>{p.timing}</td>
                    <td>{p.reason}</td>
                    <td>
                      <span className={`badge ${p.status === 'approved' ? 'badge-success' : p.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status === 'pending' ? (
                        <div className="btn-group">
                          <button className="btn btn-sm btn-primary" onClick={() => handleDecision(p.id, 'approved')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDecision(p.id, 'rejected')}>Reject</button>
                        </div>
                      ) : (
                        <span className="dept-tag">Decided</span>
                      )}
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
