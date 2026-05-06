import { ReservationsTable } from '@/components/admin/ReservationsTable'
import { AdminCalendar } from '@/components/admin/AdminCalendar'

export default function AdminReservationsPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Резервации</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCalendar />
        <ReservationsTable />
      </div>
    </div>
  )
}
