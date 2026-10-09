'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminGuard from '@/components/AdminGuard';
import { Designation, Employee } from '@/types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [newDeptName, setNewDeptName] = useState('');
  const [newDesigName, setNewDesigName] = useState('');
  const [newDesigDept, setNewDesigDept] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
        setDesignations(data.designations || []);
        setEmployees(data.employees || []);
        if (data.departments?.length > 0 && !newDesigDept) {
          setNewDesigDept(data.departments[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_dept', name: newDeptName.trim() })
      });
      if (res.ok) {
        setNewDeptName('');
        loadData();
      }
    } catch {
      alert('Error adding department');
    }
  };

  const handleAddDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesigName.trim()) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_desig', name: newDesigName.trim(), dept: newDesigDept })
      });
      if (res.ok) {
        setNewDesigName('');
        loadData();
      }
    } catch {
      alert('Error adding designation');
    }
  };

  const handleDeleteDept = async (name: string) => {
    if (!confirm(`Are you sure you want to remove the ${name} department?`)) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_dept', name })
      });
      if (res.ok) loadData();
    } catch {
      alert('Error deleting department');
    }
  };

  const handleDeleteDesig = async (id: string) => {
    if (!confirm('Are you sure you want to remove this designation?')) return;
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_desig', id })
      });
      if (res.ok) loadData();
    } catch {
      alert('Error deleting designation');
    }
  };

  return (
    <AdminGuard>
      <DashboardLayout
        title="Departments & Designations"
        subtitle="Organizational structural hierarchy, units and title mappings"
        onRefreshData={loadData}
      >
      <div className="dept-grid-2">
        {/* Departments Panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <h2 className="card-title">Departments ({departments.length})</h2>
              <span className="card-subtitle">Organizational operational divisions</span>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="New department name..."
                className="form-input"
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                + Add Dept
              </button>
            </form>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Employees</th>
                    <th>Designations</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(d => {
                    const empCount = employees.filter(e => e.dept === d).length;
                    const desigCount = designations.filter(x => x.dept === d).length;
                    return (
                      <tr key={d}>
                        <td><strong style={{ color: '#0f172a' }}>{d}</strong></td>
                        <td>{empCount} Staff</td>
                        <td>{desigCount} Titles</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDeleteDept(d)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Designations Panel */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <h2 className="card-title">Designations ({designations.length})</h2>
              <span className="card-subtitle">Professional roles & position definitions</span>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleAddDesig} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="New designation..."
                className="form-input"
                style={{ flex: 1, minWidth: '150px' }}
                value={newDesigName}
                onChange={e => setNewDesigName(e.target.value)}
                required
              />
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={newDesigDept}
                onChange={e => setNewDesigDept(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                + Add Title
              </button>
            </form>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Employees</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {designations.map(des => {
                    const count = employees.filter(e => e.role === des.name).length;
                    return (
                      <tr key={des.id}>
                        <td><strong style={{ color: '#0f172a' }}>{des.name}</strong></td>
                        <td><span className="badge badge-neutral">{des.dept || 'General'}</span></td>
                        <td>{count} Staff</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleDeleteDesig(des.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  </AdminGuard>
  );
}
