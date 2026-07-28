'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="auth-card" style={{ maxWidth: '440px', margin: '60px auto' }}>
          <div className="auth-header" style={{ textAlign: 'center' }}>
            <span className="page-tag" style={{ marginBottom: '8px' }}>BETFACTOR ADMIN</span>
            <h1 className="auth-title">Admin Portal Login</h1>
            <p className="auth-sub">Log in to manage collected leads, users, and scraper telemetry.</p>
          </div>

          {error && (
            <div className="info-box" style={{ background: 'rgba(225,29,72,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Admin Email</label>
              <input
                type="email"
                className="calc-input"
                placeholder="admin@betfactor.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="calc-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Authenticating…' : 'Access Admin Dashboard →'}
            </button>
          </form>

          <div className="info-box" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8rem' }}>
            🔑 Default credentials: <strong>admin@betfactor.co.ke</strong> / <strong>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
