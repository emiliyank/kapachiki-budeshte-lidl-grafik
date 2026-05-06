'use client'
import { Calendar } from '@/components/ui/calendar'
import { useState, useEffect } from 'react'
import { isBefore, isAfter, addMonths, startOfToday } from 'date-fns'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'

interface DayStatus {
  date: string
  available: boolean
  percentFull: number
  isBlocked: boolean
  availableCapacity: number
  usedCapacity: number
  maxCapacity: number
}

export function ReservationCalendar() {
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const today = startOfToday()
  const maxDate = addMonths(today, 1)

  useEffect(() => {
    fetch(
      `/api/days?from=${today.toISOString()}&to=${maxDate.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => {
        setDayStatuses(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getModifiers() {
    const free: Date[] = []
    const almostFull: Date[] = []
    const full: Date[] = []

    dayStatuses.forEach((d) => {
      const date = new Date(d.date)
      if (d.isBlocked || d.percentFull >= 100) full.push(date)
      else if (d.percentFull >= 70) almostFull.push(date)
      else free.push(date)
    })

    return { free, almostFull, full }
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return
    const key = format(date, 'yyyy-MM-dd')
    const status = dayStatuses.find((d) => d.date === key)
    if (status?.isBlocked || (status && status.percentFull >= 100)) return
    router.push(`/reservation?date=${key}`)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center rounded-lg border bg-white p-12">
          <div className="text-sm text-muted-foreground">Зареждане на календара…</div>
        </div>
      ) : (
        <Calendar
          mode="single"
          locale={bg}
          disabled={(date) =>
            isBefore(date, today) ||
            isAfter(date, maxDate) ||
            (() => {
              const key = format(date, 'yyyy-MM-dd')
              const s = dayStatuses.find((d) => d.date === key)
              return !!(s?.isBlocked || (s && s.percentFull >= 100))
            })()
          }
          modifiers={getModifiers()}
          modifiersClassNames={{
            free: 'bg-green-100 hover:bg-green-200 text-green-900',
            almostFull: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900',
            full: 'bg-red-100 text-red-400 cursor-not-allowed opacity-60',
          }}
          onSelect={handleSelect}
          className="rounded-lg border shadow-sm bg-white"
        />
      )}

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-green-400" />
          Свободно
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
          Почти пълно
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-red-400" />
          Пълно / Блокирано
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Кликнете върху свободен ден, за да направите резервация.
        Можете да резервирате до 1 месец напред.
      </p>
    </div>
  )
}
