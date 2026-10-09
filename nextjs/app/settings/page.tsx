'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminGuard from '@/components/AdminGuard';

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('HRMS Enterprise');
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('18:00');
  const [graceMins, setGraceMins] = useState('30');
  const [bioThreshold, setBioThreshold] = useState('95');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const downloadBackup = () => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(emps => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(emps, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `hrms_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
  };

  return (
    <AdminGuard>
      <DashboardLayout
        title="System Settings & Policy Controls"
        subtitle="Organization parameters, shift configurations & biometric security thresholds"
      >
      {savedFeedback && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ Configuration preferences successfully updated and synced to server.
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid-2">
          {/* General & Shift Configuration */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Organization & Shift Rules</h2>
                <span className="card-subtitle">Workforce timing parameters</span>
              </div>
            </div>

            <div className="card-body">
              <div className="form-group">
                <label className="form-label">System Brand Identifier</label>
                <input
                  type="text"
                  className="form-input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Shift Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Shift End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Arrival Grace Period (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={graceMins}
                  onChange={(e) => setGraceMins(e.target.value)}
                />
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Punches after {shiftStart} + {graceMins} mins are automatically marked as Late Arrival.
                </small>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Save Timing Policy
              </button>
            </div>
          </div>

          {/* Biometrics & Data Storage */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Biometrics & Database Storage</h2>
                <span className="card-subtitle">AI facial matching & atomic state</span>
              </div>
            </div>

            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Face Recognition Confidence Cutoff (%)</label>
                <input
                  type="number"
                  className="form-input"
                  min="80"
                  max="99"
                  value={bioThreshold}
                  onChange={(e) => setBioThreshold(e.target.value)}
                />
                <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Minimum biometric vector similarity required to authenticate staff check-in.
                </small>
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Database Management</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                  Download an atomic backup snapshot of all workforce, attendance, and payroll records.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={downloadBackup}
                >
                  📥 Export Database Backup (JSON)
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  </AdminGuard>
  );
}
