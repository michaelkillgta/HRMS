'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Employees', href: '/employees', icon: '👥' },
    { label: 'Attendance', href: '/attendance', icon: '🕒' },
    { label: 'Leaves', href: '/leaves', icon: '🌴' },
    { label: 'Permissions', href: '/permissions', icon: '⏱️' },
    { label: 'Payroll', href: '/payroll', icon: '💰' },
    { label: 'Letters', href: '/letters', icon: '📄' },
    { label: 'Resignations', href: '/resignations', icon: '🚪' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">RA</div>
        <div className="logo-text">
          HR<span>MS</span>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-section">Management</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.2rem', marginRight: '4px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">AD</div>
        <div className="user-info">
          <div className="user-name">Admin User</div>
          <div className="user-role">HR Manager</div>
        </div>
        <button
          className="logout-btn"
          onClick={() => alert('Logged out')}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
