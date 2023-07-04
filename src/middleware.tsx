import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  if (url.pathname.includes('/portal')) {
    url.pathname = url.pathname.replace('/portal', '');
    return NextResponse.redirect(url);
  }
}
