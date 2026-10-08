'use client';

import { useState } from 'react';

const INITIAL_RESIGNATIONS = [
  { id: 'res1', empName: "Sneha Reddy", role: "UI/UX Designer", applyDate: "2026-09-15", lwd: "2026-10-31", noticePeriod: "45 Days", reason: "Higher studies abroad", status: "Notice Period" },
];

export default function ResignationsPage() {
  const [resignations] = useState(INITIAL_RESIGNATIONS);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Resignations & Exit Separation</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-outline" onClick={() => alert('Submit Resignation')}>
            Submit Resignation
          </button>
        </div>
      </header>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <h2>Active Resignations & Exit Workflows</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Applied On</th>
                  <th>Notice Period</th>
                  <th>Last Working Day (LWD)</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Exit Action</th>
                </tr>
              </thead>
              <tbody>
                {resignations.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.empName}</strong></td>
                    <td>{r.role}</td>
                    <td>{r.applyDate}</td>
                    <td>{r.noticePeriod}</td>
                    <td><strong style={{ color: 'var(--danger)' }}>{r.lwd}</strong></td>
                    <td>{r.reason}</td>
                    <td><span className="badge badge-warning">{r.status}</span></td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => alert(`Full & Final Settlement calculation for ${r.empName}`)}>
                        Process F&amp;F
                      </button>
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
