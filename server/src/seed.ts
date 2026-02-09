import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding database...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@megaju.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@megaju.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)

  const user = await prisma.user.create({
    data: {
      email: 'user@megaju.com',
      password: userPassword,
      name: 'Colaborador',
      role: 'COLABORADOR'
    }
  })

  console.log('✅ Regular user created:', user.email)
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
