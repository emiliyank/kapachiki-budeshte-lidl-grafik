import { ReservationCalendar } from '@/components/public/ReservationCalendar'

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Капачки за Бъдеще — Враца</h1>
      <p className="mb-8 text-muted-foreground">
        Изберете ден, в който ще донесете капачки в контейнера на Лидл.
      </p>
      <ReservationCalendar />
    </main>
  )
}
