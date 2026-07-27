import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up | BetFactor Kenya',
  description: 'Create a free BetFactor account linked to your Safaricom M-Pesa phone number.',
};

export default function SignupPage() {
  return (
    <div className="static-page">
      <div className="container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="page-tag">CREATE ACCOUNT</span>
            <h1 className="auth-title">Get Free Access</h1>
            <p className="auth-sub">Link your Safaricom phone number for instant M-Pesa access</p>
          </div>

          <form className="auth-form" action="/dashboard">
            <div className="input-group">
              <label htmlFor="phone" className="input-label">M-Pesa Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="07XX XXX XXX or 01XX XXX XXX"
                className="calc-input"
                required
              />
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label htmlFor="email" className="input-label">Email Address (Optional)</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="calc-input"
              />
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label htmlFor="signup-password" className="input-label">Create Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="At least 6 characters"
                className="calc-input"
                required
              />
            </div>

            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '24px' }}>
              Create Account →
            </button>
          </form>

          <div className="auth-footer">
            <span>Already have an account? </span>
            <Link href="/login" className="explainer-link">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
