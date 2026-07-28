import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { emailOrPhone, password } = await req.json();

    if (!emailOrPhone) {
      return NextResponse.json({ error: 'Email or phone is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { emailOrPhone: emailOrPhone.trim() } });

    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, emailOrPhone: user.emailOrPhone, tier: user.tier },
    });

    // Encode minimal user info in session cookie (not sensitive data)
    const sessionPayload = JSON.stringify({ id: user.id, emailOrPhone: user.emailOrPhone, tier: user.tier });
    response.cookies.set('user_session', sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('[API /api/auth/login]', err.message);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
