import type { Reservation, DayConfig, GlobalSettings, User } from '@/generated/prisma/client'

export type { Reservation, DayConfig, GlobalSettings, User }

export type DayStatus = {
  date: string
  isBlocked: boolean
  blockReason?: string | null
  usedCapacity: number
  maxCapacity: number
  availableCapacity: number
}

export type ReservationWithStatus = Reservation & {
  dayConfig?: DayConfig | null
}
