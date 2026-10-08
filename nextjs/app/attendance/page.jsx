'use client';

import { useState } from 'react';
import FaceAttendanceModal from '../../components/FaceAttendanceModal';

const INITIAL_LOGS = [
  { id: 'a1', empName: "Aisha Khan", date: "2026-10-09", inTime: "09:05 AM", outTime: "06:10 PM", status: "Present", method: "Face Match (0.32)" },
  { id: 'a2', empName: "Rahul Sharma", date: "2026-10-09", inTime: "09:18 AM", outTime: "--", status: "Present", method: "Fingerprint" },
  { id: 'a3', empName: "Priya Patel", date: "2026-10-09", inTime: "--", outTime: "--", status: "On Leave", method: "Approved Leave" },
  { id: 'a4', empName: "James Wilson", date: "2026-10-09", inTime: "09:40 AM", outTime: "--", status: "Late", method: "Face Match (0.41)" },
];

export default function AttendancePage() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <h1 className="page-title">Attendance Logs & Verification</h1>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setFaceModalOpen(true)}>
            📷 Check-In Now
          </button>
        </div>
      </header>

      <div className="content">
        <div className="att-summary">
          <div className="att-box">
            <div className="num" style={{ color: 'var(--success)' }}>18</div>
            <div className="lbl">Present On Time</div>
          </div>
          <div className="att-box">
            <div className="num" style={{ color: 'var(--warning)' }}>3</div>
            <div className="lbl">Late Arrivals</div>
          </div>
          <div className="att-box">
            <div className="num" style={{ color: 'var(--danger)' }}>2</div>
            <div className="lbl">Absent</div>
          </div>
          <div className="att-box">
            <div className="num" style={{ color: 'var(--primary)' }}>1</div>
            <div className="lbl">On Duty (OD)</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Today's Attendance Stream (09-Oct-2026)</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                  <th>Verification Method</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.empName}</strong></td>
                    <td>{l.date}</td>
                    <td>{l.inTime}</td>
                    <td>{l.outTime}</td>
                    <td>
                      <span className={`badge ${l.status === 'Present' ? 'badge-success' : l.status === 'Late' ? 'badge-warning' : 'badge-danger'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td><span className="badge badge-blue">{l.method}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FaceAttendanceModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onSuccess={() => alert('Clock-in recorded via face recognition!')}
      />
    </>
  );
}
