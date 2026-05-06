import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@/generated/prisma/client'

// Lightweight config — no Prisma, no bcrypt — safe for Edge runtime (middleware)
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user && 'role' in user) token.role = user.role as string
      return token
    },
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as Role
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = auth?.user?.role === 'ADMIN'
      const isAdminRoute = nextUrl.pathname.startsWith('/admin')
      const isLidlRoute = nextUrl.pathname.startsWith('/lidl')

      if (isAdminRoute) return isLoggedIn && isAdmin
      if (isLidlRoute) return isLoggedIn
      return true
    },
  },
}
