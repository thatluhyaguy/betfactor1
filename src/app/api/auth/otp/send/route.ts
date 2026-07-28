import { NextResponse } from 'next/server';

// Store pending OTPs in memory for verification
const otpStore = new Map<string, { code: string; phone: string; username: string; password: string; expiresAt: number }>();

export { otpStore };

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, phone, password } = body;

    if (!username || !username.trim()) {
      return NextResponse.json({ error: 'Username is required.' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone.startsWith('+254') && !cleanPhone.startsWith('07') && !cleanPhone.startsWith('01')) {
      return NextResponse.json({ error: 'Phone number must start with +254 (e.g., +254712345678).' }, { status: 400 });
    }

    if (!password || password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long.' }, { status: 400 });
    }

    // Standardize phone format
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+254' + formattedPhone.slice(1);
    }

    // Generate 6-digit OTP code (default 123456 for instant testing / dev fallback)
    const code = '123456';
    const tempToken = 'tok_' + Math.random().toString(36).substring(2) + Date.now();

    otpStore.set(tempToken, {
      code,
      phone: formattedPhone,
      username: username.trim(),
      password,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    console.log(`[OTP Sent] Sent OTP ${code} to phone ${formattedPhone} for user ${username}`);

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${formattedPhone}. Enter 123456 to verify.`,
      tempToken,
      phone: formattedPhone,
    });
  } catch (err: any) {
    console.error('[API /api/auth/otp/send] Error:', err.message);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
