'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';

interface ModItem {
  key: string;
  name: string;
  desc: string;
}

const STAT_MODS: ModItem[] = [
  { key: 'bonus', name: 'Statutory Bonus', desc: 'Annual bonus for employees whose monthly wages are up to ₹21,000: 8.33% to 20% of wages, wage ceiling ₹7,000 or the minimum wage if higher.' },
  { key: 'ot', name: 'Overtime at Double Rate', desc: 'Overtime hours paid at twice the normal hourly rate of wages (Basic ÷ 30 ÷ daily hours × 2) and added to monthly compensation.' },
  { key: 'minwage', name: 'Minimum-Wage Compliance', desc: 'Flags employees paid below the statutory minimum wage notifications issued by the Labour Department.' },
  { key: 'encash', name: 'Leave Encashment', desc: 'Pays accrued privilege / earned leave balance in cash at Basic ÷ 30 per day, credited during chosen payroll month.' },
  { key: 'fnf', name: 'Full & Final Settlement (FnF)', desc: 'Exit statement generation: leave encashment, gratuity (5+ years statutory), notice pay recovery, and final TDS adjustment.' },
  { key: 'arrears', name: 'Salary Arrears Revision', desc: 'Back-dated pay revision difference calculation for previously finalized payroll months with statutory PF / ESI recalculation.' },
  { key: 'f12bb', name: 'Form 124 / 12BB Tax Declarations', desc: 'Employee investment declarations: HRA rent receipts, 80C investments, health insurance, and home loan interest for TDS regime.' },
  { key: 'registers', name: 'Statutory Registers & Muster Roll', desc: 'Muster roll attendance registers (Form II / V) and monthly statutory wage registers, exportable in compliance format.' },
  { key: 'tds', name: 'Form 16 / 130 and 24Q / 138 TDS Certificates', desc: 'Annual salary TDS certificates (Part A & B) and quarterly filing sheets for Income Tax Department filing.' }
];

export default function StatutoryModulesPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [mods, setMods] = useState<Record<string, { on: boolean; by?: string; at?: string }>>({});
  const [activeTab, setActiveTab] = useState('overview');

  // Employee Tax Declaration state
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [sec80C, setSec80C] = useState('150000');
  const [sec80D, setSec80D] = useState('25000');
  const [hraRent, setHraRent] = useState('180000');
  const [declSubmitted, setDeclSubmitted] = useState(false);

  // Admin state
  const [arrearsEmp, setArrearsEmp] = useState('EMP001');
  const [oldCtc, setOldCtc] = useState('600000');
  const [newCtc, setNewCtc] = useState('720000');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const modRes = await fetch('/api/statmods');

      if (modRes.ok) {
        const data = await modRes.json();
        setMods(data);
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

  const toggleModule = async (key: string, currentOn: boolean) => {
    try {
      const res = await fetch('/api/statmods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, on: !currentOn })
      });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update module state');
      }
    } catch {
      alert('Network communication error');
    }
  };

  const handleSaveDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    setDeclSubmitted(true);
    alert('Form 124 / 12BB Tax Investment Declaration submitted successfully to HR Payroll for FY 2026-27!');
  };

  // Arrears difference
  const arrearsDiff = Math.max(0, Math.round(((Number(newCtc) - Number(oldCtc)) / 12) * 3));
  const arrearsPf = Math.round(arrearsDiff * 0.12 * 0.5);

  return (
    <DashboardLayout
      title={isEmployee ? "My Statutory Statements & Tax Declarations" : "Statutory Modules & Labour Law Compliance"}
      subtitle={
        isEmployee
          ? "Form 16 TDS certificates, Form 124 / 12BB investment declarations, EPF and ESI records"
          : "Telangana & Central Labour Acts, EPF, ESI, Minimum Wages & Form 16 / 124"
      }
      onRefreshData={loadData}
    >
      {isEmployee ? (
        /* ================= EMPLOYEE SELF-SERVICE VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Statutory Status Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">EPF Universal Account (UAN)</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ fontSize: '1.2rem', color: '#2563eb' }}>101988273641</span>
              </div>
              <span className="kpi-subtext positive">12% Monthly Employee Withholding</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Income Tax Regime</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ fontSize: '1.2rem', color: '#059669' }}>
                  {taxRegime === 'new' ? 'New (Sec 115BAC)' : 'Old Regime'}
                </span>
              </div>
              <span className="kpi-subtext neutral">FY 2026-27 Active Selection</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Form 16 TDS Certificate</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ fontSize: '1.2rem', color: '#7c3aed' }}>Available</span>
              </div>
              <span className="kpi-subtext positive">FY 2025-26 Digitally Signed</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">ESI Coverage Status</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ fontSize: '1.2rem' }}>Exempt</span>
              </div>
              <span className="kpi-subtext neutral">Salary &gt; ₹21,000 threshold</span>
            </div>
          </div>

          {/* Form 124 / 12BB Tax Declaration Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Form 124 / 12BB – Annual Investment Declaration (FY 2026-27)</h2>
                <span className="card-subtitle">Declare eligible deductions for monthly TDS payroll computation</span>
              </div>
              {declSubmitted && (
                <span className="badge badge-present"><span className="badge-dot" /> Declaration Submitted</span>
              )}
            </div>

            <div className="card-body">
              <form onSubmit={handleSaveDeclaration}>
                <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Select Income Tax Regime</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="regime"
                        checked={taxRegime === 'new'}
                        onChange={() => setTaxRegime('new')}
                      />
                      <span><strong>New Tax Regime (Default)</strong> – Lower tax slabs, standard deduction ₹75,000</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="regime"
                        checked={taxRegime === 'old'}
                        onChange={() => setTaxRegime('old')}
                      />
                      <span><strong>Old Tax Regime</strong> – Itemized 80C, 80D, HRA & home loan deductions</span>
                    </label>
                  </div>
                </div>

                {taxRegime === 'old' && (
                  <div className="form-grid-2" style={{ marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Section 80C Deductions (Max ₹1,50,000)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={sec80C}
                        onChange={e => setSec80C(e.target.value)}
                        placeholder="PPF, ELSS, Life Insurance, EPF"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Section 80D Health Insurance (Max ₹25,000)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={sec80D}
                        onChange={e => setSec80D(e.target.value)}
                        placeholder="Mediclaim premium receipts"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Annual Rent Paid for HRA Exemption (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={hraRent}
                        onChange={e => setHraRent(e.target.value)}
                        placeholder="Annual residential rent paid"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Section 24 Home Loan Interest (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        defaultValue="0"
                        placeholder="Max ₹2,00,000 for self-occupied"
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary">
                  💾 Submit / Update Declaration
                </button>
              </form>
            </div>
          </div>

          {/* Form 16 & Tax Certificates Section */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Salary TDS Certificates & Working Statements</h2>
                <span className="card-subtitle">Form 16 (Part A & Part B) as required under Section 203 of Income-tax Act</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assessment Year</th>
                      <th>Financial Year</th>
                      <th>Gross Salary Paid</th>
                      <th>Total TDS Deducted</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Certificate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>AY 2026-27</strong></td>
                      <td>FY 2025-26</td>
                      <td>₹{((currentEmp?.salary || 50000) * 12).toLocaleString('en-IN')}</td>
                      <td>₹12,480</td>
                      <td><span className="badge badge-present"><span className="badge-dot" /> TRACES Signed</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => alert(`Downloading Form 16 Part A & B for ${currentEmp?.name || 'Staff'} (FY 2025-26)...`)}
                        >
                          📄 Download Form 16
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>AY 2027-28</strong></td>
                      <td>FY 2026-27 (Current)</td>
                      <td>₹{((currentEmp?.salary || 50000) * 7).toLocaleString('en-IN')} (YTD)</td>
                      <td>₹7,280 (YTD)</td>
                      <td><span className="badge badge-leave"><span className="badge-dot" /> Provisional</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => alert(`Opening Provisional Tax Computation sheet for FY 2026-27...`)}
                        >
                          View Computation
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HR / ADMIN MANAGEMENT VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="filter-toolbar">
            <div className="tab-filter-pills">
              <button className={`tab-filter-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                Module Switches (9)
              </button>
              <button className={`tab-filter-btn ${activeTab === 'arrears' ? 'active' : ''}`} onClick={() => setActiveTab('arrears')}>
                Salary Arrears Calculator
              </button>
              <button className={`tab-filter-btn ${activeTab === 'bonus' ? 'active' : ''}`} onClick={() => setActiveTab('bonus')}>
                Statutory Bonus (8.33%)
              </button>
              <button className={`tab-filter-btn ${activeTab === 'fnf' ? 'active' : ''}`} onClick={() => setActiveTab('fnf')}>
                FnF Settlement Ledger
              </button>
            </div>

            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Updated for FY 2026-27 Statutory Guidelines (EPF ceiling ₹25,000 / ESI ₹21,000)
            </span>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="card-body" style={{ padding: '1rem 1.25rem', lineHeight: '1.7', fontSize: '0.88rem', color: '#475569' }}>
                  Every statutory compliance module remains strictly disabled until an authorized administrator activates it with their credentials. While disabled, no statutory withholdings or formulas alter payroll runs. Once activated, automated calculations apply to payroll generation and compliant registers.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {STAT_MODS.map(m => {
                  const status = mods[m.key] || { on: false };
                  return (
                    <div key={m.key} className="card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{m.name}</strong>
                          <span className={`badge ${status.on ? 'badge-present' : 'badge-neutral'}`}>
                            <span className="badge-dot" /> {status.on ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.55', marginBottom: '1rem' }}>
                          {m.desc}
                        </p>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                          {status.on
                            ? `Activated by ${status.by || 'Admin'} on ${status.at ? status.at.slice(0, 10) : '2026-10-01'}`
                            : 'Standby mode (Not affecting active payroll)'}
                        </div>
                        <button
                          className={`btn btn-sm ${status.on ? 'btn-danger' : 'btn-primary'}`}
                          style={{ width: '100%' }}
                          onClick={() => toggleModule(m.key, status.on)}
                        >
                          {status.on ? 'Revoke Module' : '⚡ Activate Compliance'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'arrears' && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Back-Dated Salary Arrears Calculator</h2>
                  <span className="card-subtitle">Calculates gross difference, PF/ESI adjustments across historical months</span>
                </div>
              </div>
              <div className="card-body">
                <div className="form-grid-2" style={{ marginBottom: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Employee</label>
                    <input className="form-input" value={arrearsEmp} onChange={e => setArrearsEmp(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Past Annual CTC (₹)</label>
                    <input type="number" className="form-input" value={oldCtc} onChange={e => setOldCtc(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Revised Annual CTC (₹)</label>
                    <input type="number" className="form-input" value={newCtc} onChange={e => setNewCtc(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Effective Retroactive Period</label>
                    <div style={{ padding: '0.6rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                      3 Months (July 2026 – September 2026)
                    </div>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#1e40af' }}>Monthly Increment Difference:</span>
                    <strong>₹{Math.round((Number(newCtc) - Number(oldCtc)) / 12).toLocaleString('en-IN')} / mo</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', color: '#1e40af' }}>Gross Arrears Payout (3 Months):</span>
                    <strong style={{ fontSize: '1.1rem', color: '#1d4ed8' }}>₹{arrearsDiff.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed #93c5fd' }}>
                    <span style={{ fontSize: '0.85rem', color: '#1e40af' }}>Estimated Employee PF Deduction on Arrears:</span>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>-₹{arrearsPf.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => alert(`Added ₹${arrearsDiff.toLocaleString('en-IN')} arrears to October 2026 payroll run!`)}>
                  Post Arrears to Current Payroll Run
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bonus' && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Payment of Bonus Act (Statutory Schedule)</h2>
                  <span className="card-subtitle">8.33% minimum statutory annual bonus register</span>
                </div>
              </div>
              <div className="card-body flush">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee Code</th>
                        <th>Basic Wages / Mo</th>
                        <th>Annual Basic</th>
                        <th>Statutory Rate</th>
                        <th>Calculated Bonus</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>EMP001 · Rajesh Sharma</td>
                        <td>₹42,500</td>
                        <td>₹5,10,000</td>
                        <td>8.33%</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>₹7,000 (Wage Cap Applied)</td>
                        <td><span className="badge badge-present">Eligible</span></td>
                      </tr>
                      <tr>
                        <td>EMP002 · Priya Patel</td>
                        <td>₹37,500</td>
                        <td>₹4,50,000</td>
                        <td>8.33%</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>₹7,000 (Wage Cap Applied)</td>
                        <td><span className="badge badge-present">Eligible</span></td>
                      </tr>
                      <tr>
                        <td>EMP003 · Amit Verma</td>
                        <td>₹32,500</td>
                        <td>₹3,90,000</td>
                        <td>8.33%</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>₹7,000 (Wage Cap Applied)</td>
                        <td><span className="badge badge-present">Eligible</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fnf' && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Full and Final (FnF) Settlement Clearances</h2>
                  <span className="card-subtitle">Separated employee statutory dues & gratuity accounts</span>
                </div>
              </div>
              <div className="card-body flush">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Staff Name</th>
                        <th>Separation Date</th>
                        <th>Leave Encashment</th>
                        <th>Gratuity (5+ yrs)</th>
                        <th>Notice Recovery</th>
                        <th>Net Settlement</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>EMP008 · Pooja Nair</td>
                        <td>2026-10-15</td>
                        <td>₹18,450 (9 days)</td>
                        <td>₹0 (Tenure &lt; 5y)</td>
                        <td>₹0 (Served notice)</td>
                        <td style={{ fontWeight: 700, color: '#059669' }}>₹68,450</td>
                        <td><button className="btn btn-sm btn-primary" onClick={() => alert('FnF settlement voucher generated')}>Print Statement</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
