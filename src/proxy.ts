import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Next.js 16 uses proxy.ts instead of middleware.ts.
// Default export is the most explicit form Next.js recognises as a proxy function.
const { auth } = NextAuth(authConfig)

export default auth

export const config = {
  matcher: ['/admin/:path*', '/lidl/:path*'],
}
