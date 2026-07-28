import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@betfactor.co.ke';

/**
 * Server component guard function.
 * Call `await requireAdmin();` at the top of every admin page/route.
 * Redirects to `/admin/login` if admin session cookie is not authenticated.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');

  if (adminSession?.value !== 'authenticated') {
    redirect('/admin/login');
  }

  return { email: ADMIN_EMAIL, role: 'admin' };
}
