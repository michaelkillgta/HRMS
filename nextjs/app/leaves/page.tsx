'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ApplyLeaveModal from '@/components/ApplyLeaveModal';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { Employee, LeaveRequest } from '@/types';

export default function LeavesPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [empRes, lvRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/leaves')
      ]);

      const [empData, lvData] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        lvRes.ok ? lvRes.json() : []
      ]);

      setEmployees(Array.isArray(empData) ? empData : []);
      setLeaves(Array.isArray(lvData) ? lvData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Admin approval / rejection
  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/leaves', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Review action failed');
      }
    } catch {
      alert('Network error');
    }
  };

  // Employee cancellation of own pending request
  const handleCancelLeave = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this pending leave requisition?')) return;
    try {
      const res = await fetch(`/api/leaves?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to cancel leave');
      }
    } catch {
      alert('Network error');
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pastLeaves = leaves.filter(l => l.status !== 'pending');

  return (
    <DashboardLayout
      title={isEmployee ? 'My Leave Portal' : 'Leave Management'}
      subtitle={isEmployee ? 'Statutory leave balances & personal leave requisitions' : 'Requisitions, approval workflow & statutory entitlement balances'}
      onRefreshData={loadData}
    >
      <div className="filter-toolbar">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isEmployee ? (
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Logged in: <strong style={{ color: '#0f172a' }}>{currentUser?.name}</strong> · ID: {currentEmp?.empCode || currentUser?.username}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Pending HR Actions: <strong style={{ color: pendingLeaves.length > 0 ? '#d97706' : '#059669' }}>{pendingLeaves.length} requests</strong>
            </span>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setApplyModalOpen(true)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Entitlement Cards */}
      <div className="grid-3">
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>CASUAL LEAVE (CL)</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>8 / 12 Remaining</span>
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" style={{ width: '66%', background: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>4 days utilized this fiscal year</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>SICK LEAVE (SL)</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>10 / 12 Remaining</span>
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" style={{ width: '83%', background: '#10b981' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Medical fitness certificate on &gt;2 consecutive days</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>EARNED LEAVE (EL)</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed' }}>15 / 15 Available</span>
          </div>
          <div className="kpi-progress">
            <div className="kpi-progress-bar" style={{ width: '100%', background: '#8b5cf6' }} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Encashable or carry forward up to 30 days</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EMPLOYEE VIEW: My Applications Table                                      */}
      {/* ========================================================================= */}
      {isEmployee ? (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <div className="card-header-left">
              <h2 className="card-title">My Leave Applications</h2>
              <span className="card-subtitle">Personal requisitions history & approval statuses</span>
            </div>
          </div>

          <div className="card-body flush">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Leave Category</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length > 0 ? (
                    leaves.map(lv => (
                      <tr key={lv.id}>
                        <td>
                          <span style={{ fontWeight: 600, color: '#2563eb' }}>{lv.type}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{lv.from}</td>
                        <td style={{ fontWeight: 500 }}>{lv.to}</td>
                        <td style={{ fontWeight: 600 }}>{lv.days} day(s)</td>
                        <td style={{ color: '#475569', maxWidth: '240px' }}>{lv.reason}</td>
                        <td>
                          {lv.status === 'pending' && <span className="badge badge-late"><span className="badge-dot" /> Pending Review</span>}
                          {lv.status === 'approved' && <span className="badge badge-present"><span className="badge-dot" /> Approved</span>}
                          {lv.status === 'rejected' && <span className="badge badge-leave"><span className="badge-dot" /> Rejected</span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {lv.status === 'pending' ? (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#dc2626', borderColor: '#fecaca', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                              onClick={() => handleCancelLeave(lv.id)}
                            >
                              ✕ Cancel
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        No leave requisitions found. Click "Apply for Leave" above to submit one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* ADMIN VIEW: Pending Approvals & Past History                              */
        /* ========================================================================= */
        <>
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Pending Staff Requisitions ({pendingLeaves.length})</h2>
                <span className="card-subtitle">Applications awaiting administrative review</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLeaves.length > 0 ? (
                      pendingLeaves.map(lv => {
                        const emp = employees.find(e => e.id === lv.empId);
                        return (
                          <tr key={lv.id}>
                            <td>
                              <div className="emp-row-user">
                                <Avatar avatar={emp?.avatar} name={emp?.name || lv.empId} color={emp?.color} size={36} />
                                <div>
                                  <div className="emp-name-text">{emp?.name || lv.empId}</div>
                                  <div className="emp-code-sub">{emp?.dept}</div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span style={{ fontWeight: 600, color: '#2563eb' }}>{lv.type}</span>
                            </td>

                            <td>{lv.from}</td>
                            <td>{lv.to}</td>
                            <td style={{ fontWeight: 600 }}>{lv.days} day(s)</td>
                            <td style={{ color: '#475569', maxWidth: '240px' }}>{lv.reason}</td>

                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                  onClick={() => handleReview(lv.id, 'approved')}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                                  onClick={() => handleReview(lv.id, 'rejected')}
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          ✓ All staff leave requests have been reviewed and processed!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Past Reviewed Leaves */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Processed Leave Archive</h2>
                <span className="card-subtitle">Historical records of approved and rejected requests</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastLeaves.map(lv => {
                      const emp = employees.find(e => e.id === lv.empId);
                      return (
                        <tr key={lv.id}>
                          <td>
                            <div className="emp-row-user">
                              <Avatar avatar={emp?.avatar} name={emp?.name || lv.empId} color={emp?.color} size={32} />
                              <div>
                                <div className="emp-name-text">{emp?.name || lv.empId}</div>
                                <div className="emp-code-sub">{emp?.empCode}</div>
                              </div>
                            </div>
                          </td>

                          <td>{lv.type}</td>
                          <td>{lv.from} to {lv.to}</td>
                          <td>{lv.days} day(s)</td>
                          <td>
                            {lv.status === 'approved' && <span className="badge badge-present"><span className="badge-dot" /> Approved</span>}
                            {lv.status === 'rejected' && <span className="badge badge-leave"><span className="badge-dot" /> Rejected</span>}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {lv.reviewedBy || 'HR Admin'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <ApplyLeaveModal
        isOpen={applyModalOpen}
        employees={isEmployee && currentEmp ? [currentEmp] : employees}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}
