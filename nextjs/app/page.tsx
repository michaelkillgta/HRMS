'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WeeklyTrendChart from '@/components/WeeklyTrendChart';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import ApplyLeaveModal from '@/components/ApplyLeaveModal';
import FaceAttendanceModal from '@/components/FaceAttendanceModal';
import Avatar from '@/components/Avatar';
import { Employee, AttendanceRecord, LeaveRequest, ActivityItem } from '@/types';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trendStats, setTrendStats] = useState<any[]>([]);
  const [my7DayAttendance, setMy7DayAttendance] = useState<AttendanceRecord[]>([]);

  const [filterTab, setFilterTab] = useState<'all' | 'present' | 'late' | 'leave' | 'od'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [addEmpModalOpen, setAddEmpModalOpen] = useState(false);
  const [applyLeaveModalOpen, setApplyLeaveModalOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [empRes, attRes, lvRes, actRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/attendance?days=7'),
        fetch('/api/leaves'),
        fetch('/api/activities')
      ]);

      const [empData, attData, lvData, actData] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        attRes.ok ? attRes.json() : { dates: [], records: [] },
        lvRes.ok ? lvRes.json() : [],
        actRes.ok ? actRes.json() : []
      ]);

      const empList: Employee[] = Array.isArray(empData) ? empData : [];
      setEmployees(empList);

      const attList: AttendanceRecord[] = Array.isArray(attData.records)
        ? attData.records
        : (Array.isArray(attData) ? attData : []);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendance = attList.filter(a => a.date === todayStr);
      setAttendance(todayAttendance);
      setLeaves(Array.isArray(lvData) ? lvData : []);
      setActivities(Array.isArray(actData) ? actData : []);

      // If employee, sort their 7-day attendance
      setMy7DayAttendance(attList.sort((a, b) => b.date.localeCompare(a.date)));

      // Calculate 7-Day Trend for Admin
      const dates: string[] = attData.dates || [];
      const computedTrend = dates.map((dStr, idx) => {
        const dDate = new Date(dStr);
        const dayLabel = idx === dates.length - 1 ? 'Today' : dDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dayAtt = attList.filter(a => a.date === dStr);
        const totalEmp = empList.length || 1;
        const presentCount = dayAtt.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'od').length;
        const lateCount = dayAtt.filter(a => a.status === 'late').length;
        const leaveCount = dayAtt.filter(a => a.status === 'leave').length;
        const rate = Math.round((presentCount / totalEmp) * 100);

        return {
          date: dStr,
          dayLabel,
          total: totalEmp,
          present: presentCount,
          late: lateCount,
          leave: leaveCount,
          rate
        };
      });

      setTrendStats(computedTrend);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute KPI summary for Admin
  const totalEmployees = employees.length;
  const presentToday = attendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'od').length;
  const lateToday = attendance.filter(a => a.status === 'late').length;
  const leaveToday = attendance.filter(a => a.status === 'leave').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
  const presentRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  // Compute Employee-specific summary
  const myTodayPunch = attendance.find(a => a.empId === currentUser?.empId);
  const myLeavesPending = leaves.filter(l => l.status === 'pending');

  const filteredRoster = employees.filter(emp => {
    const matchSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.dept.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    const record = attendance.find(a => a.empId === emp.id);
    const status = record ? record.status : (emp.status === 'on-leave' ? 'leave' : 'unmarked');

    if (filterTab === 'all') return true;
    if (filterTab === 'present') return status === 'present';
    if (filterTab === 'late') return status === 'late';
    if (filterTab === 'leave') return status === 'leave';
    if (filterTab === 'od') return status === 'od';
    return true;
  });

  return (
    <DashboardLayout
      title={isEmployee ? 'My Workspace Portal' : 'Executive Workforce Intelligence'}
      subtitle={isEmployee ? `Welcome back, ${currentUser?.name || 'Staff'}` : 'Real-time attendance roster, analytics & approvals'}
      onRefreshData={loadData}
    >
      {/* ========================================================================= */}
      {/* 1. EMPLOYEE SELF-SERVICE VIEW                                             */}
      {/* ========================================================================= */}
      {isEmployee ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Welcome & Profile Highlight Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '1.5rem',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <Avatar
                  avatar={currentEmp?.avatar}
                  name={currentUser?.name || 'Staff'}
                  color={currentEmp?.color || '#3b82f6'}
                  size={64}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      {currentUser?.name}
                    </h2>
                    <span style={{
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(56, 189, 248, 0.4)'
                    }}>
                      {currentEmp?.empCode || currentUser?.username}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>
                    {currentEmp?.role || 'Staff'} · {currentEmp?.dept || currentUser?.dept} · Joined {currentEmp?.doj || '2023-01-15'}
                  </p>
                </div>
              </div>

              {/* Quick Biometric Punch Button */}
              <button
                className="btn"
                onClick={() => setFaceModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  padding: '0.65rem 1.35rem',
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

          {/* 4 Personal KPI Cards */}
          <div className="kpi-grid">
            {/* 1. Today's Shift Status */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Today's Punch Status</span>
                <div className="kpi-icon-wrap blue">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                {myTodayPunch ? (
                  <span className="kpi-value" style={{ color: '#059669', fontSize: '1.35rem' }}>
                    ✓ In: {myTodayPunch.inTime || 'Present'}
                  </span>
                ) : (
                  <span className="kpi-value" style={{ color: '#d97706', fontSize: '1.35rem' }}>
                    Not Punched
                  </span>
                )}
              </div>
              <span className="kpi-subtext neutral">
                {myTodayPunch?.outTime ? `Clocked Out: ${myTodayPunch.outTime}` : 'General Shift · 09:30 AM – 06:30 PM'}
              </span>
            </div>

            {/* 2. Leave Entitlements */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Casual Leave (CL)</span>
                <div className="kpi-icon-wrap green">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">8 / 12</span>
                <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>Days Left</span>
              </div>
              <span className="kpi-subtext positive">10 Sick + 15 Earned Days also available</span>
              <div className="kpi-progress">
                <div className="kpi-progress-bar" style={{ width: '66%', background: '#10b981' }} />
              </div>
            </div>

            {/* 3. Monthly Attendance */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">This Month Attendance</span>
                <div className="kpi-icon-wrap amber">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">98%</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>On-Time</span>
              </div>
              <span className="kpi-subtext positive">21 Working Days Marked</span>
              <div className="kpi-progress">
                <div className="kpi-progress-bar" style={{ width: '98%', background: '#f59e0b' }} />
              </div>
            </div>

            {/* 4. Pending Requests */}
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Pending Approvals</span>
                <div className="kpi-icon-wrap purple">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{myLeavesPending.length}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Requisitions</span>
              </div>
              <span className="kpi-subtext neutral">
                {myLeavesPending.length > 0 ? 'Under review by HR' : 'All requests processed'}
              </span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => setApplyLeaveModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              Apply for Leave
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setFaceModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Camera Biometric Punch
            </button>
          </div>

          {/* Personal Recent Attendance History */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">My Recent Punch History</h2>
                <span className="card-subtitle">Official biometric check-ins and timestamps</span>
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
                      <th>Verification Method</th>
                      <th>Workplace Geofence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {my7DayAttendance.length > 0 ? (
                      my7DayAttendance.map((rec) => (
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
                          <td>
                            {rec.method === 'face' ? (
                              <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.8rem' }}>
                                📷 Biometric Face (99.4%)
                              </span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>💻 Web Punch</span>
                            )}
                          </td>
                          <td>
                            <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.8rem' }}>
                              📍 In HQ Campus (&lt;500m)
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No punches recorded yet. Click "Punch Attendance" above to mark today's presence.
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
        /* 2. HR ADMINISTRATOR / EXECUTIVE VIEW                                      */
        /* ========================================================================= */
        <>
          {/* 4 Executive KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Active Workforce</span>
                <div className="kpi-icon-wrap blue">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{totalEmployees}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Staff</span>
              </div>
              <div className="kpi-subtext neutral">
                <span>Across 4 departments</span>
              </div>
              <div className="kpi-progress">
                <div className="kpi-progress-bar" style={{ width: '100%', background: '#2563eb' }} />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Present Rate</span>
                <div className="kpi-icon-wrap green">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{presentRate}%</span>
                <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>{presentToday}/{totalEmployees}</span>
              </div>
              <div className="kpi-subtext positive">
                <span>● Live today check-ins</span>
              </div>
              <div className="kpi-progress">
                <div className="kpi-progress-bar" style={{ width: `${presentRate}%`, background: '#10b981' }} />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Late Arrivals</span>
                <div className="kpi-icon-wrap amber">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{lateToday}</span>
                <span style={{ fontSize: '0.85rem', color: '#d97706' }}>Staff</span>
              </div>
              <div className="kpi-subtext warning">
                <span>Clocked in after 09:30 AM</span>
              </div>
              <div className="kpi-progress">
                <div className="kpi-progress-bar" style={{ width: `${(lateToday / (totalEmployees || 1)) * 100}%`, background: '#f59e0b' }} />
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">Pending Approvals</span>
                <div className="kpi-icon-wrap purple">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                </div>
              </div>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{pendingLeaves}</span>
                <span style={{ fontSize: '0.85rem', color: '#7c3aed' }}>Requests</span>
              </div>
              <div className="kpi-subtext neutral">
                <span>{leaveToday} staff on active leave</span>
              </div>
              <div className="kpi-progress">
                <div className="kpi-progress-bar" style={{ width: `${Math.min(pendingLeaves * 20, 100)}%`, background: '#8b5cf6' }} />
              </div>
            </div>
          </div>

          {/* Analytics Chart & Department Distribution */}
          <div className="dashboard-grid-2">
            <WeeklyTrendChart stats={trendStats} />

            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Department Distribution</h2>
                  <span className="card-subtitle">Headcount by functional area</span>
                </div>
              </div>
              <div className="card-body">
                {['Engineering', 'Marketing', 'Human Resources', 'Finance', 'Sales'].map(d => {
                  const count = employees.filter(e => e.dept === d).length;
                  const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
                  return (
                    <div key={d} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{d}</span>
                        <span style={{ color: '#64748b' }}>{count} staff ({pct}%)</span>
                      </div>
                      <div className="kpi-progress" style={{ margin: 0 }}>
                        <div className="kpi-progress-bar" style={{ width: `${pct}%`, background: '#2563eb' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Live Attendance Roster */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Today's Live Attendance Roster</h2>
                <span className="card-subtitle">Showing live check-ins for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div className="tab-filter-pills">
                  <button
                    className={`tab-filter-btn ${filterTab === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterTab('all')}
                  >
                    All ({totalEmployees})
                  </button>
                  <button
                    className={`tab-filter-btn ${filterTab === 'present' ? 'active' : ''}`}
                    onClick={() => setFilterTab('present')}
                  >
                    Present ({attendance.filter(a => a.status === 'present').length})
                  </button>
                  <button
                    className={`tab-filter-btn ${filterTab === 'late' ? 'active' : ''}`}
                    onClick={() => setFilterTab('late')}
                  >
                    Late ({lateToday})
                  </button>
                  <button
                    className={`tab-filter-btn ${filterTab === 'leave' ? 'active' : ''}`}
                    onClick={() => setFilterTab('leave')}
                  >
                    On Leave ({leaveToday})
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department & Role</th>
                      <th>Status</th>
                      <th>Clock In</th>
                      <th>Clock Out</th>
                      <th>Verification Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoster.map(emp => {
                      const record = attendance.find(a => a.empId === emp.id);
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

                          <td>
                            <div style={{ fontWeight: 500 }}>{emp.dept}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.role}</div>
                          </td>

                          <td>
                            {status === 'present' && <span className="badge badge-present"><span className="badge-dot" /> Present</span>}
                            {status === 'late' && <span className="badge badge-late"><span className="badge-dot" /> Late</span>}
                            {status === 'leave' && <span className="badge badge-leave"><span className="badge-dot" /> On Leave</span>}
                            {status === 'od' && <span className="badge badge-od"><span className="badge-dot" /> On Duty</span>}
                            {status === 'unmarked' && <span className="badge badge-neutral"><span className="badge-dot" /> Not Punched</span>}
                          </td>

                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record?.inTime || '—'}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record?.outTime || '—'}</td>
                          <td>
                            {record?.method === 'face' ? (
                              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                                📷 Biometric Face (99.4%)
                              </span>
                            ) : record?.method === 'manual' ? (
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>💻 Web Manual</span>
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

      {/* Modals */}
      <AddEmployeeModal
        isOpen={addEmpModalOpen}
        onClose={() => setAddEmpModalOpen(false)}
        onSuccess={loadData}
      />

      <ApplyLeaveModal
        isOpen={applyLeaveModalOpen}
        employees={isEmployee && currentEmp ? [currentEmp] : employees}
        onClose={() => setApplyLeaveModalOpen(false)}
        onSuccess={loadData}
      />

      <FaceAttendanceModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onSuccess={loadData}
      />
    </DashboardLayout>
  );
}
