import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Next.js 16: proxy.ts replaces middleware.ts; export must be named "proxy"
export const { auth: proxy } = NextAuth(authConfig)

export const config = {
  matcher: ['/admin/:path*', '/lidl/:path*'],
}
