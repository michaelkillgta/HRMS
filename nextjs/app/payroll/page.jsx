'use client';

import { useState } from 'react';

const INITIAL_PAYROLL = [
  { id: 'p1', empName: "Aisha Khan", role: "Senior Developer", basic: 50000, hra: 20000, special: 15000, pf: 1800, pt: 200, net: 83000 },
  { id: 'p2', empName: "Rahul Sharma", role: "Marketing Lead", basic: 45000, hra: 18000, special: 12000, pf: 1800, pt: 200, net: 73000 },
  { id: 'p3', empName: "Priya Patel", role: "HR Manager", basic: 40000, hra: 16000, special: 10000, pf: 1800, pt: 200, net: 64000 },
  { id: 'p4', empName: "James Wilson", role: "Accountant", basic: 35000, hra: 14000, special: 8000, pf: 1800, pt: 200, net: 55000 },
];

export default function PayrollPage() {
  const [payroll] = useState(INITIAL_PAYROLL);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Payroll & Salary Structures</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => alert('Run Payroll Batch')}>
            ▶ Process Monthly Pay Run
          </button>
        </div>
      </header>

      <div className="content">
        <div className="payroll-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h2>Current Pay Run Summary (October 2026)</h2>
            </div>
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <div className="salary-item"><span>Total Gross Salary</span><strong>₹ 2,75,000</strong></div>
              <div className="salary-item"><span>Provident Fund (PF Employee)</span><span>₹ 7,200</span></div>
              <div className="salary-item"><span>Professional Tax (PT)</span><span>₹ 800</span></div>
              <div className="salary-item"><span>TDS / Income Tax Withholding</span><span>₹ 12,000</span></div>
              <div className="salary-total"><span>Net Disbursable Payout</span><strong style={{ color: 'var(--success)' }}>₹ 2,55,000</strong></div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Compliance & Statutory</h2>
            </div>
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Configured according to Telangana / India labour laws (PF @ 12%, ESI threshold, Form 124 declarations).
              </p>
              <div className="btn-group">
                <button className="btn btn-outline btn-sm">Download PF ECR</button>
                <button className="btn btn-outline btn-sm">Generate Payslips</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Employee Salary Breakdown</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Basic Salary</th>
                  <th>HRA</th>
                  <th>Special Allow.</th>
                  <th>PF Deduct.</th>
                  <th>Net Take Home</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.empName}</strong></td>
                    <td>{p.role}</td>
                    <td>₹ {p.basic.toLocaleString()}</td>
                    <td>₹ {p.hra.toLocaleString()}</td>
                    <td>₹ {p.special.toLocaleString()}</td>
                    <td style={{ color: 'var(--danger)' }}>₹ {p.pf.toLocaleString()}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>₹ {p.net.toLocaleString()}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => alert(`Payslip for ${p.empName}`)}>
                        Payslip
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
