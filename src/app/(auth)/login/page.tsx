import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Log In | BetFactor Kenya',
  description: 'Log in to your BetFactor account using your M-Pesa phone number or email address.',
};

export default function LoginPage() {
  return (
    <div className="static-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="page-tag">MEMBER PORTAL</span>
            <h1 className="auth-title">Log in to BetFactor</h1>
            <p className="auth-sub">Enter your M-Pesa registered phone number or email</p>
          </div>

          <form className="auth-form" action="/dashboard">
            <div className="input-group">
              <label htmlFor="login-id" className="input-label">M-Pesa Phone Number or Email</label>
              <input
                id="login-id"
                type="text"
                placeholder="e.g. 0712345678 or name@example.com"
                className="calc-input"
                required
              />
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="calc-input"
                required
              />
            </div>

            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '24px' }}>
              Log In →
            </button>
          </form>

          <div className="auth-footer">
            <span>Don't have an account? </span>
            <Link href="/signup" className="explainer-link">Sign up free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
