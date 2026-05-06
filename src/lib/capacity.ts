import type { ContainerSize } from '@/generated/prisma/client'

export const CONTAINER_UNITS: Record<ContainerSize, number> = {
  TUBE_5L: 0.5,
  TUBE_10L: 1.0,
  BAG: 3.0,
}

export const CONTAINER_LABELS: Record<ContainerSize, string> = {
  TUBE_5L: 'Туба 5 литра',
  TUBE_10L: 'Туба 10 литра',
  BAG: 'Чувал (= 3 туби по 10л)',
}

export function getCapacityUnits(size: ContainerSize): number {
  return CONTAINER_UNITS[size]
}

// 0 = Sunday, 1–6 = Monday–Saturday
export const LIDL_HOURS: Record<number, { open: string; close: string }> = {
  0: { open: '08:00', close: '21:00' },
  1: { open: '07:30', close: '21:30' },
  2: { open: '07:30', close: '21:30' },
  3: { open: '07:30', close: '21:30' },
  4: { open: '07:30', close: '21:30' },
  5: { open: '07:30', close: '21:30' },
  6: { open: '07:30', close: '21:30' },
}

export function isDateBookable(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + 1)
  return date >= today && date <= maxDate
}
