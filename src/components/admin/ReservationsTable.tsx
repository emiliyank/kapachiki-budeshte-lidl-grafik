'use client'
import { useState, useEffect, useCallback } from 'react'
import { format, startOfToday, parseISO, isBefore, isToday } from 'date-fns'
import { bg } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Reservation {
  id: string
  name: string
  email: string | null
  date: string
  containerSize: 'TUBE_5L' | 'TUBE_10L' | 'BAG'
  capacityUnits: number
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
}

type Period = 'upcoming' | 'past' | 'all'

const CONTAINER_LABELS: Record<string, string> = {
  TUBE_5L: 'Туба 5 л',
  TUBE_10L: 'Туба 10 л',
  BAG: 'Чувал',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активна',
  CANCELLED: 'Отменена',
  COMPLETED: 'Завършена',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'secondary',
}

export function ReservationsTable() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [period, setPeriod] = useState<Period>('upcoming')

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    try {
      const url = dateFilter
        ? `/api/reservations?date=${dateFilter}`
        : '/api/reservations'
      const res = await fetch(url)
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [dateFilter])

  useEffect(() => { fetchReservations() }, [fetchReservations])

  async function handleCancel(id: string) {
    if (!confirm('Сигурни ли сте, че искате да отмените тази резервация?')) return
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        toast.success('Резервацията е отменена.')
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
        )
      } else {
        toast.error('Грешка при отмяна.')
      }
    } catch {
      toast.error('Мрежова грешка.')
    }
  }

  async function handleComplete(id: string) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      if (res.ok) {
        toast.success('Резервацията е маркирана като завършена.')
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'COMPLETED' } : r))
        )
      } else {
        toast.error('Грешка.')
      }
    } catch {
      toast.error('Мрежова грешка.')
    }
  }

  const today = startOfToday()

  const byPeriod = reservations.filter((r) => {
    if (period === 'all') return true
    try {
      const d = parseISO(r.date)
      if (period === 'upcoming') return !isBefore(d, today)
      if (period === 'past') return isBefore(d, today) && !isToday(d)
    } catch {
      return true
    }
    return true
  })

  const filtered = byPeriod.filter(
    (r) =>
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      (r.email ?? '').toLowerCase().includes(filter.toLowerCase()) ||
      r.id.includes(filter)
  )

  // sort upcoming ascending, past descending
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    return period === 'past' ? db - da : da - db
  })

  return (
    <div className="space-y-4">
      <Tabs value={period} onValueChange={(v) => { setPeriod(v as Period); setFilter('') }}>
        <TabsList>
          <TabsTrigger value="upcoming">Предстоящи</TabsTrigger>
          <TabsTrigger value="past">Минали</TabsTrigger>
          <TabsTrigger value="all">Всички</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Търси по ime, имейл или ID…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        {period === 'all' && (
          <>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="max-w-[160px]"
            />
            {dateFilter && (
              <Button variant="outline" size="sm" onClick={() => setDateFilter('')}>
                Изчисти
              </Button>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Зареждане…</div>
      ) : sorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Няма намерени резервации.
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Име</TableHead>
                <TableHead>Имейл</TableHead>
                <TableHead>Контейнер</TableHead>
                <TableHead>Ед.</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {(() => {
                      try {
                        return format(parseISO(r.date), 'd MMM yyyy', { locale: bg })
                      } catch {
                        return r.date
                      }
                    })()}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {r.email ?? '—'}
                  </TableCell>
                  <TableCell>{CONTAINER_LABELS[r.containerSize] ?? r.containerSize}</TableCell>
                  <TableCell>{r.capacityUnits}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[r.status] ?? 'outline'}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === 'ACTIVE' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleComplete(r.id)}
                        >
                          Завърши
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancel(r.id)}
                        >
                          Отмени
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Показани: {sorted.length} резервации
      </p>
    </div>
  )
}
