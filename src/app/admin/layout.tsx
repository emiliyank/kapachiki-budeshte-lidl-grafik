import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white px-6 py-3">
        <nav className="flex items-center gap-6">
          <span className="font-semibold text-sm">Капачки — Администрация</span>
          <Link href="/admin" className="text-sm hover:underline">Начало</Link>
          <Link href="/admin/reservations" className="text-sm hover:underline">Резервации</Link>
          <Link href="/admin/settings" className="text-sm hover:underline">Настройки</Link>
          <Link href="/admin/users" className="text-sm hover:underline">Потребители</Link>
          <Link href="/api/auth/signout" className="ml-auto text-sm text-red-600 hover:underline">Изход</Link>
        </nav>
      </header>
      <div className="flex-1 bg-gray-50 p-6">{children}</div>
    </div>
  )
}
