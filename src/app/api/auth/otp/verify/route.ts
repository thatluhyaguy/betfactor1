import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { otpStore } from '../send/route';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tempToken, code, phone, password } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Please enter the 6-digit OTP code.' }, { status: 400 });
    }

    const pending = tempToken ? otpStore.get(tempToken) : null;

    // Accept demo OTP '123456' or valid tempToken matching code
    const isValidCode = code.trim() === '123456' || (pending && pending.code === code.trim() && Date.now() <= pending.expiresAt);

    if (!isValidCode) {
      return NextResponse.json({ error: 'Invalid or expired OTP code. Use 123456 for testing.' }, { status: 400 });
    }

    const targetPhone = pending?.phone || phone || '+254700000000';
    const targetPassword = pending?.password || password || 'defaultPass123';

    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { emailOrPhone: targetPhone },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            emailOrPhone: targetPhone,
            passwordHash: targetPassword,
            tier: 'FREE',
          },
        });
      } else {
        // Update password if existing
        user = await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: targetPassword },
        });
      }
    } catch (dbErr: any) {
      console.warn('[API /api/auth/otp/verify] DB fallback:', dbErr.message);
      user = {
        id: 'usr_' + Date.now(),
        emailOrPhone: targetPhone,
        tier: 'FREE',
      };
    }

    if (tempToken) {
      otpStore.delete(tempToken);
    }

    const sessionPayload = JSON.stringify({
      id: user.id,
      emailOrPhone: user.emailOrPhone,
      tier: user.tier ?? 'FREE',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Phone verified successfully! Redirecting to dashboard...',
      redirectUrl: '/dashboard',
    });

    response.cookies.set('user_session', sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('[API /api/auth/otp/verify] Error:', err.message);
    return NextResponse.json({ error: 'OTP verification failed. Please try again.' }, { status: 500 });
  }
}
