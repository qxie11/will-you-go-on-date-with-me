import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Exclude static files, API routes, and Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // Parse subdomain
  let subdomain = '';
  const hostParts = hostname.split('.');
  // Check if it's localhost or an actual domain. 
  // Make sure it's not an IP address (e.g. 192.168.x.x)
  const isIp = /^(\d{1,3}\.){3}\d{1,3}/.test(hostname);
  if (!isIp && !hostname.startsWith('localhost')) {
    if (hostname.includes('.localhost') && hostParts.length >= 2) {
      // e.g. danny.localhost:3000
      subdomain = hostParts[0];
    } else if (hostParts.length >= 3) {
      // e.g. danny.example.com
      if (hostParts[0] !== 'www') {
        subdomain = hostParts[0];
      }
    }
  }

  // Determine Language
  let locale = 'ru'; // default
  const langQuery = url.searchParams.get('lang');
  
  if (langQuery && ['ru', 'uk', 'en'].includes(langQuery)) {
    locale = langQuery;
  } else {
    const acceptLanguage = req.headers.get('accept-language') || '';
    if (acceptLanguage.toLowerCase().includes('uk')) {
      locale = 'uk';
    } else if (acceptLanguage.toLowerCase().includes('en')) {
      locale = 'en';
    }
  }

  // Add headers for the server component to read
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-subdomain', subdomain);
  requestHeaders.set('x-locale', locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
