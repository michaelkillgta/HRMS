'use client';

import { useState } from 'react';

const INITIAL_LEAVES = [
  { id: 'l1', empName: "Aisha Khan", type: "Casual Leave", from: "2026-10-12", to: "2026-10-14", days: 3, reason: "Personal work", status: "pending" },
  { id: 'l2', empName: "Priya Patel", type: "Sick Leave", from: "2026-10-02", to: "2026-10-04", days: 3, reason: "Viral fever", status: "approved" },
  { id: 'l3', empName: "Michael Chen", type: "Annual Leave", from: "2026-10-20", to: "2026-10-25", days: 5, reason: "Vacation", status: "pending" },
];

export default function LeavesPage() {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);

  const handleDecision = (id, newStatus) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Leave Management & Approvals</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => alert('Apply Leave Modal')}>
            + Apply Leave
          </button>
        </div>
      </header>

      <div className="content">
        <div className="leave-cards">
          <div className="leave-card">
            <h4>Casual Leave (CL)</h4>
            <div className="bar"><div className="fill" style={{ width: '60%', backgroundColor: 'var(--primary)' }}></div></div>
            <div className="detail"><span>Used: 6 days</span><span>Remaining: 6 days</span></div>
          </div>
          <div className="leave-card">
            <h4>Sick Leave (SL)</h4>
            <div className="bar"><div className="fill" style={{ width: '40%', backgroundColor: 'var(--success)' }}></div></div>
            <div className="detail"><span>Used: 4 days</span><span>Remaining: 8 days</span></div>
          </div>
          <div className="leave-card">
            <h4>Earned / Annual Leave (EL)</h4>
            <div className="bar"><div className="fill" style={{ width: '25%', backgroundColor: 'var(--warning)' }}></div></div>
            <div className="detail"><span>Used: 3 days</span><span>Remaining: 12 days</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Leave Applications & Approvals</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.empName}</strong></td>
                    <td>{l.type}</td>
                    <td>{l.from} to {l.to}</td>
                    <td>{l.days}</td>
                    <td>{l.reason}</td>
                    <td>
                      <span className={`badge ${l.status === 'approved' ? 'badge-success' : l.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>
                      {l.status === 'pending' ? (
                        <div className="btn-group">
                          <button className="btn btn-sm btn-primary" onClick={() => handleDecision(l.id, 'approved')}>Approve</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDecision(l.id, 'rejected')}>Reject</button>
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
