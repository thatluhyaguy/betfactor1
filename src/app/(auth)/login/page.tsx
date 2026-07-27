import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log In | BetFactor Kenya',
  description: 'Log in to your BetFactor account or join the launch waitlist.',
};

export default function LoginPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Log In to BetFactor</h1>
            <p className="auth-sub">Enter your M-Pesa phone number or email to access your account.</p>
          </div>

          <form action="/dashboard" className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">M-Pesa Phone Number or Email</label>
              <input
                type="text"
                placeholder="e.g. 0712345678 or name@domain.com"
                className="calc-input"
                style={{ fontSize: '1rem', padding: '12px 16px' }}
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
                required
              />
            </div>

            <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }}>
              Log In →
            </button>
          </form>

          <div className="info-box" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
            ℹ️ <strong>Accounts are launching soon alongside live odds scanning</strong> — sign up on our waitlist to get notified the moment Member features go live.
          </div>

          <div className="auth-footer">
            Don't have an account? <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up for the waitlist →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
