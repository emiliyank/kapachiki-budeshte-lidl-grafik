import type { NextAuthConfig } from 'next-auth'

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any
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
