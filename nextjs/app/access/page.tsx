'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminGuard from '@/components/AdminGuard';
import { Employee } from '@/types';

const MENUS = [
  { key: 'myleave', label: 'My Leave' },
  { key: 'myresign', label: 'My Resignation' },
  { key: 'myletters', label: 'My Letters' },
  { key: 'myatt', label: 'My Attendance' },
  { key: 'myperm', label: 'My Permissions & OD' },
  { key: 'myperf', label: 'My Performance' },
  { key: 'mystat', label: 'My Statutory Statements' },
  { key: 'myservice', label: 'My Service' }
];

export default function MenuAccessPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [privs, setPrivs] = useState<{ defaults: Record<string, boolean>; byEmp: Record<string, Record<string, boolean>> }>({
    defaults: {},
    byEmp: {}
  });
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/access');
      if (res.ok) {
        const data = await res.json();
        setPrivs(data.privileges || { defaults: {}, byEmp: {} });
        setEmployees(data.employees || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDefault = async (menu: string, allowed: boolean) => {
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default', menu, allowed })
      });
      if (res.ok) loadData();
    } catch {
      alert('Error updating default access');
    }
  };

  const toggleEmp = async (empId: string, menu: string, allowed: boolean) => {
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_emp_priv', empId, menu, allowed })
      });
      if (res.ok) loadData();
    } catch {
      alert('Error updating employee privilege');
    }
  };

  const isAllowed = (empId: string, menu: string) => {
    if (privs.byEmp[empId] && privs.byEmp[empId][menu] !== undefined) {
      return privs.byEmp[empId][menu];
    }
    return privs.defaults[menu] ?? true;
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.empCode.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminGuard>
      <DashboardLayout
        title="Menu Access & Role Privileges"
        subtitle="Admin control matrix over which self-service portals each employee can view"
        onRefreshData={loadData}
      >
      {/* Global Defaults */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-header-left">
            <h2 className="card-title">Default Portals for All Staff</h2>
            <span className="card-subtitle">Disable a module globally or customize per employee below</span>
          </div>
        </div>

        <div className="card-body">
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {MENUS.map(m => {
              const checked = privs.defaults[m.key] ?? true;
              return (
                <label key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => toggleDefault(m.key, e.target.checked)}
                    style={{ width: '17px', height: '17px', accentColor: '#2563eb' }}
                  />
                  <span>{m.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Employee Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <h2 className="card-title">Menu Access by Employee Profile</h2>
            <span className="card-subtitle">Granular overrides and permission management</span>
          </div>

          <input
            type="text"
            placeholder="Search staff..."
            className="form-input"
            style={{ minWidth: '180px', padding: '0.4rem 0.75rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="card-body flush">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  {MENUS.map(m => (
                    <th key={m.key} style={{ textAlign: 'center', fontSize: '0.72rem' }}>
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div>
                        <div className="emp-name-text">{emp.name}</div>
                        <div className="emp-code-sub">{emp.empCode} · {emp.dept}</div>
                      </div>
                    </td>

                    {MENUS.map(m => {
                      const checked = isAllowed(emp.id, m.key);
                      return (
                        <td key={m.key} style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => toggleEmp(emp.id, m.key, e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  </AdminGuard>
  );
}
