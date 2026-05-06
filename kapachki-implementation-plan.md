# Имплементационен план — Капачки за Бъдеще Враца
### Next.js · TypeScript · Prisma · PostgreSQL (Neon) · Vercel
### GitHub репозитори: `kapachiki-budeshte-lidl-grafik`

---

## Технологичен стек

| Слой | Технология |
|---|---|
| Framework | Next.js 14 (App Router) |
| Език | TypeScript |
| База данни | PostgreSQL чрез Neon |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Стилове | Tailwind CSS + shadcn/ui |
| Имейли | Resend |
| Cron jobs | Vercel Cron |
| Хостинг | Vercel (свързан с GitHub) |
| Репозитори | `kapachiki-budeshte-lidl-grafik` |

---

## Фаза 1 — Инициализация на проекта

### Стъпка 1.1 — Клониране на GitHub репозитория

```bash
git clone https://github.com/<вашето-потребителско-име>/kapachiki-budeshte-lidl-grafik.git
cd kapachiki-budeshte-lidl-grafik
```

### Стъпка 1.2 — Създаване на Next.js проект вътре в репозитория

```bash
# Точката (.) казва на create-next-app да използва текущата папка
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Стъпка 1.3 — Добавяне на .cursorrules файл

Създайте файл `.cursorrules` в корена на проекта. Cursor ще го чете като контекст за всяка заявка:

```
Това е уеб приложение за инициативата "Капачки за Бъдеще — Враца".
Целта му е да позволи на потребители да резервират дни за донасяне
на капачки в контейнера на Лидл.

Технологичен стек:
- Next.js 14 (App Router), TypeScript
- Prisma ORM + PostgreSQL (Neon)
- Tailwind CSS + shadcn/ui
- NextAuth.js v5 (JWT strategy)
- Resend (имейли)
- Vercel (хостинг + cron jobs)

Потребителски роли:
- ADMIN: пълен достъп
- LIDL: блокиране на дати, управление на капацитет
- Анонимен потребител: резервации без регистрация

Контейнери:
- TUBE_5L = 0.5 единици
- TUBE_10L = 1 единица
- BAG (чувал) = 3 единици

Работно време на Лидл: пон-сб 07:30-21:30, нед 08:00-21:00.
Хоризонт за резервации: 1 месец напред.
Целият интерфейс е на БЪЛГАРСКИ език.
```

### Стъпка 1.4 — Инсталиране на зависимости

```bash
# База данни и ORM
npm install prisma @prisma/client

# Auth
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# UI компоненти
npx shadcn@latest init
npx shadcn@latest add button calendar card dialog form input label
npx shadcn@latest add select sheet table tabs badge alert toast

# Имейли
npm install resend react-email @react-email/components

# Помощни библиотеки
npm install date-fns zod react-hook-form @hookform/resolvers
npm install lucide-react clsx tailwind-merge

# Dev зависимости
npm install -D @types/node tsx dotenv-cli
```

### Стъпка 1.5 — Инициализиране на Prisma

```bash
npx prisma init
```

### Стъпка 1.6 — Първи commit

```bash
git add .
git commit -m "feat: initialize Next.js project with dependencies"
git push origin main
```

---

## Фаза 2 — База данни (Prisma Schema)

### Файл: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  ADMIN
  LIDL
}

enum ContainerSize {
  TUBE_5L    // = 0.5 единици
  TUBE_10L   // = 1 единица
  BAG        // = 3 единици (чувал)
}

enum ReservationStatus {
  ACTIVE
  CANCELLED
  COMPLETED
}

model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(LIDL)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  sessions  Session[]
  accounts  Account[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model InviteToken {
  id        String   @id @default(cuid())
  token     String   @unique @default(cuid())
  role      Role
  email     String?
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model DayConfig {
  id          String   @id @default(cuid())
  date        DateTime @unique @db.Date
  isBlocked   Boolean  @default(false)
  blockReason String?
  maxCapacity Float?   // null = използва глобалния капацитет
  updatedAt   DateTime @updatedAt
}

model GlobalSettings {
  id              String   @id @default("global")
  defaultCapacity Float    @default(6.0) // В 10л единици
  updatedAt       DateTime @updatedAt
}

model Reservation {
  id            String            @id @default(cuid())
  name          String
  email         String?
  date          DateTime          @db.Date
  containerSize ContainerSize
  capacityUnits Float
  status        ReservationStatus @default(ACTIVE)
  reminderSent  Boolean           @default(false)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  cancellationRequests CancellationRequest[]
}

model CancellationRequest {
  id            String      @id @default(cuid())
  reservationId String
  reservation   Reservation @relation(fields: [reservationId], references: [id])
  message       String
  resolved      Boolean     @default(false)
  createdAt     DateTime    @default(now())
}
```

### Стъпка 2.1 — Настройване на Neon

1. Регистрирайте се на [neon.tech](https://neon.tech)
2. Създайте нов проект — "kapachki-vraca"
3. Копирайте `DATABASE_URL` и `DIRECT_URL` в `.env.local`

### Стъпка 2.2 — Миграция и seed

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

### Файл: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.globalSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: { id: 'global', defaultCapacity: 6.0 },
  })

  const hashedPassword = await bcrypt.hash('промени-паролата', 10)
  await prisma.user.upsert({
    where: { email: 'admin@kapachki-vraca.bg' },
    update: {},
    create: {
      name: 'Администратор',
      email: 'admin@kapachki-vraca.bg',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Seed завършен успешно')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Добавете в `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

### Стъпка 2.3 — Commit

```bash
git add .
git commit -m "feat: add Prisma schema and database seed"
git push origin main
```

---

## Фаза 3 — Автентикация (NextAuth.js)

### Файл: `src/auth.ts`

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Имейл', type: 'email' },
        password: { label: 'Парола', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
  pages: { signIn: '/вход' },
})
```

### Файл: `src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### Файл: `src/middleware.ts`

```typescript
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLidlRoute = req.nextUrl.pathname.startsWith('/lidl')

  if ((isAdminRoute || isLidlRoute) && !req.auth) {
    return NextResponse.redirect(new URL('/вход', req.url))
  }
  if (isAdminRoute && (req.auth?.user as any)?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*', '/lidl/:path*'],
}
```

### Стъпка 3.1 — Commit

```bash
git add .
git commit -m "feat: add NextAuth authentication with role-based middleware"
git push origin main
```

---

## Фаза 4 — Структура на файловете

```
src/
├── app/
│   ├── (public)/                    # Публични страници
│   │   ├── page.tsx                 # Начална страница + календар
│   │   ├── резервация/
│   │   │   └── page.tsx             # Форма за резервация
│   │   ├── отмяна/
│   │   │   └── page.tsx             # Заявка за отмяна
│   │   └── за-нас/
│   │       └── page.tsx             # За инициативата
│   ├── вход/
│   │   └── page.tsx                 # Login страница
│   ├── admin/                       # Admin панел
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard
│   │   ├── резервации/page.tsx      # Таблица + календар
│   │   ├── настройки/page.tsx       # Капацитет и настройки
│   │   └── потребители/page.tsx     # Акаунти + invite links
│   ├── lidl/                        # Lidl панел
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── reservations/
│       │   ├── route.ts             # GET, POST
│       │   └── [id]/route.ts        # PATCH, DELETE
│       ├── days/route.ts            # GET статус, PATCH блокиране
│       ├── settings/route.ts        # GET/PATCH глобални настройки
│       ├── users/route.ts           # GET/POST (Admin)
│       ├── invite/route.ts          # POST генериране на invite
│       └── cron/
│           └── reminders/route.ts   # Vercel Cron напомняния
├── components/
│   ├── public/
│   │   ├── ReservationCalendar.tsx
│   │   ├── ReservationForm.tsx
│   │   └── CancellationForm.tsx
│   ├── admin/
│   │   ├── AdminCalendar.tsx
│   │   ├── ReservationsTable.tsx
│   │   ├── CapacityBar.tsx
│   │   ├── DayConfigModal.tsx
│   │   └── UserManagement.tsx
│   └── ui/                          # shadcn/ui компоненти
├── lib/
│   ├── prisma.ts                    # Prisma singleton
│   ├── capacity.ts                  # Капацитет логика
│   ├── email.ts                     # Resend функции
│   └── validations.ts               # Zod схеми
└── types/
    └── index.ts
```

---

## Фаза 5 — Бизнес логика

### Файл: `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Файл: `src/lib/capacity.ts`

```typescript
import { ContainerSize } from '@prisma/client'

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

// Работно време: 0 = неделя, 1-6 = пон-сб
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
```

### Файл: `src/lib/email.ts`

```typescript
import { Resend } from 'resend'
import { format } from 'date-fns'
import { bg } from 'date-fns/locale'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReminderEmail(params: {
  to: string
  name: string
  date: Date
  containerSize: string
}) {
  const dateStr = format(params.date, 'dd MMMM yyyy', { locale: bg })
  return resend.emails.send({
    from: 'Капачки за Бъдеще Враца <napomnyane@kapachki-vraca.bg>',
    to: params.to,
    subject: `Напомняне: Резервация за капачки утре — ${dateStr}`,
    html: `
      <h2>Здравейте, ${params.name}!</h2>
      <p>Напомняме ви, че утре (<strong>${dateStr}</strong>) имате резервация
      да донесете капачки в контейнера на Лидл — Враца.</p>
      <p>Количество: <strong>${params.containerSize}</strong></p>
      <p>Благодарим ви, че подкрепяте инициативата!</p>
      <hr/>
      <p><small>Капачки за Бъдеще — Враца</small></p>
    `,
  })
}
```

### Стъпка 5.1 — Commit

```bash
git add .
git commit -m "feat: add lib helpers (prisma, capacity, email)"
git push origin main
```

---

## Фаза 6 — API Routes

### Файл: `src/app/api/reservations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCapacityUnits } from '@/lib/capacity'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2, 'Името трябва да е поне 2 символа'),
  email: z.string().email('Невалиден имейл').optional().or(z.literal('')),
  date: z.string().datetime(),
  containerSize: z.enum(['TUBE_5L', 'TUBE_10L', 'BAG']),
})

export async function GET(req: NextRequest) {
  const reservations = await prisma.reservation.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { date: 'asc' },
  })
  return NextResponse.json(reservations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
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
```

### Файл: `src/app/api/cron/reminders/route.ts`

```typescript
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
```

### Стъпка 6.1 — Commit

```bash
git add .
git commit -m "feat: add API routes for reservations, days, settings, cron"
git push origin main
```

---

## Фаза 7 — UI Компоненти

### Файл: `src/components/public/ReservationCalendar.tsx`

```typescript
'use client'
import { Calendar } from '@/components/ui/calendar'
import { useState, useEffect } from 'react'
import { isBefore, isAfter, addMonths, startOfToday } from 'date-fns'

interface DayStatus {
  date: string
  available: boolean
  percentFull: number
  isBlocked: boolean
}

export function ReservationCalendar({
  onSelect,
}: {
  onSelect: (date: Date) => void
}) {
  const [dayStatuses, setDayStatuses] = useState<DayStatus[]>([])
  const today = startOfToday()
  const maxDate = addMonths(today, 1)

  useEffect(() => {
    fetch(
      `/api/days?from=${today.toISOString()}&to=${maxDate.toISOString()}`
    )
      .then((r) => r.json())
      .then(setDayStatuses)
  }, [])

  // Легенда: зелено = свободно, жълто = почти пълно, червено = пълно/блокирано
  function getModifiers() {
    const free: Date[] = []
    const almostFull: Date[] = []
    const full: Date[] = []

    dayStatuses.forEach((d) => {
      const date = new Date(d.date)
      if (d.isBlocked || d.percentFull >= 100) full.push(date)
      else if (d.percentFull >= 70) almostFull.push(date)
      else free.push(date)
    })

    return { free, almostFull, full }
  }

  return (
    <div>
      <Calendar
        mode="single"
        disabled={(date) => isBefore(date, today) || isAfter(date, maxDate)}
        modifiers={getModifiers()}
        modifiersClassNames={{
          free: 'bg-green-100 hover:bg-green-200',
          almostFull: 'bg-yellow-100 hover:bg-yellow-200',
          full: 'bg-red-100 text-red-500 cursor-not-allowed opacity-60',
        }}
        onSelect={(date) => date && onSelect(date)}
        className="rounded-lg border shadow-sm"
      />
      <div className="flex gap-4 mt-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-300 inline-block" />
          Свободно
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-yellow-300 inline-block" />
          Почти пълно
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-300 inline-block" />
          Пълно / Блокирано
        </span>
      </div>
    </div>
  )
}
```

### Стъпка 7.1 — Commit

```bash
git add .
git commit -m "feat: add public calendar and reservation form components"
git push origin main
```

---

## Фаза 8 — Vercel конфигурация

### Файл: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

> Cron задачата се изпълнява всеки ден в 08:00 UTC и изпраща напомняния за резервации на следващия ден.

### Файл: `.env.local` (шаблон — НЕ commit-вайте!)

```env
# База данни (от Neon dashboard)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
AUTH_SECRET="генерирайте с: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Resend (от resend.com)
RESEND_API_KEY="re_..."

# Vercel Cron защита
CRON_SECRET="генерирайте случайна стойност"
```

### Файл: `.env.example` (commit-вайте — без реални стойности)

```env
DATABASE_URL=""
DIRECT_URL=""
AUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY=""
CRON_SECRET=""
```

### Проверете `.gitignore`

Уверете се, че `.env.local` е в `.gitignore` (Next.js го добавя автоматично):

```
.env.local
.env*.local
```

### Стъпка 8.1 — Commit

```bash
git add vercel.json .env.example
git commit -m "feat: add Vercel cron config and env example"
git push origin main
```

---

## Фаза 9 — Деплой в Vercel (свързан с GitHub)

### Стъпка 9.1 — Neon база данни

1. Регистрирайте се на [neon.tech](https://neon.tech)
2. Създайте нов проект — "kapachki-vraca"
3. Запазете `DATABASE_URL` и `DIRECT_URL`

### Стъпка 9.2 — Resend имейли

1. Регистрирайте се на [resend.com](https://resend.com)
2. Добавете и верифицирайте домейна си
3. Запазете API ключа

### Стъпка 9.3 — Свързване на Vercel с GitHub

1. Отидете на [vercel.com](https://vercel.com) → **Add New Project**
2. Изберете **Import Git Repository**
3. Намерете `kapachiki-budeshte-lidl-grafik` и кликнете **Import**
4. В **Environment Variables** добавете всички стойности от `.env.local`
5. Кликнете **Deploy**

> След това всеки `git push origin main` ще задейства автоматичен деплой в Vercel.

### Стъпка 9.4 — Production миграция

```bash
# Изпълнете след първия деплой
npx prisma migrate deploy
```

---

## Ред на имплементация в Cursor

| # | Задача | Commit съобщение |
|---|--------|-----------------|
| 1 | Clone repo + Next.js init + .cursorrules | `feat: initialize project` |
| 2 | Prisma schema + seed | `feat: add database schema and seed` |
| 3 | Auth + middleware | `feat: add NextAuth with role middleware` |
| 4 | lib/prisma + lib/capacity + lib/email | `feat: add lib helpers` |
| 5 | API: резервации (GET, POST, PATCH) | `feat: reservations API` |
| 6 | API: дни + настройки | `feat: days and settings API` |
| 7 | API: потребители + invite | `feat: users and invite API` |
| 8 | Публичен календар компонент | `feat: public reservation calendar` |
| 9 | Форма за резервация | `feat: reservation form` |
| 10 | Начална страница | `feat: home page` |
| 11 | Страница "За нас" | `feat: about page` |
| 12 | Login страница | `feat: login page` |
| 13 | Admin layout + dashboard | `feat: admin dashboard` |
| 14 | Admin резервации (таблица + календар) | `feat: admin reservations view` |
| 15 | Admin потребители + invite links | `feat: admin user management` |
| 16 | Admin настройки (капацитет) | `feat: admin settings` |
| 17 | Lidl панел | `feat: lidl panel` |
| 18 | Cron job за напомняния | `feat: email reminders cron` |
| 19 | vercel.json + .env.example | `feat: Vercel config` |
| 20 | Свързване с Vercel + деплой | `chore: production deployment` |

---

## Препоръки за работа в Cursor

- `.cursorrules` дава на Cursor пълен контекст — не го пропускайте
- Работете **фаза по фаза** и commit-вайте след всяка
- Vercel ще деплойва автоматично при всеки `git push origin main`
- Използвайте `npx prisma studio` за визуален преглед на базата данни
- При грешки в Prisma — `npx prisma migrate reset` нулира dev базата
- Проверявайте Vercel logs при проблеми с production деплоя

---

*Инициативата Капачки за Бъдеще — Враца | Технически план v1.1 (GitHub edition)*
