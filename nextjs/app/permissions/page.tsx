'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { Employee, PermissionRecord } from '@/types';

export default function PermissionsPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [type, setType] = useState<'permission' | 'od'>('permission');
  const [hours, setHours] = useState('2');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, permRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/permissions')
      ]);

      const [empData, permData] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        permRes.ok ? permRes.json() : []
      ]);

      setEmployees(Array.isArray(empData) ? empData : []);
      setPermissions(Array.isArray(permData) ? permData : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmpId = isEmployee ? currentUser?.empId : (selectedEmp || employees[0]?.id);

    try {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: targetEmpId,
          type,
          hours: Number(hours),
          fromTime: '14:00',
          toTime: `${14 + Number(hours)}:00`,
          reason,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setReason('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit request');
      }
    } catch {
      alert('Network failure');
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
      }
    } catch {
      alert('Network error');
    }
  };

  const myApprovedHours = permissions
    .filter(p => p.status === 'approved' && p.type !== 'od')
    .reduce((sum, p) => sum + p.hours, 0);

  return (
    <DashboardLayout
      title={isEmployee ? 'My Permissions & OD' : 'Permissions & Outdoor Duty (OD)'}
      subtitle={isEmployee ? 'Short duration leaves, client visits & movement tracking' : 'Requisitions, official duty tracking & monthly hour quotas'}
      onRefreshData={loadData}
    >
      <div className="filter-toolbar">
        <div>
          {isEmployee ? (
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Logged in: <strong style={{ color: '#0f172a' }}>{currentUser?.name}</strong> · ID: {currentEmp?.empCode || currentUser?.username}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Monthly Policy: <strong>Maximum 4 hours permission per employee / month</strong>
            </span>
          )}
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Request Permission / OD
        </button>
      </div>

      {/* Quota Highlights */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>MONTHLY PERMISSION QUOTA</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
              {isEmployee ? `${myApprovedHours} / 4 Hours` : '4 Hours / Employee'}
            </span>
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" style={{ width: `${(myApprovedHours / 4) * 100}%`, background: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
            {isEmployee ? `${Math.max(0, 4 - myApprovedHours)} hours balance available` : 'Permitted for personal doctor, banking or family work'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>OUTDOOR DUTY (OD)</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>Unlimited</span>
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" style={{ width: '100%', background: '#10b981' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Full day credited on client audits & site visits</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>APPROVAL TIMELINE</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed' }}>&lt; 2 Hours SLA</span>
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" style={{ width: '90%', background: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Automated HR alert and manager authorization</div>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <h2 className="card-title">{isEmployee ? 'My Permissions & OD Records' : 'Staff Permission & OD Roster'}</h2>
            <span className="card-subtitle">Official movements and authorizations log</span>
          </div>
        </div>

        <div className="card-body flush">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {!isEmployee && <th>Employee</th>}
                  <th>Type</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Window</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {!isEmployee && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {permissions.length > 0 ? (
                  permissions.map((p) => {
                    const emp = employees.find(e => e.id === p.empId);
                    return (
                      <tr key={p.id}>
                        {!isEmployee && (
                          <td>
                            <div className="emp-row-user">
                              <Avatar avatar={emp?.avatar} name={emp?.name || p.empId} color={emp?.color} size={36} />
                              <div>
                                <div className="emp-name-text">{emp?.name || p.empId}</div>
                                <div className="emp-code-sub">{emp?.dept}</div>
                              </div>
                            </div>
                          </td>
                        )}

                        <td>
                          <span style={{
                            fontWeight: 600,
                            color: p.type === 'od' ? '#059669' : '#2563eb',
                            background: p.type === 'od' ? '#ecfdf5' : '#eff6ff',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.78rem'
                          }}>
                            {p.type === 'od' ? '📍 Outdoor Duty' : '⏱️ Permission'}
                          </span>
                        </td>

                        <td>{p.date}</td>
                        <td style={{ fontWeight: 600 }}>{p.hours} Hour(s)</td>
                        <td style={{ fontFamily: 'monospace' }}>{p.fromTime} – {p.toTime}</td>
                        <td style={{ color: '#475569', maxWidth: '240px' }}>{p.reason}</td>

                        <td>
                          {p.status === 'approved' && <span className="badge badge-present"><span className="badge-dot" /> Approved</span>}
                          {p.status === 'pending' && <span className="badge badge-late"><span className="badge-dot" /> Pending</span>}
                          {p.status === 'rejected' && <span className="badge badge-leave"><span className="badge-dot" /> Rejected</span>}
                        </td>

                        {!isEmployee && (
                          <td style={{ textAlign: 'right' }}>
                            {p.status === 'pending' ? (
                              <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                  onClick={() => handleReview(p.id, 'approved')}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                                  onClick={() => handleReview(p.id, 'rejected')}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {p.decidedBy || 'HR Admin'}
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isEmployee ? 6 : 8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                      No permission requests recorded yet. Click "+ Request Permission / OD" above to submit one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">Request Permission / Outdoor Duty</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleApply}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Applicant</label>
                  {isEmployee ? (
                    <div style={{ padding: '0.6rem 0.85rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                      👤 {currentEmp?.empCode || currentUser?.username} - {currentUser?.name}
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={selectedEmp}
                      onChange={(e) => setSelectedEmp(e.target.value)}
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.empCode} - {e.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Request Type</label>
                    <select
                      className="form-select"
                      value={type}
                      onChange={(e: any) => setType(e.target.value)}
                    >
                      <option value="permission">Personal Permission (Max 4h/mo)</option>
                      <option value="od">Outdoor Duty (Client / Official Visit)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (Hours)</label>
                    <select
                      className="form-select"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="3">3 Hours</option>
                      <option value="4">4 Hours (Half Day)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Destination</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide justification or client visit location..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
