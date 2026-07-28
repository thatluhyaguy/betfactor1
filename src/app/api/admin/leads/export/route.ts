import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (adminSession?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const csvHeader = 'emailOrPhone,tier,created_at';
  const csvRows = users.map(
    (u) => `"${u.emailOrPhone}","${u.tier}","${u.createdAt.toISOString()}"`
  );
  const csv = [csvHeader, ...csvRows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="betfactor-leads.csv"',
    },
  });
}
