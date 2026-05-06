import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminderEmail } from '@/lib/email'
import { CONTAINER_LABELS } from '@/lib/capacity'
import { addDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = addDays(new Date(), 1)
  const reservations = await prisma.reservation.findMany({
    where: {
      date: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
      status: 'ACTIVE',
      reminderSent: false,
      email: { not: null },
    },
  })

  const results = await Promise.allSettled(
    reservations.map(async (r) => {
      await sendReminderEmail({
        to: r.email!,
        name: r.name,
        date: r.date,
        containerSize: CONTAINER_LABELS[r.containerSize],
      })
      await prisma.reservation.update({
        where: { id: r.id },
        data: { reminderSent: true },
      })
    })
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent, total: reservations.length })
}
