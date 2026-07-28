import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@betfactor.co.ke';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      const response = NextResponse.json({ success: true, message: 'Admin authenticated successfully.' });
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }
}
