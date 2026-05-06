import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReservationsTable } from '@/components/admin/ReservationsTable'
import { AdminCalendar } from '@/components/admin/AdminCalendar'
import { startOfToday, addDays } from 'date-fns'

async function getDashboardStats() {
  const today = startOfToday()
  const tomorrow = addDays(today, 1)
  const nextWeek = addDays(today, 7)

  const [
    totalActive,
    todayReservations,
    tomorrowReservations,
    weekReservations,
    pendingCancellations,
  ] = await Promise.all([
    prisma.reservation.count({ where: { status: 'ACTIVE' } }),
    prisma.reservation.count({ where: { date: today, status: 'ACTIVE' } }),
    prisma.reservation.count({ where: { date: tomorrow, status: 'ACTIVE' } }),
    prisma.reservation.count({
      where: { date: { gte: today, lte: nextWeek }, status: 'ACTIVE' },
    }),
    prisma.cancellationRequest.count({ where: { resolved: false } }),
  ])

  return { totalActive, todayReservations, tomorrowReservations, weekReservations, pendingCancellations }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Активни (общо)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalActive}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Днес
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todayReservations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Утре
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.tomorrowReservations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Следващи 7 дни
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.weekReservations}</p>
          </CardContent>
        </Card>

        <Card className={stats.pendingCancellations > 0 ? 'border-orange-300 bg-orange-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Заявки за отмяна
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stats.pendingCancellations > 0 ? 'text-orange-600' : ''}`}>
              {stats.pendingCancellations}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations + calendar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReservationsTable />
        <AdminCalendar />
      </div>
    </div>
  )
}
