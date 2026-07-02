import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth is client-side via sessionStorage. Middleware pass-through.
// When backend is added, replace with cookie-based session check.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
}
