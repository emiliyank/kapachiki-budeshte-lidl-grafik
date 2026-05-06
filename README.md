# Капачки за Бъдеще — Враца 🧢

Уеб приложение за планиране на доставки на капачки до контейнера на Лидл — Враца.
Позволява на граждани да резервират ден за донасяне на капачки, като се следи капацитетът на контейнера.

---

## Технологичен стек

- **Framework:** Next.js 14 (App Router) + TypeScript
- **База данни:** PostgreSQL чрез [Neon](https://neon.tech)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **UI:** Tailwind CSS + shadcn/ui
- **Имейли:** Resend
- **Хостинг:** Vercel

---

## Бърз старт (локална разработка)

### Изисквания

- [Node.js](https://nodejs.org) v18 или по-нова версия
- npm v9+

### 1. Клониране на репозитория

```bash
git clone https://github.com/<username>/kapachiki-budeshte-lidl-grafik.git
cd kapachiki-budeshte-lidl-grafik
```

### 2. Инсталиране на зависимости

```bash
npm install
```

### 3. Конфигуриране на environment variables

Копирайте примерния `.env` файл:

```bash
cp .env.example .env.local
```

Отворете `.env.local` и попълнете стойностите (вижте секцията [Environment Variables](#environment-variables) по-долу).

### 4. Стартиране на локалната база данни

```bash
npx prisma dev
```

> Това стартира локална PostgreSQL база данни и Prisma Studio автоматично — без нужда от Docker или отделна PostgreSQL инсталация.

### 5. Изпълнение на миграциите и seed

В нов терминал:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Seed-ът създава:
- Начални глобални настройки (капацитет 6 единици)
- Първи Admin акаунт: `admin@kapachki-vraca.bg` / парола: `промени-паролата`

> ⚠️ Сменете паролата веднага след първото влизане!

### 6. Стартиране на приложението

```bash
npm run dev
```

Отворете [http://localhost:3000](http://localhost:3000) в браузъра.

---

## Environment Variables

Копирайте `.env.example` като `.env.local` и попълнете:

```env
# База данни
# При локална разработка с npx prisma dev — попълва се автоматично
# При Neon — копирайте от neon.tech dashboard
DATABASE_URL=""
DIRECT_URL=""

# NextAuth — генерирайте с: openssl rand -base64 32
AUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Resend — от resend.com (за имейл напомняния)
# При локална разработка може да оставите празно
RESEND_API_KEY=""

# Vercel Cron защита — произволен таен низ
CRON_SECRET=""
```

---

## Полезни команди

```bash
npm run dev              # Стартира dev сървъра
npx prisma dev           # Стартира локална база данни
npx prisma studio        # Визуален преглед на базата данни
npx prisma migrate dev   # Прилага нови миграции локално
npx prisma db seed       # Попълва начални данни
npx prisma migrate reset # Нулира базата (изтрива всички данни!)
```

---

## Структура на проекта

```
src/
├── app/
│   ├── (public)/        # Публични страници (начална, резервация, за нас)
│   ├── вход/            # Login страница
│   ├── admin/           # Admin панел
│   ├── lidl/            # Lidl панел
│   └── api/             # API routes
├── components/
│   ├── public/          # Публични компоненти
│   ├── admin/           # Admin компоненти
│   └── ui/              # shadcn/ui компоненти
└── lib/
    ├── prisma.ts         # Prisma клиент
    ├── capacity.ts       # Логика за капацитет
    └── email.ts          # Имейл функции
prisma/
├── schema.prisma         # Database schema
└── seed.ts              # Начални данни
```

---

## Потребителски роли

| Роля | Достъп |
|------|--------|
| **Admin** | Пълен достъп — резервации, потребители, настройки |
| **Lidl** | Блокиране на дати, управление на капацитет |
| **Анонимен** | Резервации без регистрация |

Admin и Lidl акаунти се създават само от Admin (ръчно или чрез invite link).

---

## Деплой (Vercel)

Проектът е конфигуриран за автоматичен деплой при `git push` към `main`.

### Първоначална настройка

1. Създайте проект в [Vercel](https://vercel.com) и свържете с това GitHub репо
2. Добавете всички environment variables от `.env.local` в Vercel Dashboard
3. При първи деплой изпълнете миграциите:

```bash
npx prisma migrate deploy
```

### Cron job за напомняния

Vercel автоматично изпълнява `/api/cron/reminders` всеки ден в **08:00 UTC**, което изпраща имейл напомняния ден преди резервацията.

---

## Принос към проекта

Инициативата е с нестопанска цел. При въпроси или предложения отворете Issue в GitHub.

---

*Капачки за Бъдеще — Враца*
