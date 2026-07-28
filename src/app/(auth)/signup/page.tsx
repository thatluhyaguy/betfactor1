'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Form state
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('+254');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [tempToken, setTempToken] = useState('');

  // Status state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Step 1: Send OTP to Phone
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }

    if (!phone.trim() || phone.trim() === '+254') {
      setError('Please enter a valid phone number starting with +254.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setTempToken(data.tempToken);
      setMessage(data.message || 'OTP sent! Please enter code 123456 to verify.');
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Log In to Dashboard
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code sent to your phone.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpCode, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }

      setMessage('🎉 Phone verified! Redirecting to your dashboard...');
      setTimeout(() => {
        router.push(data.redirectUrl || '/dashboard');
      }, 1000);
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
            <h1 className="auth-title">
              {step === 1 ? 'Create Your BetFactor Account' : 'Verify Phone Number'}
            </h1>
            <p className="auth-sub">
              {step === 1
                ? 'Sign up with your phone number (+254) to unlock guaranteed-profit surebets.'
                : `We sent a 6-digit code to ${phone}. Enter 123456 to complete verification.`}
            </p>
          </div>

          {message && (
            <div className="info-box" style={{ background: 'rgba(34,197,94,0.1)', borderColor: '#22c55e', color: '#4ade80', marginBottom: '16px' }}>
              {message}
            </div>
          )}

          {error && (
            <div className="info-box" style={{ background: 'rgba(225,29,72,0.1)', borderColor: 'var(--accent)', color: 'var(--accent)', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1 FORM: Username, Phone (+254), Password, Confirm Password */
            <form onSubmit={handleStep1Submit} className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Username *</label>
                <input
                  type="text"
                  placeholder="e.g. pancras_mwangi"
                  className="calc-input"
                  style={{ fontSize: '1rem', padding: '12px 16px' }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number (+254) *</label>
                <input
                  type="tel"
                  placeholder="+254712345678"
                  className="calc-input"
                  style={{ fontSize: '1rem', padding: '12px 16px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Account Password *</label>
                <input
                  type="password"
                  placeholder="Enter a secure password"
                  className="calc-input"
                  style={{ fontSize: '1rem', padding: '12px 16px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  className="calc-input"
                  style={{ fontSize: '1rem', padding: '12px 16px' }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Sending OTP…' : 'Send Verification OTP →'}
              </button>
            </form>
          ) : (
            /* STEP 2 FORM: OTP Entry */
            <form onSubmit={handleStep2Submit} className="calc-inputs" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">6-Digit Verification Code *</label>
                <input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  className="calc-input"
                  style={{ fontSize: '1.4rem', textAlign: 'center', letterSpacing: '4px', padding: '14px 16px' }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-primary-large" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
                {loading ? 'Verifying Code…' : 'Verify & Open Dashboard →'}
              </button>

              <button
                type="button"
                className="sb-btn sb-btn-outline"
                style={{ width: '100%', marginTop: '8px', textAlign: 'center' }}
                onClick={() => { setStep(1); setError(''); setMessage(''); }}
              >
                ← Back to Edit Details
              </button>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
