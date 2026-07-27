import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { matchSlug } = await req.json();

    if (!matchSlug || typeof matchSlug !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid matchSlug' }, { status: 400 });
    }

    // Trim and basic length guard — matchSlug should never exceed 200 chars
    const slug = matchSlug.trim().slice(0, 200);

    await prisma.arbReport.create({
      data: { matchSlug: slug },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[arb-reports] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
