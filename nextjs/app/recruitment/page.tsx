'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import AdminGuard from '@/components/AdminGuard';
import { JobOpening, Candidate, CandidateStage } from '@/types';

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedStage, setSelectedStage] = useState('all');
  const [newJobModal, setNewJobModal] = useState(false);
  const [newCandModal, setNewCandModal] = useState(false);

  // New Job form
  const [jobTitle, setJobTitle] = useState('Company Secretary');
  const [jobDept, setJobDept] = useState('Legal & Compliance');
  const [jobArea, setJobArea] = useState('Company Secretarial');
  const [jobVacancies, setJobVacancies] = useState('2');
  const [jobSalary, setJobSalary] = useState('₹60,000 – 85,000 / mo');

  // New Candidate form
  const [candName, setCandName] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candJobId, setCandJobId] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/recruitment');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setCandidates(data.candidates || []);
        if (data.jobs?.length > 0 && !candJobId) {
          setCandJobId(data.jobs[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_job',
          job: {
            title: jobTitle,
            dept: jobDept,
            area: jobArea,
            vacancies: Number(jobVacancies),
            salary: jobSalary
          }
        })
      });
      if (res.ok) {
        loadData();
        setNewJobModal(false);
      }
    } catch {
      alert('Error saving job opening');
    }
  };

  const handleCreateCand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_candidate',
          candidate: {
            jobId: candJobId || jobs[0]?.id,
            name: candName,
            phone: candPhone,
            email: candEmail
          }
        })
      });
      if (res.ok) {
        loadData();
        setNewCandModal(false);
        setCandName('');
      }
    } catch {
      alert('Error adding candidate');
    }
  };

  const updateStage = async (id: string, stage: CandidateStage) => {
    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_stage', id, stage })
      });
      if (res.ok) {
        loadData();
      }
    } catch {
      alert('Error updating candidate stage');
    }
  };

  const filteredCands = candidates.filter(c => selectedStage === 'all' || c.stage === selectedStage);

  return (
    <AdminGuard>
      <DashboardLayout
        title="Talent Acquisition & Recruitment Pipeline"
        subtitle="Job requisitions, candidate evaluation stages & onboarding automation"
      onRefreshData={loadData}
    >
      <div className="filter-toolbar">
        <div className="tab-filter-pills">
          <button className={`tab-filter-btn ${activeTab === 'candidates' ? 'active' : ''}`} onClick={() => setActiveTab('candidates')}>
            Candidate Pipeline ({candidates.length})
          </button>
          <button className={`tab-filter-btn ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            Job Openings ({jobs.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'candidates' ? (
            <button className="btn btn-primary" onClick={() => setNewCandModal(true)}>
              + Add Candidate
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setNewJobModal(true)}>
              + Post Job Requisition
            </button>
          )}
        </div>
      </div>

      {activeTab === 'candidates' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <h2 className="card-title">Applicant Assessment Register</h2>
              <span className="card-subtitle">Hiring pipeline across technical & partner rounds</span>
            </div>

            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
            >
              <option value="all">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="Partner / Final Interview">Partner / Final Interview</option>
              <option value="Offer">Offer</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="card-body flush">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position Applied</th>
                    <th>Source</th>
                    <th>Experience</th>
                    <th>Stage</th>
                    <th>Rating</th>
                    <th style={{ textAlign: 'right' }}>Advance Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCands.map(c => {
                    const job = jobs.find(j => j.id === c.jobId);
                    return (
                      <tr key={c.id}>
                        <td>
                          <div>
                            <div className="emp-name-text">{c.name}</div>
                            <div className="emp-code-sub">{c.email || c.phone}</div>
                          </div>
                        </td>

                        <td>{job?.title || 'Legal & Secretarial'}</td>
                        <td><span className="badge badge-neutral">{c.source}</span></td>
                        <td style={{ fontWeight: 500 }}>{c.exp || 2} yrs ({c.qual})</td>

                        <td>
                          {c.stage === 'Hired' && <span className="badge badge-present"><span className="badge-dot" /> Hired</span>}
                          {c.stage === 'Offer' && <span className="badge badge-od"><span className="badge-dot" /> Offer Rolled</span>}
                          {c.stage === 'Technical Interview' && <span className="badge badge-late"><span className="badge-dot" /> Tech Round</span>}
                          {c.stage === 'Screening' && <span className="badge badge-neutral"><span className="badge-dot" /> Screening</span>}
                          {c.stage === 'Applied' && <span className="badge badge-neutral"><span className="badge-dot" /> Applied</span>}
                          {c.stage === 'Rejected' && <span className="badge badge-leave"><span className="badge-dot" /> Rejected</span>}
                        </td>

                        <td>{'⭐'.repeat(c.rating || 4)}</td>

                        <td style={{ textAlign: 'right' }}>
                          <select
                            className="form-select"
                            style={{ width: 'auto', padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                            value={c.stage}
                            onChange={(e: any) => updateStage(c.id, e.target.value)}
                          >
                            <option value="Applied">Applied</option>
                            <option value="Screening">Screening</option>
                            <option value="Technical Interview">Technical Round</option>
                            <option value="Partner / Final Interview">Partner Round</option>
                            <option value="Offer">Roll Out Offer</option>
                            <option value="Hired">Hire Staff</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <h2 className="card-title">Corporate Job Openings ({jobs.length})</h2>
              <span className="card-subtitle">Active headcount requisitions</span>
            </div>
          </div>

          <div className="card-body flush">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Position Title</th>
                    <th>Practice Area</th>
                    <th>Department</th>
                    <th>Vacancies</th>
                    <th>Compensation Band</th>
                    <th>Status</th>
                    <th>Posted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{j.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{j.loc} · {j.type}</div>
                      </td>
                      <td>{j.area}</td>
                      <td>{j.dept}</td>
                      <td style={{ fontWeight: 700 }}>{j.vacancies}</td>
                      <td style={{ fontWeight: 600 }}>{j.salary}</td>
                      <td><span className="badge badge-present"><span className="badge-dot" /> {j.status}</span></td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{j.posted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {newJobModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">Create Job Opening</h2>
              <button className="modal-close-btn" onClick={() => setNewJobModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateJob}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Position Title</label>
                  <input className="form-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input className="form-input" value={jobDept} onChange={e => setJobDept(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Practice Area</label>
                    <input className="form-input" value={jobArea} onChange={e => setJobArea(e.target.value)} />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Vacancies</label>
                    <input type="number" className="form-input" value={jobVacancies} onChange={e => setJobVacancies(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Gross Band</label>
                    <input className="form-input" value={jobSalary} onChange={e => setJobSalary(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setNewJobModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Candidate Modal */}
      {newCandModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h2 className="modal-title">Add Candidate to Pipeline</h2>
              <button className="modal-close-btn" onClick={() => setNewCandModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCand}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Applying Position</label>
                  <select className="form-select" value={candJobId} onChange={e => setCandJobId(e.target.value)}>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={candName} onChange={e => setCandName(e.target.value)} required />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={candPhone} onChange={e => setCandPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-input" value={candEmail} onChange={e => setCandEmail(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setNewCandModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  </AdminGuard>
  );
}
