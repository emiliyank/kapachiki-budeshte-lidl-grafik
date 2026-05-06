import { ReservationForm } from '@/components/public/ReservationForm'
import { Suspense } from 'react'

export default function ReservationPage() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-10">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Зареждане…</div>}>
        <ReservationForm />
      </Suspense>
    </div>
  )
}
