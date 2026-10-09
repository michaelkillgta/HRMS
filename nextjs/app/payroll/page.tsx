'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';

export default function PayrollPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payroll');
      if (res.ok) {
        const data = await res.json();
        setPayrolls(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const myPayroll = payrolls[0] || null;

  const totalGross = payrolls.reduce((sum, p) => sum + (p.monthlyGross || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + (p.totalDeductions || 0), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <DashboardLayout
      title={isEmployee ? "My Payslip & Compensation" : "Payroll & Compensation"}
      subtitle={
        isEmployee
          ? "Monthly salary disbursement, earnings breakdown, statutory withholdings & printable payslips"
          : "Workforce salary processing, statutory deductions, bank disbursement files & register audit"
      }
      onRefreshData={loadData}
    >
      {isEmployee ? (
        /* ================= EMPLOYEE VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {myPayroll ? (
            <>
              {/* Employee Personal KPIs */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-title">Monthly Gross Salary</span>
                  <div className="kpi-value-wrap">
                    <span className="kpi-value">₹{myPayroll.monthlyGross?.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="kpi-subtext neutral">Fixed Monthly CTC component</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-title">Net Take-Home Pay</span>
                  <div className="kpi-value-wrap">
                    <span className="kpi-value" style={{ color: '#059669' }}>
                      ₹{myPayroll.netSalary?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="kpi-subtext positive">Disbursed to Bank Account</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-title">Statutory Withholdings</span>
                  <div className="kpi-value-wrap">
                    <span className="kpi-value" style={{ color: '#d97706' }}>
                      ₹{myPayroll.totalDeductions?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="kpi-subtext warning">EPF + PT + TDS Withholding</span>
                </div>

                <div className="kpi-card">
                  <span className="kpi-title">Annual Package (CTC)</span>
                  <div className="kpi-value-wrap">
                    <span className="kpi-value" style={{ color: '#2563eb' }}>
                      ₹{(myPayroll.monthlyGross * 12)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="kpi-subtext neutral">Total Cost to Company</span>
                </div>
              </div>

              {/* Current Month Official Payslip Card */}
              <div className="card">
                <div className="card-header">
                  <div className="card-header-left">
                    <h2 className="card-title">Salary Slip: October 2026</h2>
                    <span className="card-subtitle">Pay Cycle: 01 Oct 2026 – 31 Oct 2026 · Status: Processed</span>
                  </div>
                  <button className="btn btn-primary" onClick={() => setSelectedSlip(myPayroll)}>
                    🖨️ View & Print Formal Payslip
                  </button>
                </div>

                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Earnings Column */}
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', borderBottom: '2px solid #059669', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                        Gross Earnings (+)
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>Basic Pay (50%)</span>
                        <span style={{ fontWeight: 600 }}>₹{myPayroll.basic?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>House Rent Allowance (HRA 40%)</span>
                        <span style={{ fontWeight: 600 }}>₹{myPayroll.hra?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>Special Allowance</span>
                        <span style={{ fontWeight: 600 }}>₹{myPayroll.specialAllowance?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '2px dashed #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}>
                        <span>Total Gross Pay</span>
                        <span style={{ color: '#0f172a' }}>₹{myPayroll.monthlyGross?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Deductions Column */}
                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626', borderBottom: '2px solid #dc2626', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                        Statutory Deductions (-)
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>Provident Fund (EPF 12%)</span>
                        <span style={{ fontWeight: 600, color: '#dc2626' }}>-₹{myPayroll.pfDeduction?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>Professional Tax (PT)</span>
                        <span style={{ fontWeight: 600, color: '#dc2626' }}>-₹{myPayroll.ptDeduction?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.88rem' }}>
                        <span style={{ color: '#475569' }}>Income Tax Withholding (TDS)</span>
                        <span style={{ fontWeight: 600, color: '#dc2626' }}>-₹{myPayroll.tdsDeduction?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '2px dashed #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}>
                        <span>Total Deductions</span>
                        <span style={{ color: '#dc2626' }}>-₹{myPayroll.totalDeductions?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Highlight Banner */}
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 700, textTransform: 'uppercase' }}>
                        NET SALARY DISBURSEMENT
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#047857' }}>
                        Deposited to Bank Account ({currentEmp?.bankAccount ? `•••• ${currentEmp.bankAccount.slice(-4)}` : 'HDFC Bank'})
                      </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46' }}>
                      ₹{myPayroll.netSalary?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Payslips Table */}
              <div className="card">
                <div className="card-header">
                  <div className="card-header-left">
                    <h2 className="card-title">Salary Archives & Statements</h2>
                    <span className="card-subtitle">Monthly payslips for FY 2026-27</span>
                  </div>
                </div>
                <div className="card-body flush">
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Pay Period</th>
                          <th>Gross Wages</th>
                          <th>Deductions</th>
                          <th>Net Take-Home</th>
                          <th>Payment Mode</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 600 }}>October 2026</td>
                          <td>₹{myPayroll.monthlyGross?.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#dc2626' }}>-₹{myPayroll.totalDeductions?.toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>₹{myPayroll.netSalary?.toLocaleString('en-IN')}</td>
                          <td>Direct Bank NEFT</td>
                          <td><span className="badge badge-present"><span className="badge-dot" /> Disbursed</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-sm btn-primary" onClick={() => setSelectedSlip(myPayroll)}>
                              View Slip
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>September 2026</td>
                          <td>₹{myPayroll.monthlyGross?.toLocaleString('en-IN')}</td>
                          <td style={{ color: '#dc2626' }}>-₹{myPayroll.totalDeductions?.toLocaleString('en-IN')}</td>
                          <td style={{ fontWeight: 700, color: '#059669' }}>₹{myPayroll.netSalary?.toLocaleString('en-IN')}</td>
                          <td>Direct Bank NEFT</td>
                          <td><span className="badge badge-present"><span className="badge-dot" /> Disbursed</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedSlip(myPayroll)}>
                              View Slip
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b' }}>No payroll record found for current user account.</p>
            </div>
          )}
        </div>
      ) : (
        /* ================= HR / ADMIN VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Total Monthly Gross</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value">₹{totalGross.toLocaleString('en-IN')}</span>
              </div>
              <span className="kpi-subtext neutral">Base payroll obligation</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Statutory Deductions</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#d97706' }}>₹{totalDeductions.toLocaleString('en-IN')}</span>
              </div>
              <span className="kpi-subtext warning">PF, PT & TDS withholding</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Net Disbursement</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#059669' }}>₹{totalNet.toLocaleString('en-IN')}</span>
              </div>
              <span className="kpi-subtext positive">Bank NEFT/RTGS ready</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Payroll Status</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#2563eb' }}>Processed</span>
              </div>
              <span className="kpi-subtext positive">October 2026 Cycle</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Salary Breakdown & Payslip Register</h2>
                <span className="card-subtitle">Detailed compensation structure per staff member</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Gross / Mo</th>
                      <th>Basic (50%)</th>
                      <th>HRA (40%)</th>
                      <th>Special Allow.</th>
                      <th>PF Withheld</th>
                      <th>Net Salary</th>
                      <th style={{ textAlign: 'right' }}>Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((p) => (
                      <tr key={p.empId}>
                        <td>
                          <div>
                            <div className="emp-name-text">{p.name}</div>
                            <div className="emp-code-sub">{p.empCode} · {p.role}</div>
                          </div>
                        </td>

                        <td>{p.dept}</td>
                        <td style={{ fontWeight: 600 }}>₹{p.monthlyGross?.toLocaleString('en-IN')}</td>
                        <td>₹{p.basic?.toLocaleString('en-IN')}</td>
                        <td>₹{p.hra?.toLocaleString('en-IN')}</td>
                        <td>₹{p.specialAllowance?.toLocaleString('en-IN')}</td>
                        <td style={{ color: '#dc2626' }}>-₹{p.pfDeduction?.toLocaleString('en-IN')}</td>
                        <td style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                          ₹{p.netSalary?.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setSelectedSlip(p)}
                          >
                            View Payslip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formal Payslip Modal (Used by both Employee and HR) */}
      {selectedSlip && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Payslip – October 2026</h2>
              <button className="modal-close-btn" onClick={() => setSelectedSlip(null)} aria-label="Close">✕</button>
            </div>

            <div className="modal-body" style={{ background: '#ffffff', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>HRMS</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Human Resource Management System</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>PAYSLIP: OCT 2026</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Generated on 09-10-2026</div>
                </div>
              </div>

              <div className="slip-grid-2" style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem' }}><strong>Employee Name:</strong> {selectedSlip.name}</div>
                <div style={{ fontSize: '0.85rem' }}><strong>Employee Code:</strong> {selectedSlip.empCode}</div>
                <div style={{ fontSize: '0.85rem' }}><strong>Department:</strong> {selectedSlip.dept}</div>
                <div style={{ fontSize: '0.85rem' }}><strong>Designation:</strong> {selectedSlip.role}</div>
              </div>

              <div className="slip-grid-2" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.5rem', color: '#059669' }}>
                    Earnings
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0' }}>
                    <span>Basic Salary</span>
                    <span>₹{selectedSlip.basic?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0' }}>
                    <span>House Rent Allowance</span>
                    <span>₹{selectedSlip.hra?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0' }}>
                    <span>Special Allowance</span>
                    <span>₹{selectedSlip.specialAllowance?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span>Total Earnings</span>
                    <span>₹{selectedSlip.monthlyGross?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.5rem', color: '#dc2626' }}>
                    Deductions
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0' }}>
                    <span>Provident Fund (PF)</span>
                    <span>₹{selectedSlip.pfDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0' }}>
                    <span>Professional Tax (PT)</span>
                    <span>₹{selectedSlip.ptDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.3rem 0' }}>
                    <span>Tax Deducted (TDS)</span>
                    <span>₹{selectedSlip.tdsDeduction?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span>Total Deductions</span>
                    <span>₹{selectedSlip.totalDeductions?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#065f46', fontSize: '1rem' }}>NET TAKE-HOME PAY:</span>
                <span style={{ fontWeight: 800, color: '#065f46', fontSize: '1.25rem' }}>₹{selectedSlip.netSalary?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSlip(null)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Print Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
