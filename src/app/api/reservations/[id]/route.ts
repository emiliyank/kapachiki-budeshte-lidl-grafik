import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'COMPLETED']).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) {
    return NextResponse.json({ error: 'Резервацията не е намерена' }, { status: 404 })
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: parsed.data,
  })
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) {
    return NextResponse.json({ error: 'Резервацията не е намерена' }, { status: 404 })
  }

  await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })
  return new NextResponse(null, { status: 204 })
}
