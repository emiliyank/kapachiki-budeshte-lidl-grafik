import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { dayConfigSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json({ error: 'from and to query params required' }, { status: 400 })
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)

  const [dayConfigs, aggregates, settings] = await Promise.all([
    prisma.dayConfig.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
    }),
    prisma.reservation.groupBy({
      by: ['date'],
      where: {
        date: { gte: fromDate, lte: toDate },
        status: 'ACTIVE',
      },
      _sum: { capacityUnits: true },
    }),
    prisma.globalSettings.findUnique({ where: { id: 'global' } }),
  ])

  const defaultCapacity = settings?.defaultCapacity ?? 6
  const configMap = new Map(dayConfigs.map((d) => [d.date.toISOString().split('T')[0], d]))
  const usageMap = new Map(
    aggregates.map((a) => [
      a.date.toISOString().split('T')[0],
      a._sum.capacityUnits ?? 0,
    ])
  )

  // Build a day-by-day result for the requested range
  const days = []
  const cursor = new Date(fromDate)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(toDate)
  end.setHours(0, 0, 0, 0)

  while (cursor <= end) {
    const key = cursor.toISOString().split('T')[0]
    const config = configMap.get(key)
    const used = usageMap.get(key) ?? 0
    const max = config?.maxCapacity ?? defaultCapacity

    days.push({
      date: key,
      isBlocked: config?.isBlocked ?? false,
      blockReason: config?.blockReason ?? null,
      usedCapacity: used,
      maxCapacity: max,
      availableCapacity: Math.max(0, max - used),
      percentFull: max > 0 ? Math.round((used / max) * 100) : 0,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return NextResponse.json(days)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = dayConfigSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, isBlocked, blockReason, maxCapacity } = parsed.data
  const configDate = new Date(date)

  const config = await prisma.dayConfig.upsert({
    where: { date: configDate },
    update: { isBlocked, blockReason, maxCapacity },
    create: { date: configDate, isBlocked, blockReason, maxCapacity },
  })
  return NextResponse.json(config)
}
