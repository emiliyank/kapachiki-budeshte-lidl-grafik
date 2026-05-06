import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isLidlRoute = pathname.startsWith('/lidl')

  if ((isAdminRoute || isLidlRoute) && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdminRoute && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/lidl/:path*'],
}
