import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    const now = await prisma.$queryRaw`SELECT NOW()`
    console.log('✅ Connected to DB, current time:', now)
  } catch (error) {
    console.error('❌ DB connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
