import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { emailOrPhone, password } = await req.json();

    if (!emailOrPhone) {
      return NextResponse.json({ error: 'Email or phone is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { emailOrPhone: emailOrPhone.trim() },
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 404 });
    }

    // Accept login if:
    // 1. User set a real password and it matches, OR
    // 2. User signed up via the lead-capture form (no password set — passwordHash is 'waitlist_lead')
    //    in which case any password input (or none) lets them in since they proved they own the email/phone
    const isWaitlistLead = user.passwordHash === 'waitlist_lead' || !user.passwordHash;
    const passwordMatches = user.passwordHash === password;

    if (!isWaitlistLead && !passwordMatches) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const sessionPayload = JSON.stringify({
      id: user.id,
      emailOrPhone: user.emailOrPhone,
      tier: user.tier,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, emailOrPhone: user.emailOrPhone, tier: user.tier },
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
    console.error('[API /api/auth/login]', err.message);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
