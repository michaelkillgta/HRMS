'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection failure. Please verify server.');
    } finally {
      setLoading(false);
    }
  };

  const setRolePreset = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      padding: '1.5rem',
      fontFamily: 'var(--font-sans)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Top Header */}
        <div style={{
          padding: '2.5rem 2rem 1.75rem',
          textAlign: 'center',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
          }}>
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
            HRMS Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Secure Enterprise Human Resource Management System
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Pills */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Quick Role Switcher
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRolePreset('admin', 'admin123')}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: username === 'admin' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: username === 'admin' ? '#eff6ff' : '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: username === 'admin' ? '#1e40af' : '#475569',
                  cursor: 'pointer'
                }}
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => setRolePreset('hr', 'hr123')}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: username === 'hr' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: username === 'hr' ? '#eff6ff' : '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: username === 'hr' ? '#1e40af' : '#475569',
                  cursor: 'pointer'
                }}
              >
                💼 HR Lead
              </button>
              <button
                type="button"
                onClick={() => setRolePreset('EMP001', 'emp123')}
                style={{
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: username === 'EMP001' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: username === 'EMP001' ? '#eff6ff' : '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: username === 'EMP001' ? '#1e40af' : '#475569',
                  cursor: 'pointer'
                }}
              >
                👤 Staff
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username or Employee Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. admin or EMP001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>
        </div>

        <div style={{
          padding: '1.1rem 2rem',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          Protected by Server-Side Session Security · RBAC Enforced
        </div>
      </div>
    </div>
  );
}
