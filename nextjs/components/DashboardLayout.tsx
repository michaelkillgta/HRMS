'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FaceAttendanceModal from './FaceAttendanceModal';

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onRefreshData?: () => void;
}

export default function DashboardLayout({
  title,
  subtitle,
  children,
  onRefreshData
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  const handleFaceSuccess = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="app-main">
        <Navbar
          title={title}
          subtitle={subtitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenFaceModal={() => setFaceModalOpen(true)}
        />

        <div className="page-content">
          {children}
        </div>
      </div>

      <FaceAttendanceModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        onSuccess={handleFaceSuccess}
      />
    </div>
  );
}
