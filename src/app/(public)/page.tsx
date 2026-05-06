import { ReservationCalendar } from '@/components/public/ReservationCalendar'
import { Suspense } from 'react'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/Lidl-Logo.svg.png"
            alt="Лидл"
            width={52}
            height={52}
            className="rounded-lg object-contain"
            priority
          />
          <h1 className="text-3xl font-bold tracking-tight">
            Донесете капачки в Лидл
          </h1>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          <a
            href="https://maps.app.goo.gl/2jeqLRh8ahFVCy3FA"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Лидл до автогарата (бул. „Васил Кънчов" 21)
          </a>
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Изберете свободен ден от календара, за да резервирате посещение
          и да донесете пластмасовите си капачки в контейнера пред магазина.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center rounded-lg border bg-white p-12 text-sm text-muted-foreground">
            Зареждане на календара…
          </div>
        }
      >
        <ReservationCalendar />
      </Suspense>

      <div className="mt-8 rounded-lg border bg-white p-5 space-y-3">
        <h2 className="font-semibold text-sm">Как работи?</h2>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>Изберете свободен ден от календара (зелено = свободно)</li>
          <li>Въведете вашето име и размера на контейнера</li>
          <li>Потвърдете резервацията — без регистрация</li>
          <li>Донесете капачките в посочения ден</li>
        </ol>
        <p className="text-xs text-muted-foreground border-t pt-3">
          💡 Контейнерът за капачки е след касите. Желателно е (но не задължително) да
          напазарувате нещо макар и малко преди да оставите капачки.
        </p>
      </div>
    </div>
  )
}
