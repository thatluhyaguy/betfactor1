import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Join the Launch Waitlist | BetFactor Kenya',
  description: 'Sign up to get notified when automated live odds scanning and Member features launch.',
};

export default function SignupPage() {
  return (
    <div className="static-page">
      <div className="container full-width-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Join the BetFactor Launch Waitlist</h1>
            <p className="auth-sub">Get notified the moment automated live odds scanning and Member features launch.</p>
          </div>

          <form action="/dashboard" className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                className="calc-input"
                style={{ fontSize: '1rem', padding: '12px 16px' }}
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
              />
            </div>

            <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }}>
              Notify Me at Launch →
            </button>
          </form>

          <div className="info-box" style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
            🔒 <strong>No spam guarantee:</strong> You will only receive one email when automated live odds scanning and sure bets launch.
          </div>

          <div className="auth-footer">
            Already have an account? <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
