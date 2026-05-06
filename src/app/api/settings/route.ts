import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { globalSettingsSchema } from '@/lib/validations'

export async function GET() {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } })
  return NextResponse.json(settings ?? { id: 'global', defaultCapacity: 6 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = globalSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const settings = await prisma.globalSettings.upsert({
    where: { id: 'global' },
    update: { defaultCapacity: parsed.data.defaultCapacity },
    create: { id: 'global', defaultCapacity: parsed.data.defaultCapacity },
  })
  return NextResponse.json(settings)
}
