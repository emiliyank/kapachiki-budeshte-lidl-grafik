import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const inviteSchema = z.object({
  role: z.enum(['ADMIN', 'LIDL']),
  email: z.string().email().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // valid for 7 days

  const invite = await prisma.inviteToken.create({
    data: {
      role: parsed.data.role,
      email: parsed.data.email ?? null,
      expiresAt,
    },
  })

  const inviteUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/register?token=${invite.token}`
  return NextResponse.json({ token: invite.token, url: inviteUrl, expiresAt }, { status: 201 })
}
