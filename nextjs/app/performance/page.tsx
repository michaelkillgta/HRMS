'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { PerformanceCycle, PerformanceGoal, AppraisalReview, Employee } from '@/types';

export default function PerformancePage() {
  const { user: currentUser, employee: currentEmp, isEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState<'appraisals' | 'goals'>('appraisals');
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [reviews, setReviews] = useState<AppraisalReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [loading, setLoading] = useState(true);

  // Review modal (HR only)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewEmp, setReviewEmp] = useState<Employee | null>(null);
  const [rQuality, setRQuality] = useState(4);
  const [rProd, setRProd] = useState(4);
  const [rTeam, setRTeam] = useState(5);
  const [rIncr, setRIncr] = useState('10');
  const [rReco, setRReco] = useState<'Increment' | 'Promotion' | 'Increment + Promotion' | 'Performance Improvement Plan'>('Increment');

  // Goal Progress modal (Employee self-update)
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<PerformanceGoal | null>(null);
  const [goalProgressInput, setGoalProgressInput] = useState<number>(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const perfRes = await fetch('/api/performance');
      if (perfRes.ok) {
        const data = await perfRes.json();
        setCycles(data.cycles || []);
        setGoals(data.goals || []);
        setReviews(data.reviews || []);
        setEmployees(data.employees || []);
        if (data.cycles?.length > 0 && !selectedCycleId) {
          setSelectedCycleId(data.cycles[0].id);
        }
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

  // Handle employee updating their goal progress
  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_goal_progress',
          id: selectedGoal.id,
          progress: goalProgressInput
        })
      });

      if (res.ok) {
        setGoalModalOpen(false);
        loadData();
      } else {
        alert('Failed to update goal progress');
      }
    } catch {
      alert('Network error updating goal progress');
    }
  };

  // Handle HR saving formal appraisal review
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewEmp) return;
    try {
      const res = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_review',
          empId: reviewEmp.id,
          cycleId: selectedCycleId || 'cycle_h2_2026',
          hrRatings: [rQuality, rProd, 5, rTeam, 4, 4],
          reco: rReco,
          incr: Number(rIncr)
        })
      });
      if (res.ok) {
        loadData();
        setReviewModalOpen(false);
      }
    } catch {
      alert('Error saving appraisal review');
    }
  };

  // My Personal review if employee
  const myReview = reviews[0] || null;
  const avgGoalProg = goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length) : 85;

  return (
    <DashboardLayout
      title={isEmployee ? "My Performance & Appraisals" : "Performance Management & Appraisals"}
      subtitle={
        isEmployee
          ? "Personal deliverables tracking, key performance indicators & appraisal scorecards"
          : "Workforce evaluation cycles, weighted goals tracking, 360 review & increment recommendations"
      }
      onRefreshData={loadData}
    >
      {isEmployee ? (
        /* ================= EMPLOYEE SELF-SERVICE VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Employee Performance KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Average Goal Completion</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#059669' }}>{avgGoalProg}%</span>
              </div>
              <span className="kpi-subtext positive">Across {goals.length} weighted deliverables</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Appraisal Rating</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#2563eb' }}>
                  {myReview?.avg ? `${myReview.avg} / 5.0` : '4.4 / 5.0'}
                </span>
              </div>
              <span className="kpi-subtext positive">Band: Exceeds Expectations</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Increment Recommendation</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#7c3aed' }}>
                  {myReview?.hr?.incr ? `+${myReview.hr.incr}%` : '+12% Hike'}
                </span>
              </div>
              <span className="kpi-subtext positive">
                {myReview?.hr?.reco || 'Salary Increment Approved'}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Active Review Cycle</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ fontSize: '1.25rem' }}>H2 2026</span>
              </div>
              <span className="kpi-subtext neutral">Annual Appraisal Period</span>
            </div>
          </div>

          {/* Goals & Deliverables Register */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">My Weighted Goals & Deliverables ({goals.length})</h2>
                <span className="card-subtitle">Quarterly commitments aligned with organizational goals</span>
              </div>
            </div>

            <div className="card-body flush">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Goal Objective</th>
                      <th>Weight</th>
                      <th>Measurable Target</th>
                      <th>Current Progress</th>
                      <th style={{ textAlign: 'right' }}>Self-Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goals.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No goals assigned for the current cycle.
                        </td>
                      </tr>
                    ) : (
                      goals.map(g => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>{g.title}</td>
                          <td><span className="badge badge-neutral" style={{ fontWeight: 700 }}>{g.weight}% Weight</span></td>
                          <td style={{ fontSize: '0.85rem', color: '#475569' }}>{g.target}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '150px' }}>
                              <div className="kpi-progress" style={{ margin: 0, height: '8px' }}>
                                <div className="kpi-progress-bar" style={{ width: `${g.progress}%`, background: g.progress >= 80 ? '#10b981' : '#2563eb' }} />
                              </div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{g.progress}%</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                setSelectedGoal(g);
                                setGoalProgressInput(g.progress);
                                setGoalModalOpen(true);
                              }}
                            >
                              Update %
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Competency & Leadership Feedback Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Official Competency Scorecard & Review</h2>
                <span className="card-subtitle">Assessed by Department Head & Human Resources</span>
              </div>
              <span className="badge badge-present" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                Cycle Finalized
              </span>
            </div>

            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>QUALITY OF EXECUTION</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>4.8 / 5.0</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669' }}>Exemplary standard</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>DELIVERY TIMELINESS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>4.5 / 5.0</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669' }}>Deadlines met consistently</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>CROSS-FUNCTIONAL TEAMWORK</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>5.0 / 5.0</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669' }}>Proactive collaboration</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>OWNERSHIP & INNOVATION</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>4.6 / 5.0</div>
                  <span style={{ fontSize: '0.75rem', color: '#059669' }}>Initiates best practices</span>
                </div>
              </div>

              <div style={{ background: '#f1f5f9', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                  Leadership Appraisal Summary:
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Demonstrates exceptional accountability and technical prowess in operational workflows. Consistently hits quarterly milestones ahead of schedule. Recommended for annual salary increment and senior project leadership responsibilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HR / ADMIN MANAGEMENT VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="filter-toolbar">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                value={selectedCycleId}
                onChange={e => setSelectedCycleId(e.target.value)}
              >
                {cycles.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="tab-filter-pills">
                <button className={`tab-filter-btn ${activeTab === 'appraisals' ? 'active' : ''}`} onClick={() => setActiveTab('appraisals')}>
                  Appraisals & Reviews
                </button>
                <button className={`tab-filter-btn ${activeTab === 'goals' ? 'active' : ''}`} onClick={() => setActiveTab('goals')}>
                  Weighted Goals ({goals.length})
                </button>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => alert('Exporting Performance Register CSV...')}>
              📥 Export Performance CSV
            </button>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-title">Employees in Review</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value">{employees.length}</span>
              </div>
              <span className="kpi-subtext neutral">Active staff evaluated</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Self-Reviews Completed</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#7c3aed' }}>{employees.length - 1}</span>
              </div>
              <span className="kpi-subtext positive">90% submission rate</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Appraisals Finalized</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#059669' }}>{reviews.length || 5}</span>
              </div>
              <span className="kpi-subtext positive">Approved by Leadership</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-title">Average Workforce Rating</span>
              <div className="kpi-value-wrap">
                <span className="kpi-value" style={{ color: '#2563eb' }}>4.3 / 5.0</span>
              </div>
              <span className="kpi-subtext positive">Exceeds Expectations Band</span>
            </div>
          </div>

          {activeTab === 'appraisals' && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Workforce Appraisal Register</h2>
                  <span className="card-subtitle">Formal ratings, competency scores & salary increment recommendations</span>
                </div>
              </div>

              <div className="card-body flush">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Goals Progress</th>
                        <th>Attendance Rate</th>
                        <th>Self Score</th>
                        <th>Final HR Rating</th>
                        <th>Recommendation</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => {
                        const rev = reviews.find(r => r.empId === emp.id);
                        const empGoals = goals.filter(g => g.empId === emp.id);
                        const goalAvg = empGoals.length > 0 ? Math.round(empGoals.reduce((a, b) => a + b.progress, 0) / empGoals.length) : 85;

                        return (
                          <tr key={emp.id}>
                            <td>
                              <div className="emp-row-user">
                                <Avatar avatar={emp.avatar} name={emp.name} color={emp.color} size={36} />
                                <div>
                                  <div className="emp-name-text">{emp.name}</div>
                                  <div className="emp-code-sub">{emp.empCode} · {emp.dept}</div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '130px' }}>
                                <div className="kpi-progress" style={{ margin: 0, height: '6px' }}>
                                  <div className="kpi-progress-bar" style={{ width: `${goalAvg}%`, background: '#2563eb' }} />
                                </div>
                                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{goalAvg}%</span>
                              </div>
                            </td>

                            <td style={{ fontWeight: 600 }}>92%</td>
                            <td>4.5 / 5.0</td>

                            <td>
                              <span className="badge badge-present" style={{ fontWeight: 700 }}>
                                {rev ? `${rev.avg} · Exceeds` : '4.2 · Exceeds'}
                              </span>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                {rev?.hr?.reco || 'Increment'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                                +{rev?.hr?.incr || 12}% Salary Hike
                              </div>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setReviewEmp(emp);
                                  setReviewModalOpen(true);
                                }}
                              >
                                {rev ? 'Edit Appraisal' : 'Appraise'}
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
          )}

          {activeTab === 'goals' && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <h2 className="card-title">Key Performance Indicators & Weighted Goals</h2>
                  <span className="card-subtitle">Quarterly deliverables aligned with organizational growth</span>
                </div>
              </div>

              <div className="card-body flush">
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Assigned Staff</th>
                        <th>Goal Description</th>
                        <th>Weight</th>
                        <th>Measurable Target</th>
                        <th>Current Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals.map(g => {
                        const emp = employees.find(e => e.id === g.empId);
                        return (
                          <tr key={g.id}>
                            <td><strong>{emp?.name || g.empId}</strong></td>
                            <td style={{ fontWeight: 600, color: '#2563eb' }}>{g.title}</td>
                            <td style={{ fontWeight: 700 }}>{g.weight}%</td>
                            <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{g.target}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '140px' }}>
                                <div className="kpi-progress" style={{ margin: 0, height: '8px' }}>
                                  <div className="kpi-progress-bar" style={{ width: `${g.progress}%`, background: '#10b981' }} />
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{g.progress}%</span>
                              </div>
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
        </div>
      )}

      {/* Employee Goal Progress Modal */}
      {goalModalOpen && selectedGoal && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Update Goal Progress</h2>
              <button className="modal-close-btn" onClick={() => setGoalModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateGoal}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Goal Title</label>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedGoal.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>{selectedGoal.target}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Progress Percentage ({goalProgressInput}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goalProgressInput}
                    onChange={e => setGoalProgressInput(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <span>0% (Not Started)</span>
                    <span>50% (In Progress)</span>
                    <span>100% (Completed)</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setGoalModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Progress</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Admin/HR Only) */}
      {reviewModalOpen && reviewEmp && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Appraisal Review – {reviewEmp.name}</h2>
              <button className="modal-close-btn" onClick={() => setReviewModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveReview}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <strong>Role:</strong> {reviewEmp.role} · <strong>Department:</strong> {reviewEmp.dept}
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Quality of Work (1-5)</label>
                    <select className="form-select" value={rQuality} onChange={e => setRQuality(Number(e.target.value))}>
                      <option value="5">5 – Outstanding</option>
                      <option value="4">4 – Exceeds Expectations</option>
                      <option value="3">3 – Meets Expectations</option>
                      <option value="2">2 – Needs Improvement</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Productivity & Delivery (1-5)</label>
                    <select className="form-select" value={rProd} onChange={e => setRProd(Number(e.target.value))}>
                      <option value="5">5 – Outstanding</option>
                      <option value="4">4 – Exceeds Expectations</option>
                      <option value="3">3 – Meets Expectations</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">HR Recommendation</label>
                    <select className="form-select" value={rReco} onChange={(e: any) => setRReco(e.target.value)}>
                      <option value="Increment">Salary Increment</option>
                      <option value="Promotion">Designation Promotion</option>
                      <option value="Increment + Promotion">Increment + Promotion</option>
                      <option value="Performance Improvement Plan">PIP (Under Performance)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Proposed Increment (%)</label>
                    <input type="number" className="form-input" value={rIncr} onChange={e => setRIncr(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setReviewModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Final Appraisal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
