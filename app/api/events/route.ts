import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { PrismaClient } from "@/lib/generated/prisma";

// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

import { startOfDay, endOfDay, parseISO } from 'date-fns'

// GET: Return all events (optional, for testing)
export async function GET(req: Request) {
  console.log('here')
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')
    console.log('dateparam::::', dateParam)
    if (!dateParam)
      return NextResponse.json(
        { error: 'Missing date parameter' },
        { status: 400 },
      )

    const dayStart = startOfDay(parseISO(dateParam))
    const dayEnd = endOfDay(parseISO(dateParam))
    console.log('dayStart::::', dayStart, 'dayEnd::::', dayEnd)
    console.log('new date::::', new Date())
    const events = await prisma.calendarEvent
      .findMany
      // {
      // where: {
      //   startTime: {
      //     gte: dayStart,
      //     lte: dayEnd,
      //   },
      // },
      // orderBy: { startTime: 'asc' },
      // }
      ()
    console.log('eventss::::::', events)

    const dto = events.map((e) => ({
      id: e.id,
      title: e.title,
      start: e.startTime.toISOString(), 
      end: new Date(e.endTime).toISOString(), 
      notes: e.notes || '',
    }))

    return NextResponse.json({ events: dto })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// POST: Add new event
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('body---', body)
    const { title, start, end, notes } = body

    // if (!title || !start || !end) {y
    //   return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    // }

    console.log('current time:', new Date())
    console.log('start:', start, new Date(start))
    console.log('end:', end)

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title: title,
        startTime: start,
        endTime: end,
        notes: notes || '',
      },
    })

    console.log('newEvent:', newEvent)

    return NextResponse.json({
      message: 'Event added successfully',
      event: newEvent,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add event' }, { status: 500 })
  }
}
