import { ReservationForm } from '@/components/public/ReservationForm'

export default function ReservationPage() {
  return (
    <main className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Нова резервация</h1>
      <ReservationForm />
    </main>
  )
}
