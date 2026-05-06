import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cancellationRequestSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = cancellationRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, date, message } = parsed.data

  await prisma.cancellationRequest.create({
    data: {
      name,
      date: date ? new Date(date) : null,
      message,
    },
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
