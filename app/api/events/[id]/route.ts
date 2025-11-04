import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// import { PrismaClient } from "@/lib/generated/prisma";

// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

import { startOfDay, endOfDay, parseISO } from 'date-fns'
import { start } from 'repl'

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

  const dto = {
    id: event.id,
    title: event.title,
    startDate: event.startTime ? event.startTime : '', // send ISO string
    // startDate: event.startTime
    //   ? event.startTime.toISOString().split('T')[0]
    //   : '',
    start: event.startTime ? event.startTime : '',
    endDate: event.endTime ? event.endTime : '',
    end: event.endTime ? event.endTime : '',

    // startDate: event.startTime
    //   ? new Date(event.startTime).toISOString().split('T')[0]
    //   : '',
    // start: event.startTime
    //   ? new Date(event.startTime).toTimeString().slice(0, 5)
    //   : '',
    // endDate: event.endTime
    //   ? new Date(event.endTime).toISOString().split('T')[0]
    //   : '',
    // end: event.endTime
    //   ? new Date(event.endTime).toTimeString().slice(0, 5)
    //   : '',
    notes: event.notes || '',
    color: event.color || 'blue',
    isAllDay: event.isAllDay || false,
  }

  console.log('startdate:', dto.startDate, 'start:', dto.start)

  return NextResponse.json({ dto })
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { title, startTime, endTime, notes, color } = body

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Update event
    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: title ?? existingEvent.title,
        startTime: startTime ? new Date(startTime) : existingEvent.startTime,
        endTime: endTime ? new Date(endTime) : existingEvent.endTime,
        notes: notes ?? existingEvent.notes,
        color: color ?? existingEvent.color,
        isAllDay: body.isAllDay ?? existingEvent.isAllDay,
      },
    })

    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    await prisma.calendarEvent.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Event deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 },
    )
  }
}
