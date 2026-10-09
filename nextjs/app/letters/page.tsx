'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { Employee, LetterRecord } from '@/types';

export default function LettersPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [letters, setLetters] = useState<LetterRecord[]>([]);

  const [selectedEmpId, setSelectedEmpId] = useState(currentEmp?.id || '');
  const [letterType, setLetterType] = useState<'appointment' | 'relieving' | 'experience' | 'increment'>('appointment');
  const [activeLetter, setActiveLetter] = useState<LetterRecord | null>(null);

  const loadData = async () => {
    try {
      const [empRes, letRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/letters')
      ]);

      const [empData, letData] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        letRes.ok ? letRes.json() : []
      ]);

      setEmployees(Array.isArray(empData) ? empData : []);
      setLetters(Array.isArray(letData) ? letData : []);
      if (!selectedEmpId && Array.isArray(empData) && empData.length > 0) {
        setSelectedEmpId(empData[0].id);
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const targetEmp = employees.find(e => e.id === (isEmployee ? currentUser?.empId : selectedEmpId)) || currentEmp || employees[0];
  const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      title={isEmployee ? 'My Official Letters' : 'Letters & Official Documents'}
      subtitle={isEmployee ? `Employment verification & appointment documents for ${currentUser?.name || 'Staff'}` : 'Standardized employment verification, appointment & relieving certificates'}
      onRefreshData={loadData}
    >
      <div className="filter-toolbar no-print">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Letter Template:</label>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={letterType}
              onChange={(e: any) => setLetterType(e.target.value)}
            >
              <option value="appointment">Appointment Letter</option>
              <option value="increment">Salary Increment & Revision</option>
              <option value="experience">Experience Certificate</option>
              <option value="relieving">Relieving Certificate</option>
            </select>
          </div>

          {!isEmployee && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Employee:</label>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.empCode} - {e.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={handlePrint}>
          🖨️ Print / Export PDF
        </button>
      </div>

      {/* Official Letter Paper Document */}
      <div className="card" style={{ maxWidth: '850px', margin: '0 auto', padding: '3.5rem 3rem', backgroundColor: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        {/* Letterhead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px double #2563eb', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <div style={{ width: '36px', height: '36px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800 }}>
                HR
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                HRMS ENTERPRISE
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Corporate Headquarters · HITEC City, Hyderabad – 500081, India
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#64748b' }}>
            <div><strong>Ref:</strong> HRMS/DOC/{new Date().getFullYear()}/{targetEmp?.empCode || '001'}</div>
            <div><strong>Date:</strong> {todayStr}</div>
          </div>
        </div>

        {/* Recipient Header */}
        <div style={{ marginBottom: '2rem', fontSize: '0.92rem', lineHeight: 1.6 }}>
          <strong>To,</strong><br />
          <strong>{targetEmp?.name}</strong><br />
          Employee Code: {targetEmp?.empCode}<br />
          Department: {targetEmp?.dept}<br />
          Email: {targetEmp?.email}
        </div>

        {/* Subject */}
        <div style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a', textDecoration: 'underline' }}>
          {letterType === 'appointment' && `Sub: Formal Appointment Letter – ${targetEmp?.role}`}
          {letterType === 'increment' && `Sub: Annual Performance Compensation Revision & Increment Letter`}
          {letterType === 'experience' && `Sub: Service & Employment Experience Verification Certificate`}
          {letterType === 'relieving' && `Sub: Formal Relieving Letter and Service Settlement`}
        </div>

        {/* Content Body */}
        <div style={{ fontSize: '0.92rem', lineHeight: 1.8, color: '#334155', marginBottom: '2.5rem' }}>
          {letterType === 'appointment' && (
            <>
              <p>Dear {targetEmp?.name},</p>
              <p>
                We have great pleasure in welcoming you to <strong>HRMS Enterprise</strong> as <strong>{targetEmp?.role}</strong> in the <strong>{targetEmp?.dept}</strong> department, effective from your joining date of <strong>{targetEmp?.doj || 'January 15, 2023'}</strong>.
              </p>
              <p>
                Your annual Cost to Company (CTC) is fixed at <strong>₹{((targetEmp?.salary || 65000) * 12).toLocaleString('en-IN')}</strong> per annum, payable in accordance with the standard payroll schedule and subject to statutory tax and PF deductions.
              </p>
              <p>
                You will be governed by the standard enterprise employment policies, code of conduct, and confidentiality agreements. We wish you a fulfilling and prosperous career with us.
              </p>
            </>
          )}

          {letterType === 'increment' && (
            <>
              <p>Dear {targetEmp?.name},</p>
              <p>
                In recognition of your exceptional performance and valuable contributions to the <strong>{targetEmp?.dept}</strong> team, management is pleased to revise your compensation package effective April 1, 2026.
              </p>
              <p>
                Your revised monthly gross compensation stands upgraded to <strong>₹{(targetEmp?.salary || 65000).toLocaleString('en-IN')}</strong> per month (Annual CTC: ₹{((targetEmp?.salary || 65000) * 12).toLocaleString('en-IN')}).
              </p>
              <p>
                We deeply appreciate your commitment and look forward to your continued leadership and excellence.
              </p>
            </>
          )}

          {letterType === 'experience' && (
            <>
              <p><strong>TO WHOMSOEVER IT MAY CONCERN</strong></p>
              <p>
                This is to certify that <strong>{targetEmp?.name}</strong> (Employee Code: {targetEmp?.empCode}) has been working with our organization since <strong>{targetEmp?.doj || 'January 15, 2023'}</strong> as <strong>{targetEmp?.role}</strong> in the {targetEmp?.dept} team.
              </p>
              <p>
                During their tenure, we have found them to be highly proficient, sincere, and dedicated in all responsibilities entrusted to them. Their conduct and character have been exemplary.
              </p>
              <p>We wish them all the best in their future professional endeavors.</p>
            </>
          )}

          {letterType === 'relieving' && (
            <>
              <p>Dear {targetEmp?.name},</p>
              <p>
                With reference to your formal resignation, we hereby confirm that you have been relieved of your duties as <strong>{targetEmp?.role}</strong> effective close of business hours on <strong>{targetEmp?.relievingDate || todayStr}</strong>.
              </p>
              <p>
                All company assets, clearances, and handover procedures have been successfully completed and settled. There are no outstanding organizational liabilities.
              </p>
              <p>We thank you for your dedicated service and wish you great success ahead.</p>
            </>
          )}
        </div>

        {/* Signatures & Corporate Seal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div>
            <div style={{
              display: 'inline-block',
              padding: '0.4rem 0.8rem',
              border: '2px dashed #059669',
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              ✓ Digitally Signed & Verified
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>HR Administration Lead</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>HRMS Enterprise Platform</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
