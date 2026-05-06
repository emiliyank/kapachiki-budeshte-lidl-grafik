import Link from 'next/link'
import Image from 'next/image'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/kapachki-za-budeshte-vratsa-logo.jpg"
              alt="Капачки за Бъдеще — Враца"
              width={56}
              height={56}
              className="rounded-full object-cover"
              priority
            />
            <span className="font-semibold text-sm hidden sm:block">
              Капачки за Бъдеще — Враца
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-primary transition-colors">
              Резервация
            </Link>
            <Link href="/about" className="hover:text-primary transition-colors">
              За нас
            </Link>
            <Link href="/cancel" className="text-muted-foreground hover:text-foreground transition-colors">
              Отмяна
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      <footer className="border-t bg-white py-4 text-xs text-muted-foreground">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between">
          <span>© 2025 Капачки за Бъдеще — Враца · Лидл контейнер · Пон–Съб 07:30–21:30 · Нед 08:00–21:00</span>
          <a
            href="https://www.facebook.com/kapachkizabudeshtevratsa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Капачки за Бъдеще Враца във Facebook"
            className="flex items-center gap-1.5 text-[#1877F2] hover:text-[#0a5dbf] transition-colors font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
            Капачки за Бъдеще — Враца
          </a>
        </div>
      </footer>
    </div>
  )
}
