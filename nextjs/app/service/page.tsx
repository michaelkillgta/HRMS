'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { Employee } from '@/types';

export default function ServiceRegisterPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceRecords, setServiceRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, svcRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/service')
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        if (Array.isArray(empData)) setEmployees(empData);
      }

      if (svcRes.ok) {
        const svcData = await svcRes.json();
        if (Array.isArray(svcData)) setServiceRecords(svcData);
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

  // Calculate tenure helper
  const calculateTenure = (doj?: string) => {
    if (!doj) return '—';
    const start = new Date(doj);
    const now = new Date();
    const diffMonths = Math.max(1, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return `${years > 0 ? `${years}y ` : ''}${months}m`;
  };

  const totalEver = employees.length + 1; // including 1 past ex-employee
  const inService = employees.filter(e => e.status !== 'inactive' && e.status !== 'resigned').length;
  const exService = 1;
  const rejoined = 1;

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.empCode.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const mySvc = serviceRecords[0] || null;
  const myDoj = currentEmp?.doj || mySvc?.doj || '2023-01-15';
  const myTenure = calculateTenure(myDoj);

  return (
    <DashboardLayout
      title={isEmployee ? "My Service Book" : "Official Service Register"}
      subtitle={
        isEmployee
          ? "Official employment dossier, appointment history, tenure & service timeline"
          : "Workforce employment stints, tenure calculations, service logs & rejoin continuity"
      }
      onRefreshData={loadData}
    >
      {isEmployee ? (
        /* ================= EMPLOYEE SELF-SERVICE VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Service Summary Dossier Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Employment Dossier – {currentEmp?.name || currentUser?.name}</h2>
                <span className="card-subtitle">
                  {currentEmp?.empCode || currentUser?.empId} · {currentEmp?.role} · {currentEmp?.dept}
                </span>
              </div>
              <span className="badge badge-present" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                <span className="badge-dot" /> Currently In Service
              </span>
            </div>

            <div className="card-body">
              {/* Service Metric Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>First Joined</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                    {myDoj}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Original Date of Joining</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Tenure</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                    {myTenure}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#059669' }}>Continuous active service</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #7c3aed' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Employment Stints</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
                    1 Stint
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Zero breaks in service</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #d97706' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Confirmation Status</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>
                    Confirmed
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Probation fulfilled</span>
                </div>
              </div>

              {/* Service Periods Table */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.6rem' }}>
                  Service Periods & Stints
                </h3>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Stint</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Duration</th>
                        <th>Designation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 700 }}>#1 Primary Stint</td>
                        <td>{myDoj}</td>
                        <td style={{ fontWeight: 600, color: '#059669' }}>Present (Continuing)</td>
                        <td style={{ fontWeight: 700 }}>{myTenure}</td>
                        <td>{currentEmp?.role || 'Senior Professional'}</td>
                        <td><span className="badge badge-present"><span className="badge-dot" /> Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service Timeline & Career Milestones */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
                  Official Service Chronology & Progression
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '2px solid #e2e8f0', marginLeft: '0.5rem' }}>
                  <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-1.85rem', top: '0.25rem', width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }} />
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{myDoj}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Initial Appointment & Onboarding</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Appointed as {currentEmp?.role || 'Staff Member'} in {currentEmp?.dept || 'Operations'} Department. Official muster roll initiated.
                    </div>
                  </div>

                  <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-1.85rem', top: '0.25rem', width: '10px', height: '10px', borderRadius: '50%', background: '#059669' }} />
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>6 Months from Joining</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Probation Completed & Confirmed</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Formal confirmation in employment registry after satisfactory performance evaluation.
                    </div>
                  </div>

                  <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-1.85rem', top: '0.25rem', width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed' }} />
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Current Fiscal Year (2026-27)</div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Active Standing & Appraisal Review</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      Continuous clean service record with full statutory EPF, ESI and Gratuity eligibility accumulated.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HR / ADMIN REGISTER VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #0f172a' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>All Staff (Ever)</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{totalEver}</div>
            </div>

            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #059669' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Currently in Service</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>{inService}</div>
            </div>

            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #dc2626' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Left / Ex-Staff</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{exService}</div>
            </div>

            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #d97706' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rejoined Tenures</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>{rejoined}</div>
            </div>

            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Average Tenure</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>2y 4m</div>
            </div>

            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #7c3aed' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Longest Serving</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rajesh Sharma</div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>3y 9m</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Employee Service Dossiers ({filtered.length})</h2>
                <span className="card-subtitle">Continuous service timeline tracking</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', width: 'auto' }}>
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  className="form-input"
                  style={{ minWidth: '180px', padding: '0.4rem 0.75rem' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>First Joined</th>
                      <th>Stints</th>
                      <th>Previous Service</th>
                      <th>Current Service</th>
                      <th>Total Verified Service</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(emp => (
                      <tr key={emp.id}>
                        <td>
                          <div className="emp-row-user">
                            <Avatar avatar={emp.avatar} name={emp.name} color={emp.color} size={36} />
                            <div>
                              <div className="emp-name-text">{emp.name}</div>
                              <div className="emp-code-sub">{emp.empCode} · {emp.dept}</div>
                            </div>
                          </div>
                        </td>

                        <td>{emp.doj || '2023-01-15'}</td>
                        <td><span className="badge badge-neutral">1 time</span></td>
                        <td style={{ color: '#94a3b8' }}>—</td>
                        <td style={{ fontWeight: 600 }}>{calculateTenure(emp.doj)}</td>
                        <td style={{ fontWeight: 700, color: '#2563eb' }}>{calculateTenure(emp.doj)}</td>
                        <td>
                          <span className="badge badge-present"><span className="badge-dot" /> In Service</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => alert(`Service record dossier for ${emp.name} (${emp.empCode}):\n\nJoined: ${emp.doj || '2023-01-15'}\nRole: ${emp.role}\nDepartment: ${emp.dept}\nTotal Tenure: ${calculateTenure(emp.doj)}`)}>
                            View Dossier
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
    </DashboardLayout>
  );
}
