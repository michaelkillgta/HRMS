'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isEmployee, isLoading } = useAuth();

  if (isLoading && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (isEmployee) {
    return (
      <DashboardLayout
        title="Access Restricted"
        subtitle="Administrative authorization required"
      >
        <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', maxWidth: '580px', margin: '2rem auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
            🔒
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem' }}>
            Administrative Privilege Required
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
            This configuration module is strictly restricted to HR Leaders and Company Administrators. Your employee account (<strong>{user?.username}</strong>) does not have write access to system-wide administration.
          </p>
          <Link href="/" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Return to My Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
