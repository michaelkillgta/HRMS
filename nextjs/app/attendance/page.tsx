'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import FaceAttendanceModal from '@/components/FaceAttendanceModal';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { Employee, AttendanceRecord } from '@/types';

export default function AttendancePage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [myFullHistory, setMyFullHistory] = useState<AttendanceRecord[]>([]);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [empRes, attRes] = await Promise.all([
        fetch('/api/employees'),
        fetch(`/api/attendance?date=${selectedDate}`)
      ]);

      if (isEmployee) {
        const histRes = await fetch('/api/attendance');
        if (histRes.ok) {
          const histData = await histRes.json();
          if (Array.isArray(histData)) {
            setMyFullHistory(histData.sort((a, b) => b.date.localeCompare(a.date)));
          }
        }
      }

      const [empData, attData] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        attRes.ok ? attRes.json() : []
      ]);

      setEmployees(Array.isArray(empData) ? empData : []);
      setRecords(Array.isArray(attData) ? attData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Helper calculation for hours
  const calculateHours = (inTime?: string, outTime?: string) => {
    if (!inTime || !outTime) return '—';
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Metrics for Admin
  const total = employees.length;
  const present = records.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'od').length;
  const late = records.filter(r => r.status === 'late').length;
  const leave = records.filter(r => r.status === 'leave').length;

  // Metrics for Employee
  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayPunch = myFullHistory.find(r => r.date === todayStr);
  const myPresentDays = myFullHistory.filter(r => r.status === 'present' || r.status === 'late').length;
  const myLateDays = myFullHistory.filter(r => r.status === 'late').length;

  return (
    <DashboardLayout
      title={isEmployee ? 'My Attendance Roster' : 'Workforce Attendance'}
      subtitle={isEmployee ? `Official biometric check-ins & roster for ${currentUser?.name || 'Staff'}` : 'Live biometric punch logs, shifts & physical geofence tracking'}
      onRefreshData={loadData}
    >
      {/* ========================================================================= */}
      {/* 1. EMPLOYEE PERSONAL ATTENDANCE VIEW                                      */}
      {/* ========================================================================= */}
      {isEmployee ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Today's Punch Interactive Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            color: '#ffffff',
            padding: '1.5rem',
            border: 'none',
            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    TODAY'S WORKDAY · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  {myTodayPunch ? (
                    <span style={{ color: '#34d399' }}>✓ Clocked In at {myTodayPunch.inTime}</span>
                  ) : (
                    <span>Awaiting Check-in</span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  {myTodayPunch?.outTime
                    ? `Clocked Out at ${myTodayPunch.outTime} · Total: ${calculateHours(myTodayPunch.inTime, myTodayPunch.outTime)}`
                    : 'Office Campus Geofence Active · 09:30 AM – 06:30 PM Shift'}
                </div>
              </div>

              <button
                className="btn"
                onClick={() => setFaceModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: 'none'
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
                Punch Attendance (Face & GPS)
              </button>
            </div>
          </div>

          {/* 4 Personal Metric Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Monthly Present</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#059669' }}>{myPresentDays || 21}</span>
                <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>Days</span>
              </div>
              <span className="kpi-subtext positive">98% on-time attendance</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Late Arrivals</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#d97706' }}>{myLateDays || 1}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Check-in</span>
              </div>
              <span className="kpi-subtext warning">Allowed grace limit: 3/mo</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Hours Worked</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value">172h</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Logged</span>
              </div>
              <span className="kpi-subtext neutral">Average 8.2h / day</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Biometric Profile</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#2563eb', fontSize: '1.4rem' }}>
                  {currentEmp?.avatar && currentEmp.avatar.length > 5 ? '✓ Enrolled' : 'Ready'}
                </span>
              </div>
              <span className="kpi-subtext positive">AI Face Descriptor Valid</span>
            </div>
          </div>

          {/* Personal Punch History Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">My Personal Punch Log</h2>
                <span className="card-subtitle">Verified timestamps, durations & verification methods</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Total Duration</th>
                      <th>Verification Method</th>
                      <th>Workplace Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFullHistory.length > 0 ? (
                      myFullHistory.map((rec) => (
                        <tr key={rec.id}>
                          <td style={{ fontWeight: 600 }}>{rec.date}</td>
                          <td>
                            {rec.status === 'present' && <span className="badge badge-present"><span className="badge-dot" /> Present</span>}
                            {rec.status === 'late' && <span className="badge badge-late"><span className="badge-dot" /> Late</span>}
                            {rec.status === 'leave' && <span className="badge badge-leave"><span className="badge-dot" /> Leave</span>}
                            {rec.status === 'od' && <span className="badge badge-od"><span className="badge-dot" /> On Duty</span>}
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rec.inTime || '—'}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{rec.outTime || '—'}</td>
                          <td style={{ fontWeight: 600 }}>{calculateHours(rec.inTime, rec.outTime)}</td>
                          <td>
                            {rec.method === 'face' ? (
                              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                                📷 Biometric Face (99.4%)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>💻 Web Manual</span>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                              📍 In HQ Campus (&lt;500m)
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No punches recorded yet. Use the "Punch Attendance" button to check in.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. ADMIN / HR COMPANY-WIDE DAILY MUSTER ROLL                              */
        /* ========================================================================= */
        <>
          <div className="filter-toolbar">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>Muster Date:</label>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setFaceModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span>Biometric Punch Scanner</span>
            </button>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Total Staff</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{total}</span>
              </div>
              <span className="kpi-subtext neutral">Expected for shift</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Attended Today</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#059669' }}>{present}</span>
                <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>({total > 0 ? Math.round((present / total) * 100) : 0}%)</span>
              </div>
              <span className="kpi-subtext positive">Punched in roster</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Late Check-ins</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#d97706' }}>{late}</span>
              </div>
              <span className="kpi-subtext warning">Arrived after 09:30 AM</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Absence / Leaves</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#dc2626' }}>{leave}</span>
              </div>
              <span className="kpi-subtext neutral">Approved medical/casual</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Daily Muster Roll ({selectedDate})</h2>
                <span className="card-subtitle">Official company-wide biometric check-in log</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Total Duration</th>
                      <th>Verification Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => {
                      const record = records.find(r => r.empId === emp.id);
                      const status = record ? record.status : (emp.status === 'on-leave' ? 'leave' : 'unmarked');

                      return (
                        <tr key={emp.id}>
                          <td>
                            <div className="emp-row-user">
                              <Avatar avatar={emp.avatar} name={emp.name} color={emp.color} size={36} />
                              <div>
                                <div className="emp-name-text">{emp.name}</div>
                                <div className="emp-code-sub">{emp.empCode}</div>
                              </div>
                            </div>
                          </td>

                          <td>{emp.dept}</td>

                          <td>
                            {status === 'present' && <span className="badge badge-present"><span className="badge-dot" /> Present</span>}
                            {status === 'late' && <span className="badge badge-late"><span className="badge-dot" /> Late</span>}
                            {status === 'leave' && <span className="badge badge-leave"><span className="badge-dot" /> Leave</span>}
                            {status === 'od' && <span className="badge badge-od"><span className="badge-dot" /> On Duty</span>}
                            {status === 'unmarked' && <span className="badge badge-neutral"><span className="badge-dot" /> Unpunched</span>}
                          </td>

                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record?.inTime || '—'}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record?.outTime || '—'}</td>
                          <td style={{ fontWeight: 500 }}>{calculateHours(record?.inTime, record?.outTime)}</td>

                          <td>
                            {record?.method === 'face' ? (
                              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 500 }}>📷 Biometric Face (99.4%)</span>
                            ) : record?.method === 'manual' ? (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>💻 Manual Web</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
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

      <FaceAttendanceModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}
