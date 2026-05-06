'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { isBefore, addMonths, startOfToday, format } from 'date-fns'
import { bg } from 'date-fns/locale'
import { DayConfigModal } from './DayConfigModal'
import { CapacityBar } from './CapacityBar'

interface DayStatus {
  date: string
  isBlocked: boolean
  blockReason?: string | null
  usedCapacity: number
  maxCapacity: number
  availableCapacity: number
  percentFull: number
}

export function AdminCalendar() {
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const today = startOfToday()
  const maxDate = addMonths(today, 2)

  const fetchDays = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/days?from=${today.toISOString()}&to=${maxDate.toISOString()}`
      )
      const data = await res.json()
      setDayStatuses(data)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchDays() }, [fetchDays])

  function getModifiers() {
    const blocked: Date[] = []
    const full: Date[] = []
    const almostFull: Date[] = []
    const free: Date[] = []

    dayStatuses.forEach((d) => {
      const date = new Date(d.date)
      if (d.isBlocked) blocked.push(date)
      else if (d.percentFull >= 100) full.push(date)
      else if (d.percentFull >= 70) almostFull.push(date)
      else free.push(date)
    })

    return { blocked, full, almostFull, free }
  }

  function handleDayClick(date: Date | undefined) {
    if (!date) return
    const key = format(date, 'yyyy-MM-dd')
    const status = dayStatuses.find((d) => d.date === key)
    if (status) {
      setSelectedDay(status)
    } else {
      setSelectedDay({
        date: key,
        isBlocked: false,
        blockReason: null,
        usedCapacity: 0,
        maxCapacity: 6,
        availableCapacity: 6,
        percentFull: 0,
      })
    }
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Календар на капацитета</h2>
      <p className="text-xs text-muted-foreground">
        Кликнете върху ден, за да настроите капацитет или да го блокирате.
      </p>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg border bg-white p-10 text-sm text-muted-foreground">
          Зареждане…
        </div>
      ) : (
        <Calendar
          mode="single"
          locale={bg}
          disabled={(date) => isBefore(date, today)}
          modifiers={getModifiers()}
          modifiersClassNames={{
            blocked: 'bg-gray-200 text-gray-400 line-through cursor-pointer',
            full: 'bg-red-100 text-red-600 cursor-pointer',
            almostFull: 'bg-yellow-100 text-yellow-700 cursor-pointer',
            free: 'bg-green-50 text-green-800 cursor-pointer',
          }}
          onSelect={handleDayClick}
          className="rounded-lg border shadow-sm bg-white"
        />
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400" /> Свободно
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" /> Почти пълно
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-400" /> Пълно
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-400" /> Блокирано
        </span>
      </div>

      {selectedDay && (
        <div className="rounded-lg border bg-gray-50 p-3 text-sm space-y-2">
          <p className="font-medium">
            {(() => {
              try {
                return format(new Date(selectedDay.date), 'd MMMM yyyy', { locale: bg })
              } catch {
                return selectedDay.date
              }
            })()}
          </p>
          <CapacityBar used={selectedDay.usedCapacity} max={selectedDay.maxCapacity} />
        </div>
      )}

      <DayConfigModal
        day={selectedDay}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchDays}
      />
    </div>
  )
}
