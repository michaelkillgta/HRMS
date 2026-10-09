'use client';

import { useState, useEffect } from 'react';
import { Employee } from '../types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyLeaveModal({ isOpen, employees, onClose, onSuccess }: ApplyLeaveModalProps) {
  const [empId, setEmpId] = useState(employees[0]?.id || '');
  const [type, setType] = useState('Casual Leave');
  const [from, setFrom] = useState(new Date().toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employees.length > 0 && !empId) {
      setEmpId(employees[0].id);
    }
  }, [employees, empId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetEmp = empId || employees[0]?.id;
    if (!targetEmp) {
      setError('Employee selection required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empId: targetEmp,
          type,
          from,
          to,
          reason
        })
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to submit leave request');
      }
    } catch {
      setError('Network communication failed');
    } finally {
      setLoading(false);
    }
  };

  const isSingleEmployee = employees.length === 1;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">Apply for Leave</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.65rem', marginBottom: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Employee / Applicant *</label>
              {isSingleEmployee ? (
                <div style={{
                  padding: '0.6rem 0.85rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0f172a'
                }}>
                  👤 {employees[0].empCode} - {employees[0].name} ({employees[0].dept})
                </div>
              ) : (
                <select
                  className="form-select"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.empCode} - {e.name} ({e.dept})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Leave Category *</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Casual Leave">Casual Leave (CL) - 8 Remaining</option>
                <option value="Sick Leave">Sick Leave (SL) - 10 Remaining</option>
                <option value="Earned Leave">Earned / Privilege Leave (EL) - 15 Remaining</option>
                <option value="Maternity / Paternity">Maternity / Paternity Special Leave</option>
                <option value="Compensatory Off">Compensatory Off (Comp-Off)</option>
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Justification</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Brief reason for requisition..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
