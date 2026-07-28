'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up.');
      }

      setMessage('🎉 Lead captured! Redirecting to surebets...');
      setTimeout(() => {
        router.push('/sure-bets/live');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="auth-card" style={{ maxWidth: '460px', margin: '40px auto' }}>
          <div className="auth-header">
            <h1 className="auth-title">Create Your BetFactor Account</h1>
            <p className="auth-sub">Access guaranteed-profit arbitrage opportunities across Kenyan bookmakers.</p>
          </div>

          {message && (
            <div className="info-box" style={{ background: 'var(--positive-glow)', borderColor: 'var(--positive)', color: 'var(--positive-dark)', marginBottom: '16px' }}>
              {message}
            </div>
          )}

          {error && (
            <div className="info-box" style={{ background: 'rgba(225,29,72,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Email Address *</label>
              <input
                type="email"
                placeholder="name@domain.com"
                className="calc-input"
                style={{ fontSize: '1rem', padding: '12px 16px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">M-Pesa Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="e.g. 0712345678"
                className="calc-input"
                style={{ fontSize: '1rem', padding: '12px 16px' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Registering Lead…' : 'Unlock Access Now →'}
            </button>
          </form>

          <div className="info-box" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
            🔒 <strong>Lead collected:</strong> You will be notified instantly when new high-margin surebets land.
          </div>

          <div className="auth-footer" style={{ marginTop: '16px', textAlign: 'center' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
