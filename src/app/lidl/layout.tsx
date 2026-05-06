import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LidlLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-6 py-3">
        <nav className="flex items-center gap-6">
          <span className="font-semibold text-sm">Капачки — Лидл</span>
          <Link href="/lidl" className="text-sm hover:underline">Начало</Link>
          <Link href="/api/auth/signout" className="ml-auto text-sm text-red-600 hover:underline">Изход</Link>
        </nav>
      </header>
      <div className="flex-1 bg-gray-50 p-6">{children}</div>
    </div>
  )
}
