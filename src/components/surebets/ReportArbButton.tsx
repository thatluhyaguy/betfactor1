'use client';

import { useState } from 'react';

export default function ReportArbButton({ matchSlug }: { matchSlug: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleReport() {
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');
    try {
      await fetch('/api/arb-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchSlug }),
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <span className="arb-report-sent">✓ Flagged — thanks</span>;
  }

  return (
    <button
      className="arb-report-btn"
      onClick={handleReport}
      disabled={status === 'sending'}
      title="Report if these odds look incorrect"
    >
      {status === 'sending' ? '…' : '⚠ Report incorrect'}
    </button>
  );
}
