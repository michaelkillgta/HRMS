'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [faceStrictness, setFaceStrictness] = useState('0.50');
  const [faceMode, setFaceMode] = useState('record');
  const [inTime, setInTime] = useState('09:30');
  const [outTime, setOutTime] = useState('18:30');
  const [gracePeriod, setGracePeriod] = useState('15');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">System Settings & Policies</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={handleSave}>
            Save All Changes
          </button>
        </div>
      </header>

      <div className="content">
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2>Facial Recognition & Biometric Settings</h2>
            </div>
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <div className="form-group">
                <label>Matching Mode</label>
                <select className="form-control" value={faceMode} onChange={(e) => setFaceMode(e.target.value)}>
                  <option value="record">Record Match Result (Allow punch, flag mismatch for HR)</option>
                  <option value="block">Strict Blocking (Reject punch if face does not match)</option>
                  <option value="off">Disabled (Take simple selfie without neural verification)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Strictness Threshold (Euclidean distance: {faceStrictness})</label>
                <input
                  type="range"
                  min="0.30"
                  max="0.70"
                  step="0.05"
                  value={faceStrictness}
                  onChange={(e) => setFaceStrictness(e.target.value)}
                  style={{ width: '100%' }}
                />
                <small style={{ color: 'var(--text-muted)' }}>Lower = stricter match required (fewer false positives).</small>
              </div>

              <div className="form-group">
                <label>Neural Network Models</label>
                <div className="dept-tag">Tiny Face Detector (416px) · 68 Landmarks · 128D Face Embeddings</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Office Hours & Grace Timing</h2>
            </div>
            <div className="card-body" style={{ padding: '1.25rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Official In-Time</label>
                  <input type="time" className="form-control" value={inTime} onChange={(e) => setInTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Official Out-Time</label>
                  <input type="time" className="form-control" value={outTime} onChange={(e) => setOutTime(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Late Grace Period (minutes)</label>
                <input type="number" className="form-control" value={gracePeriod} onChange={(e) => setGracePeriod(e.target.value)} />
                <small style={{ color: 'var(--text-muted)' }}>Arrivals up to {gracePeriod} mins after official start will not be marked late.</small>
              </div>

              <div className="form-group">
                <label>Working Week</label>
                <div className="dept-tag">Monday to Friday (Saturday alternating)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
