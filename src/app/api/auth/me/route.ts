import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  const userSession = cookieStore.get('user_session');

  if (adminSession?.value === 'authenticated') {
    return NextResponse.json({ role: 'admin', isAdmin: true, isUser: false });
  }

  if (userSession?.value) {
    try {
      const user = JSON.parse(userSession.value);
      return NextResponse.json({ role: 'user', isAdmin: false, isUser: true, user });
    } catch {
      // malformed cookie
    }
  }

  return NextResponse.json({ role: 'guest', isAdmin: false, isUser: false });
}
