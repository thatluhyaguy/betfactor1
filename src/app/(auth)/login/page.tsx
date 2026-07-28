'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      // Refresh auth context so Navbar updates immediately
      await refresh();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="auth-card" style={{ maxWidth: '460px', margin: '60px auto' }}>
          <div className="auth-header">
            <h1 className="auth-title">Log In to BetFactor</h1>
            <p className="auth-sub">Enter your phone number (+254) or username to access your account.</p>
          </div>

          {error && (
            <div className="info-box" style={{ background: 'rgba(225,29,72,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Phone Number (+254) or Username</label>
              <input
                type="text"
                placeholder="e.g. +254712345678 or username"
                className="calc-input"
                style={{ fontSize: '1rem', padding: '12px 16px' }}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="calc-input"
                style={{ fontSize: '1rem', padding: '12px 16px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Logging in…' : 'Log In →'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up →</Link>
          </div>

          <div className="auth-footer" style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.8rem' }}>
            Are you an admin?{' '}
            <Link href="/admin/login" style={{ color: '#f59e0b', fontWeight: 600 }}>Admin Login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
