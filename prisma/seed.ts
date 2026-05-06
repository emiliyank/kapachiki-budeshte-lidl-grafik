import { PrismaClient } from '../src/generated/prisma'
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
