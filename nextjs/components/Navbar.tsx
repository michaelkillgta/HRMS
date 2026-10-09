'use client';

import { useState, useEffect } from 'react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
  onOpenFaceModal?: () => void;
}

export default function Navbar({
  title = 'Executive Dashboard',
  subtitle = 'Real-time workforce intelligence and operations',
  onOpenMobileMenu,
  onOpenFaceModal
}: NavbarProps) {
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const d = new Date();
    setCurrentDateStr(d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }));
  }, []);

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onOpenMobileMenu}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>

        <div className="header-title-group">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-field topbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search employees, ID..." />
        </div>

        {currentDateStr && (
          <span className="topbar-date">
            📅 {currentDateStr}
          </span>
        )}

        {onOpenFaceModal && (
          <button
            className="btn btn-primary topbar-punch-btn"
            onClick={onOpenFaceModal}
            title="Biometric Punch Attendance"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            <span className="topbar-punch-text">Biometric Punch</span>
          </button>
        )}
      </div>
    </header>
  );
}
