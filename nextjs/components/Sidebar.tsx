'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Avatar from './Avatar';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, employee, isEmployee, logout } = useAuth();
  const [attBadge, setAttBadge] = useState<number>(1);
  const [leaveBadge, setLeaveBadge] = useState<number>(0);

  useEffect(() => {
    // Fetch live badges in background without causing layout shifts
    Promise.all([
      fetch('/api/attendance').then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/leaves').then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([attData, lvData]) => {
      const pendingLeaves = Array.isArray(lvData) ? lvData.filter((l: any) => l.status === 'pending').length : 0;
      setLeaveBadge(pendingLeaves);
      setAttBadge(1);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand-link" onClick={onCloseMobile}>
            <div className="brand-logo-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="brand-title-wrap">
              <span className="brand-title">HRMS</span>
              <span className="brand-sub">{isEmployee ? 'Self-Service Portal' : 'Enterprise Operations'}</span>
            </div>
          </Link>

          <button
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {isEmployee ? (
            <>
              <div className="nav-heading">MY SELF-SERVICE</div>

              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>My Dashboard</span>
              </Link>

              <Link href="/attendance" className={`nav-link ${pathname === '/attendance' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span>My Attendance</span>
              </Link>

              <Link href="/leaves" className={`nav-link ${pathname === '/leaves' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                <span>My Leave Requests</span>
                {leaveBadge > 0 && <span className="badge-pill-amber">{leaveBadge}</span>}
              </Link>

              <Link href="/permissions" className={`nav-link ${pathname === '/permissions' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><path d="m9 12 2 2 4-4" /></svg>
                <span>My Permissions & OD</span>
              </Link>

              <Link href="/letters" className={`nav-link ${pathname === '/letters' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                <span>My Official Letters</span>
              </Link>

              <Link href="/payroll" className={`nav-link ${pathname === '/payroll' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                <span>My Payslips</span>
              </Link>

              <Link href="/performance" className={`nav-link ${pathname === '/performance' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>
                <span>My Performance</span>
              </Link>

              <Link href="/service" className={`nav-link ${pathname === '/service' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>
                <span>My Service Book</span>
              </Link>

              <Link href="/statmods" className={`nav-link ${pathname === '/statmods' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                <span>My Statutory Statements</span>
              </Link>

              <Link href="/resignations" className={`nav-link ${pathname === '/resignations' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                <span>My Resignation</span>
              </Link>
            </>
          ) : (
            <>
              {/* SECTION: MAIN */}
              <div className="nav-heading">MAIN</div>
              
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Dashboard</span>
              </Link>

              <Link href="/employees" className={`nav-link ${pathname === '/employees' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Employees</span>
              </Link>

              <Link href="/attendance" className={`nav-link ${pathname === '/attendance' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Attendance</span>
                {attBadge > 0 && <span className="badge-pill-red">{attBadge}</span>}
              </Link>

              <Link href="/permissions" className={`nav-link ${pathname === '/permissions' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Permissions & OD</span>
              </Link>

              <Link href="/leaves" className={`nav-link ${pathname === '/leaves' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>Leave</span>
                {leaveBadge > 0 && <span className="badge-pill-red">{leaveBadge}</span>}
              </Link>

              <Link href="/resignations" className={`nav-link ${pathname === '/resignations' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>Resignations</span>
              </Link>

              <Link href="/letters" className={`nav-link ${pathname === '/letters' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Letters</span>
              </Link>

              {/* SECTION: MANAGEMENT */}
              <div className="nav-heading" style={{ marginTop: '0.8rem' }}>MANAGEMENT</div>

              <Link href="/payroll" className={`nav-link ${pathname === '/payroll' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span>Payroll</span>
              </Link>

              <Link href="/statmods" className={`nav-link ${pathname === '/statmods' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span>Statutory Modules</span>
              </Link>

              <Link href="/service" className={`nav-link ${pathname === '/service' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" />
                  <path d="M7 8h10M7 12h10M7 16h6" />
                </svg>
                <span>Service Register</span>
              </Link>

              <Link href="/recruitment" className={`nav-link ${pathname === '/recruitment' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Recruitment</span>
              </Link>

              <Link href="/performance" className={`nav-link ${pathname === '/performance' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <span>Performance</span>
              </Link>

              {/* SECTION: SETTINGS */}
              <div className="nav-heading" style={{ marginTop: '0.8rem' }}>SETTINGS</div>

              <Link href="/departments" className={`nav-link ${pathname === '/departments' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                  <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
                </svg>
                <span>Departments</span>
              </Link>

              <Link href="/access" className={`nav-link ${pathname === '/access' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Menu Access</span>
              </Link>

              <Link href="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`} onClick={onCloseMobile}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            {isEmployee ? (
              <Avatar
                avatar={employee?.avatar}
                name={user?.name || 'Employee'}
                color={employee?.color || '#2563eb'}
                size={36}
              />
            ) : (
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}>
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
            )}
            <div className="user-meta" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div className="user-meta-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Admin User'}
              </div>
              <div className="user-meta-role" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {isEmployee ? (
                  `${employee?.empCode || user?.username || 'Staff'} · ${employee?.role || user?.dept || 'Staff'}`
                ) : (
                  user?.role === 'ADMIN' ? 'HR Administrator' : (user?.role || 'Staff')
                )}
              </div>
            </div>
          </div>
          <button
            className="btn-logout"
            onClick={handleLogout}
            title="Sign out of HRMS"
            aria-label="Logout"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
