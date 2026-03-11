import { NextRequest, NextResponse } from 'next/server';
import { ROUTE_PERMISSIONS } from '@/config/permissions';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // For protected routes, let the client-side auth handle redirection
  // Server-side we just check if the request looks authenticated (cookie-based check would go here)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
