'use client';

import { useState } from 'react';
import FaceAttendanceModal from '../components/FaceAttendanceModal';

export default function DashboardPage() {
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  const stats = [
    { title: 'Total Employees', value: '24', change: '+2 this month', type: 'up', color: 'blue' },
    { title: 'Present Today', value: '21', change: '87.5% attendance', type: 'up', color: 'green' },
    { title: 'On Leave', value: '3', change: '2 planned', type: 'down', color: 'amber' },
    { title: 'Pending Approvals', value: '5', change: '3 leaves, 2 OD', type: 'down', color: 'purple' },
  ];

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">HRMS Dashboard</h1>
        </div>
        <div className="topbar-right">
          <button
            className="btn btn-primary"
            onClick={() => setFaceModalOpen(true)}
          >
            📷 Face Check-In
          </button>
        </div>
      </header>

      <div className="content">
        <div className="stats-grid">
          {stats.map((s, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-info">
                <h3>{s.title}</h3>
                <div className="value">{s.value}</div>
                <div className={`change ${s.type}`}>{s.change}</div>
              </div>
              <div className={`stat-icon ${s.color}`}>
                <span style={{ fontSize: '1.4rem' }}>📈</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <h2>Quick HR Operations</h2>
            </div>
            <div className="actions-grid">
              <div className="action-card" onClick={() => setFaceModalOpen(true)}>
                <span>📷 Facial Attendance</span>
                <small>Punch attendance with biometric face verification</small>
              </div>
              <div className="action-card" onClick={() => window.location.href = '/employees'}>
                <span>👥 Add Employee</span>
                <small>Onboard new staff member</small>
              </div>
              <div className="action-card" onClick={() => window.location.href = '/attendance'}>
                <span>🕒 Attendance Logs</span>
                <small>View and reconcile today's clock-ins</small>
              </div>
              <div className="action-card" onClick={() => window.location.href = '/payroll'}>
                <span>💰 Run Payroll</span>
                <small>Process salaries and generate payslips</small>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent Activities</h2>
            </div>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div>
                  <div className="activity-text"><strong>Aisha Khan</strong> punched in with face match.</div>
                  <div className="activity-time">Today, 09:12 AM</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot blue"></div>
                <div>
                  <div className="activity-text"><strong>Rahul Sharma</strong> requested 2-day Casual Leave.</div>
                  <div className="activity-time">Today, 08:45 AM</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot amber"></div>
                <div>
                  <div className="activity-text">System initialized and data synced.</div>
                  <div className="activity-time">Yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FaceAttendanceModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onSuccess={() => alert('Attendance marked successfully!')}
      />
    </>
  );
}
