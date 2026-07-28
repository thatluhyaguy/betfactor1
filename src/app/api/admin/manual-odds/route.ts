import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (adminSession?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      matchSlug,
      margin,
      bestHomeBookmaker,
      bestHomeOdds,
      bestDrawBookmaker,
      bestDrawOdds,
      bestAwayBookmaker,
      bestAwayOdds,
    } = await req.json();

    if (!matchSlug || !margin) {
      return NextResponse.json({ error: 'Missing required match details' }, { status: 400 });
    }

    // Save directly to Postgres database
    const arb = await prisma.arbitrageOpportunity.create({
      data: {
        matchSlug: matchSlug.trim(),
        margin: parseFloat(margin),
        bestHomeBookmaker: bestHomeBookmaker || 'SportPesa',
        bestHomeOdds: parseFloat(bestHomeOdds) || 2.0,
        bestDrawBookmaker: bestDrawBookmaker || 'Betika',
        bestDrawOdds: parseFloat(bestDrawOdds) || 3.4,
        bestAwayBookmaker: bestAwayBookmaker || 'Odibets',
        bestAwayOdds: parseFloat(bestAwayOdds) || 3.8,
        detectedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, opportunity: arb });
  } catch (err: any) {
    console.error('[manual-odds] error:', err.message);
    return NextResponse.json({ error: 'Failed to insert manual odds opportunity' }, { status: 500 });
  }
}
