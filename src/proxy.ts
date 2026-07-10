import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_ROLES = ['ADMIN', 'OWNER']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = process.env.JWT_SECRET
  if (!secret) return NextResponse.next()

  const token = request.cookies.get('access_token')?.value
  if (!token) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const role = (payload.role as string)?.toUpperCase() || ''
    if (!ADMIN_ROLES.includes(role)) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      return NextResponse.redirect(homeUrl)
    }
    return NextResponse.next()
  } catch {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
