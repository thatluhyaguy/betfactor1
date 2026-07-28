import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, password } = body;

    const emailOrPhone = email?.trim() || phone?.trim();
    if (!emailOrPhone) {
      return NextResponse.json({ error: 'Email or phone number is required.' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { emailOrPhone },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Lead recorded (already registered).', user: existing },
        { status: 200 }
      );
    }

    // Create new lead/user record in Neon Postgres
    const user = await prisma.user.create({
      data: {
        emailOrPhone,
        passwordHash: password || 'waitlist_lead',
        tier: 'FREE',
      },
    });

    return NextResponse.json(
      { message: 'Thank you! You have been added to the lead list.', user },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API /api/auth/signup] Error:', err.message);
    return NextResponse.json({ error: 'Failed to record lead.' }, { status: 500 });
  }
}
