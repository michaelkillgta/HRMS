'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Avatar from '@/components/Avatar';
import { Employee, ResignationRecord } from '@/types';
import { useAuth } from '@/lib/AuthContext';

export default function ResignationsPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [resignations, setResignations] = useState<ResignationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [reason, setReason] = useState('Career advancement opportunity');
  const [noticeDays, setNoticeDays] = useState(30);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentEmp?.id) {
      setSelectedEmp(currentEmp.id);
    }
  }, [currentEmp]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, resRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/resignations')
      ]);

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(Array.isArray(empData) ? empData : []);
      }

      if (resRes.ok) {
        const resData = await resRes.json();
        setResignations(Array.isArray(resData) ? resData : []);
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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please state a reason for resignation');
      return;
    }

    try {
      setSubmitting(true);
      const targetEmpId = isEmployee ? (currentEmp?.id || currentUser?.empId) : selectedEmp;
      const today = new Date();
      const lwd = new Date(today);
      lwd.setDate(today.getDate() + Number(noticeDays));

      const res = await fetch('/api/resignations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: targetEmpId,
          reason: reason.trim(),
          noticePeriodDays: Number(noticeDays),
          expectedRelievingDate: lwd.toISOString().split('T')[0],
          handoverNotes: handoverNotes.trim()
        })
      });

      if (res.ok) {
        setModalOpen(false);
        setReason('');
        setHandoverNotes('');
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit resignation');
      }
    } catch {
      alert('Network error submitting resignation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    const actionWord = status === 'approved' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${actionWord} this resignation request?`)) return;

    try {
      const res = await fetch('/api/resignations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });

      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update resignation status');
      }
    } catch {
      alert('Network error updating status');
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-leave"><span className="badge-dot" /> Approved (Notice Active)</span>;
      case 'rejected':
        return <span className="badge badge-late"><span className="badge-dot" /> Withdrawn / Rejected</span>;
      case 'completed':
        return <span className="badge badge-present"><span className="badge-dot" /> Relieved & Settled</span>;
      default:
        return <span className="badge badge-amber"><span className="badge-dot" /> Pending HR Review</span>;
    }
  };

  return (
    <DashboardLayout
      title={isEmployee ? "My Resignation & Exit Clearance" : "Resignations & Exit Separation"}
      subtitle={
        isEmployee
          ? "Submit formal notice, track last working day (LWD), handover clearance & FnF settlement"
          : "Workforce separation pipelines, notice period compliance, handover sign-offs & FnF audits"
      }
      onRefreshData={loadData}
    >
      {isEmployee ? (
        /* ================= EMPLOYEE SELF-SERVICE VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Policy & Status Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Exit Status</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ fontSize: '1.25rem', color: resignations.length > 0 ? '#d97706' : '#059669' }}>
                  {resignations.length > 0 ? resignations[0].status.toUpperCase() : 'ACTIVE STAFF'}
                </span>
              </div>
              <span className="kpi-subtext neutral">
                {resignations.length > 0 ? 'Separation initiated' : 'Good standing in organization'}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Statutory Notice Period</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value">30 Days</span>
              </div>
              <span className="kpi-subtext neutral">Standard contractual term</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Knowledge Handover</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#2563eb' }}>
                  {resignations.length > 0 ? 'Assigned' : 'Not Required'}
                </span>
              </div>
              <span className="kpi-subtext positive">Mandatory for final clearance</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Full & Final Settlement</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#7c3aed' }}>
                  {resignations.length > 0 ? 'Pending LWD' : '—'}
                </span>
              </div>
              <span className="kpi-subtext neutral">Includes leave encashment & PF</span>
            </div>
          </div>

          {/* Active Resignation Tracker or Submission CTA */}
          {resignations.length > 0 ? (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">My Exit Request Dossier</h2>
                  <span className="card-subtitle">Active separation proceedings under review</span>
                </div>
                <div>{getStatusBadge(resignations[0].status)}</div>
              </div>

              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>SUBMISSION DATE</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{resignations[0].submittedDate}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>EXPECTED LAST WORKING DAY</span>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#dc2626', marginTop: '0.2rem' }}>
                      {resignations[0].expectedRelievingDate || 'Calculated on approval'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>NOTICE DURATION</span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{resignations[0].noticePeriodDays} Days</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>REVIEWED BY</span>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2563eb', marginTop: '0.2rem' }}>
                      {resignations[0].decidedBy || 'HR Leadership (In Review)'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Reason for Leaving</h4>
                  <div style={{ padding: '0.85rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.88rem', color: '#1e293b' }}>
                    {resignations[0].reason}
                  </div>
                </div>

                {resignations[0].handoverNotes && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Handover Plan & Knowledge Transfer</h4>
                    <div style={{ padding: '0.85rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.88rem', color: '#475569' }}>
                      {resignations[0].handoverNotes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem' }}>
                📋
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>No Active Resignation Filed</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                You are currently an active team member in good standing. If you wish to initiate a voluntary separation or career transition, you can submit your formal notice request below.
              </p>
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                + Initiate Resignation Notice
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ================= HR / ADMIN MANAGEMENT VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="filter-toolbar">
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Policy: Standard 30 days mandatory for staff. FnF settlement computed after asset recovery and final leave encashment audit.
            </span>

            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              + Initiate Exit Workflow
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Active Separation Cases ({resignations.length})</h2>
                <span className="card-subtitle">Formal employee offboarding pipelines & approval queue</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Submitted On</th>
                      <th>Expected LWD</th>
                      <th>Notice Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resignations.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                          No pending or processed employee resignations.
                        </td>
                      </tr>
                    ) : (
                      resignations.map((r) => {
                        const emp = employees.find(e => e.id === r.empId);
                        return (
                          <tr key={r.id}>
                            <td>
                              <div className="emp-row-user">
                                <Avatar avatar={emp?.avatar} name={emp?.name || r.empId} color={emp?.color} size={36} />
                                <div>
                                  <div className="emp-name-text">{emp?.name || r.empId}</div>
                                  <div className="emp-code-sub">{emp?.empCode} · {emp?.dept}</div>
                                </div>
                              </div>
                            </td>

                            <td style={{ fontSize: '0.85rem' }}>{r.submittedDate}</td>
                            <td style={{ fontWeight: 600, color: '#dc2626' }}>{r.expectedRelievingDate || '—'}</td>
                            <td>{r.noticePeriodDays} Days</td>
                            <td style={{ fontSize: '0.82rem', maxWidth: '220px' }}>{r.reason}</td>
                            <td>{getStatusBadge(r.status)}</td>
                            <td style={{ textAlign: 'right' }}>
                              {r.status === 'pending' ? (
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleReview(r.id, 'approved')}
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ color: '#dc2626' }}
                                    onClick={() => handleReview(r.id, 'rejected')}
                                  >
                                    ✕ Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {r.decidedBy ? `By ${r.decidedBy}` : 'Processed'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEmployee ? "Submit Formal Resignation" : "Initiate Employee Separation"}
              </h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                {!isEmployee && (
                  <div className="form-group">
                    <label className="form-label">Employee</label>
                    <select
                      className="form-select"
                      value={selectedEmp}
                      onChange={(e) => setSelectedEmp(e.target.value)}
                    >
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.empCode} - {e.name} ({e.dept})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Notice Period (Days)</label>
                  <select
                    className="form-select"
                    value={noticeDays}
                    onChange={(e) => setNoticeDays(Number(e.target.value))}
                  >
                    <option value={30}>30 Days (Standard Staff Policy)</option>
                    <option value={60}>60 Days (Leadership / Technical Lead)</option>
                    <option value={90}>90 Days (Executive Level)</option>
                    <option value={15}>15 Days (Probation Period Notice)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Formal Reason for Separation</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Provide detailed reason (e.g., career opportunity, higher education, personal relocation)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Handover Plan & Project Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Outline handover milestones, key project repositories, and suggested replacement colleagues..."
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Submitting..." : (isEmployee ? "Submit Resignation" : "Process Resignation")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
