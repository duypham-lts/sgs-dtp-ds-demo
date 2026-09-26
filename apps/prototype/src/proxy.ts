// Light gate for the hosted design demo (e.g. Vercel). The prototype has only mock data, but its screens carry
// client material (CLAUDE.md), so a shared deployment asks for one team password and is never indexed.
// Set DEMO_BASIC_AUTH="user:password" in the hosting environment to turn it on; unset (local dev, tests) = open.
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const expected = process.env.DEMO_BASIC_AUTH;
  if (expected) {
    const header = request.headers.get('authorization') ?? '';
    const given = header.startsWith('Basic ') ? atob(header.slice(6)) : '';
    if (given !== expected) {
      return new NextResponse('Authentication required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="SGS DTP demo", charset="UTF-8"' } });
    }
  }
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  // Everything except Next's static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
