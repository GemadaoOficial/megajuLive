import bcrypt from 'bcryptjs'
import prisma from '../utils/prisma.js'

async function seedUsers() {
  try {
    console.log('Verificando usuários existentes...')

    // Check if admin exists
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@megaju.com' },
    })

    if (!adminExists) {
      console.log('Criando usuário admin...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: 'admin@megaju.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      })
      console.log('✓ Admin criado: admin@megaju.com / admin123')
    } else {
      console.log('✓ Admin já existe: admin@megaju.com')
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email: 'user@megaju.com' },
    })

    if (!userExists) {
      console.log('Criando usuário colaborador...')
      const hashedPassword = await bcrypt.hash('user123', 10)
      await prisma.user.create({
        data: {
          name: 'Colaborador Teste',
          email: 'user@megaju.com',
          password: hashedPassword,
          role: 'COLABORADOR',
        },
      })
      console.log('✓ User criado: user@megaju.com / user123')
    } else {
      console.log('✓ User já existe: user@megaju.com')
    }

    console.log('\nUsuários de teste prontos!')
    console.log('Admin: admin@megaju.com / admin123')
    console.log('User: user@megaju.com / user123')
  } catch (error) {
    console.error('Erro ao criar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()
