import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const totalUsers = await prisma.user.count();
    const paidUsers = await prisma.user.count({ where: { tier: 'MEMBER' } });

    return NextResponse.json({
      totalUsers,
      paidUsers,
      users: users.map((u) => ({
        id: u.id,
        emailOrPhone: u.emailOrPhone,
        tier: u.tier,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error('[API /api/admin/users] Error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, tier } = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { tier },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update user tier.' }, { status: 500 });
  }
}
