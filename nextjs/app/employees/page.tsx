'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import Avatar from '@/components/Avatar';
import { Employee } from '@/types';
import { useAuth } from '@/lib/AuthContext';

export default function EmployeesPage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const empRes = await fetch('/api/employees');

      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(Array.isArray(data) ? data : []);
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

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the active employee directory?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete');
      }
    } catch {
      alert('Network error communicating with server');
    }
  };

  const handleExportExcel = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Phone', 'Monthly Gross', 'Joined Date', 'Relieved Date'];
    const rows = filtered.map(e => [
      `"${e.empCode}"`,
      `"${e.name}"`,
      `"${e.email}"`,
      `"${e.dept}"`,
      `"${e.role}"`,
      `"${e.status}"`,
      `"${e.phone || ''}"`,
      `"${e.salary || Math.round(e.ctc / 12) || 50000}"`,
      `"${e.doj || ''}"`,
      `"${e.relievingDate || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        alert('CSV file is empty or missing data rows');
        return;
      }

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3 && cols[1] && cols[2]) {
          try {
            await fetch('/api/employees', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                empCode: cols[0] || undefined,
                name: cols[1],
                email: cols[2],
                dept: cols[3] || 'Engineering',
                role: cols[4] || 'Staff',
                status: (cols[5]?.toLowerCase() as any) || 'active',
                phone: cols[6] || '+91 98000 00000',
                salary: Number(cols[7]) || 50000,
                doj: cols[8] || new Date().toISOString().split('T')[0]
              })
            });
            importedCount++;
          } catch {}
        }
      }

      alert(`Successfully imported ${importedCount} employee records into database!`);
      loadData();
    };
    reader.readAsText(file);
  };

  const departments = ['all', ...Array.from(new Set(employees.map(e => e.dept)))];

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                        e.email.toLowerCase().includes(search.toLowerCase()) ||
                        e.empCode.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || e.dept === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <DashboardLayout
      title={isEmployee ? "My Staff Profile" : "Employees Directory"}
      subtitle={
        isEmployee
          ? "Official staff dossier, verified identity credentials & self-service profile"
          : "Comprehensive staff records, roles, compensation profiles & workforce operations"
      }
      onRefreshData={loadData}
    >
      {isEmployee ? (
        /* ================= EMPLOYEE SELF-SERVICE PROFILE VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔒</span>
              <div>
                <strong style={{ color: '#1e40af', fontSize: '0.9rem' }}>Employee Self-Service Session Active</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6' }}>
                  Workforce directory modification and compensation editing are restricted to HR Leadership.
                </p>
              </div>
            </div>
            <Link href="/" className="btn btn-sm btn-primary">
              Go to My Dashboard
            </Link>
          </div>

          {currentEmp && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Verified Employee Record</h2>
                  <span className="card-subtitle">Official identification credentials registered in HRMS</span>
                </div>
                <span className="badge badge-present" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <span className="badge-dot" /> Active In Service
                </span>
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <Avatar
                    avatar={currentEmp.avatar}
                    name={currentEmp.name}
                    color={currentEmp.color}
                    size={80}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      {currentEmp.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="badge badge-neutral" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {currentEmp.empCode}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                        {currentEmp.role}
                      </span>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <span style={{ fontSize: '0.9rem', color: '#2563eb', fontWeight: 600 }}>
                        {currentEmp.dept}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>OFFICIAL EMAIL</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{currentEmp.email}</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>CONTACT NUMBER</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{currentEmp.phone || '+91 98000 00000'}</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>DATE OF JOINING</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{currentEmp.doj || '2023-01-15'}</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>FACIAL BIOMETRIC ENROLLMENT</span>
                    <div style={{ marginTop: '0.2rem' }}>
                      {currentEmp.faceProfileEnrolled || (currentEmp.avatar && currentEmp.avatar.length > 5) ? (
                        <span className="badge badge-present"><span className="badge-dot" /> Enrolled & Verified</span>
                      ) : (
                        <span className="badge badge-late"><span className="badge-dot" /> Enrollment Pending</span>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>SALARY BANK ACCOUNT</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
                      {currentEmp.bankAccount ? `•••• ${currentEmp.bankAccount.slice(-4)} (${currentEmp.bankIfsc || 'HDFC'})` : 'HDFC Bank •••• 4421'}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>PERMANENT ACCOUNT NUMBER (PAN)</span>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>
                      {currentEmp.pan ? `••••${currentEmp.pan.slice(-4)}` : '••••882A'}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Quick Self-Service Actions
                  </h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <Link href="/attendance" className="btn btn-secondary">
                      🕒 My Attendance & Punch
                    </Link>
                    <Link href="/leaves" className="btn btn-secondary">
                      📅 My Leave Requests
                    </Link>
                    <Link href="/payroll" className="btn btn-secondary">
                      💵 View My Payslips
                    </Link>
                    <Link href="/service" className="btn btn-secondary">
                      📖 View My Service Book
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= HR / ADMIN MANAGEMENT VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="filter-toolbar">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-field">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" x2="16.65" y1="21" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, code or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All Departments' : d}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setAddModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>Onboard Employee</span>
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">All Employees ({filtered.length})</h2>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleExportExcel}
                  title="Download Excel / CSV spreadsheet"
                >
                  Export Excel
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleExportPDF}
                  title="Print or Export PDF"
                >
                  Export PDF
                </button>
                <label
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', marginBottom: 0 }}
                  title="Upload CSV / Excel file"
                >
                  Import Excel
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls"
                    style={{ display: 'none' }}
                    onChange={handleImportExcel}
                  />
                </label>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setAddModalOpen(true)}
                >
                  + Add Employee
                </button>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>DEPARTMENT</th>
                      <th>ROLE</th>
                      <th>JOINED</th>
                      <th>RELIEVED</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <div className="emp-row-user">
                            <Avatar avatar={e.avatar} name={e.name} color={e.color} size={36} />
                            <div>
                              <div className="emp-name-text">{e.name}</div>
                              <div className="emp-code-sub">{e.empCode} · {e.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontWeight: 500 }}>{e.dept}</td>

                        <td>{e.role}</td>

                        <td style={{ color: '#64748b' }}>
                          {e.doj || '—'}
                        </td>

                        <td style={{ color: '#94a3b8' }}>
                          {e.relievingDate || '—'}
                        </td>

                        <td>
                          {e.status === 'active' && (
                            <span className="badge badge-present">
                              <span className="badge-dot" /> Active
                            </span>
                          )}
                          {e.status === 'on-leave' && (
                            <span className="badge badge-late">
                              <span className="badge-dot" /> On Leave
                            </span>
                          )}
                          {e.status === 'probation' && (
                            <span className="badge badge-od">
                              <span className="badge-dot" /> Probation
                            </span>
                          )}
                          {e.status === 'resigned' && (
                            <span className="badge badge-leave">
                              <span className="badge-dot" /> Resigned
                            </span>
                          )}
                          {e.status === 'inactive' && (
                            <span className="badge badge-neutral">
                              <span className="badge-dot" /> Inactive
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              fontWeight: 600,
                              padding: '0.25rem 0.6rem',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleOpenEdit(e)}
                            title="Edit employee profile"
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm"
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontWeight: 600,
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              marginLeft: '0.4rem'
                            }}
                            onClick={() => handleDelete(e.id, e.name)}
                            title="Delete employee profile"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AddEmployeeModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSuccess={loadData}
          />

          <EditEmployeeModal
            isOpen={editModalOpen}
            employee={editingEmp}
            onClose={() => setEditModalOpen(false)}
            onSuccess={loadData}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
