import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { PrismaClient } from "@/lib/generated/prisma";

// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

import { startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  console.log('id in get one:', id)
  const event = await prisma.calendarEvent.findUnique({ where: { id } })
  console.log('event in get one:,', event)
  if (!event)
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  return NextResponse.json({ event })
}
