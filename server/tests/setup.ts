import { beforeAll, afterAll, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Setup test database
  await prisma.$connect()
})

afterEach(async () => {
  // Clean up test data after each test
  // Order matters due to foreign key constraints
  await prisma.analyticsEvent.deleteMany()
  await prisma.analytics.deleteMany()
  await prisma.product.deleteMany()
  await prisma.live.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

export { prisma }
