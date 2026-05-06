import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCapacityUnits } from '@/lib/capacity'
import { createReservationSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'ACTIVE',
      ...(date ? { date: new Date(date) } : {}),
    },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(reservations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = createReservationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, date, containerSize } = parsed.data
  const reservationDate = new Date(date)

  const [dayConfig, settings, existing] = await Promise.all([
    prisma.dayConfig.findUnique({ where: { date: reservationDate } }),
    prisma.globalSettings.findUnique({ where: { id: 'global' } }),
    prisma.reservation.aggregate({
      where: { date: reservationDate, status: 'ACTIVE' },
      _sum: { capacityUnits: true },
    }),
  ])

  if (dayConfig?.isBlocked) {
    return NextResponse.json({ error: 'Този ден е блокиран' }, { status: 409 })
  }

  const maxCapacity = dayConfig?.maxCapacity ?? settings?.defaultCapacity ?? 6
  const usedCapacity = existing._sum.capacityUnits ?? 0
  const requestedUnits = getCapacityUnits(containerSize)

  if (usedCapacity + requestedUnits > maxCapacity) {
    return NextResponse.json(
      { error: 'Няма достатъчен капацитет за този ден' },
      { status: 409 }
    )
  }

  const reservation = await prisma.reservation.create({
    data: {
      name,
      email: email || null,
      date: reservationDate,
      containerSize,
      capacityUnits: requestedUnits,
    },
  })

  return NextResponse.json(reservation, { status: 201 })
}
