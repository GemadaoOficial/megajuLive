import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopee.com' },
    update: {},
    create: {
      email: 'admin@shopee.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create collaborator user
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@shopee.com' },
    update: {},
    create: {
      email: 'user@shopee.com',
      name: 'Colaborador Teste',
      password: userPassword,
      role: 'COLABORADOR',
    },
  })

  // Delete existing tutorials and recreate
  await prisma.tutorial.deleteMany()

  // Create tutorials
  await prisma.tutorial.createMany({
    data: [
      {
        title: 'Como Comecar na Shopee Live',
        description: 'Aprenda os primeiros passos para se tornar um streamer de sucesso.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: '# Introducao\n\nBem-vindo ao seu primeiro tutorial!\n\n## Topicos\n\n1. Configurando sua conta\n2. Preparando o ambiente\n3. Iniciando sua primeira live',
        order: 1,
      },
      {
        title: 'Tecnicas de Vendas ao Vivo',
        description: 'Domine as melhores estrategias para aumentar suas vendas.',
        content: '# Tecnicas de Vendas\n\n1. Conheca seu produto\n2. Engaje sua audiencia\n3. Crie urgencia\n4. Ofereca promocoes exclusivas',
        order: 2,
      },
      {
        title: 'Configurando seu Setup',
        description: 'Monte o ambiente perfeito para suas transmissoes.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        content: '# Setup Ideal\n\n## Equipamentos Recomendados\n\n- Camera HD\n- Microfone de qualidade\n- Iluminacao adequada\n- Internet estavel',
        order: 3,
      },
    ],
  })

  console.log('Seed completed!')
  console.log('Admin: admin@shopee.com / admin123')
  console.log('User: user@shopee.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
