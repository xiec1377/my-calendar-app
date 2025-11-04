"use client";

import { useEffect, useState } from "react";
import { Calendar as SmallCalendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
// radix

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";

import { combineDateAndTimeUTC } from "@/lib/dateUtils";

const CustomToolbar = ({ label, onNavigate, onView }) => {
  return (
    <div className="rbc-toolbar flex w-full px-4">
      <button onClick={() => onNavigate("TODAY")}>Today</button>
      <div className="rbc-btn-group">
        <button onClick={() => onNavigate("PREV")}>{"<"}</button>
        <span className="rbc-toolbar-label">{label}</span>
        <button onClick={() => onNavigate("NEXT")}>{">"}</button>
      </div>
      <div className="rbc-btn-group flex gap-2">
        <button onClick={() => onView("day")}>Day</button>
        <button onClick={() => onView("week")}>Week</button>
        <button onClick={() => onView("month")}>Month</button>
      </div>
    </div>
  );
};

type CalendarEvent = {
  id?: number;
  title: string;
  isAllDay?: boolean;
  startDate?: string;
  endDate?: string;
  start: string;
  end: string;
  notes?: string;
  colour?: string;
};

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [event, setEvent] = useState<CalendarEvent>({
    title: "",
    start: "",
    end: "",
    notes: "",
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  const handleSelectEvent = async (
    event: CalendarEvent,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      // x: rect.left + rect.width / 2,
      // y: rect.top + rect.height,
      x: rect.right,
      // y: rect.top,
      y: rect.top + rect.height / 2
    });
    setSelectedEvent(event);
    // setAnchorEl(e.currentTarget); // use the clicked element as anchor
    setModalOpen(true);

    // optionally fetch full details
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("data:", data);
      setSelectedEvent(data.event);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const localizer = momentLocalizer(moment);
  const formats = {
    dateFormat: "D", // Single digit day (1, 2, 3... instead of 01, 02, 03)
    dayFormat: "ddd D", // Mon 1, Tue 2, etc.
    monthHeaderFormat: "MMMM YYYY", // November 2025
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("event:", event);
        const res = await fetch(
          `/api/events?date=${encodeURIComponent(
            new Date().toISOString().split("T")[0]
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();
        console.log("FETCH EVENTS", data);
        const newEvents = data.events.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(newEvents);
      } catch (error) {
        console.error("error:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("name:", name, "value:", value);
    setEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setEvent({
      title: "",
      start: "",
      end: "",
      notes: "",
    });
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitting event...");

    try {
      console.log("event----:", event);
      console.log("hereeee:", event?.startDate, event?.start);
      console.log(
        "combineDateAndTimeUTC(event?.startDat",
        combineDateAndTimeUTC(event?.startDate, event?.start)
      );
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event?.title || "Untitled",
          start: combineDateAndTimeUTC(event?.startDate, event?.start),
          end: combineDateAndTimeUTC(event?.endDate, event?.end),
          notes: event?.notes,
          // color: event?.colour,
        }),
      });

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const apiEvents = [
    {
      id: "123451",
      title: "Team Meeting",
      start: new Date("2025-11-02T14:00:00.000Z"), // UTC string
      end: new Date("2025-11-02T15:00:00.000Z"),
      notes: "Discuss project updates",
      color: "red",
    },
    {
      title: "Lunch with Client",
      start: new Date("2025-11-02T14:00:00.000Z"),
      end: new Date("2025-11-02T15:00:00.000Z"),
    },
  ];

  const colours = ["red", "green", "blue", "yellow", "purple", "orange"];
  return (
    // max-w-3xl
    <div className="flex w-full h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex h-full flex-col gap-4 p-8">
        {/* <Button variant="outline">+ Create</Button> */}
        <Dialog>
          <form>
            <DialogTrigger asChild>
              {/* <Button variant="outline">Open Dialog</Button> */}
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                + Create
              </button>
            </DialogTrigger>
            {/* sm:max-w-[425px] */}
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Event</DialogTitle>
                <DialogDescription>Schedule an event.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Design machines"
                  value={event.title}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-4">
                <Label htmlFor="date">Start</Label>
                <div className="flex flex-row gap-2">
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="flex-[2]"
                    onChange={handleChange}
                    value={event.startDate as string}
                  ></Input>
                  <Input
                    id="start"
                    name="start"
                    type="time"
                    className="flex-[1]"
                    onChange={handleChange}
                    value={event.start as string}
                  ></Input>
                </div>
                <Label htmlFor="date">End</Label>
                <div className="flex flex-row gap-2">
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="flex-[2]"
                    onChange={handleChange}
                    value={event.endDate as string}
                  ></Input>
                  <Input
                    id="end"
                    name="end"
                    type="time"
                    className="flex-[1]"
                    onChange={handleChange}
                    value={event.end as string}
                  ></Input>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="checkbox" id="notify" className="h-4 w-4" />
                <Label
                  htmlFor="notify"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  All day
                </Label>
              </div>
              <div className="grid gap-4">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Add notes here..."
                  value={event.notes}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2 mt-2">
                {colours.map((colour) => (
                  <Button
                    name="colour"
                    key={colour}
                    type="button"
                    variant="outline"
                    // className={`h-8 w-8 border-2 hover:opacity-80]`}
                    className={`${
                      event.colour === colour
                        ? "ring-2 ring-offset-2 ring-black"
                        : ""
                    }`}
                    style={{
                      width: "5px",
                      backgroundColor: colour,
                      borderRadius: "100%",
                    }}
                    onClick={() =>
                      handleChange(({
                        target: { name: "colour", value: colour },
                      } as unknown) as React.ChangeEvent<HTMLInputElement>)
                    }
                    aria-label={colour}
                  >
                    {/* {colour} */}
                  </Button>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={handleSubmitEvent}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
        <SmallCalendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />
        {/* <div style={{ height: "600px" }}>
          <Calendar
            localizer={localizer}
            // events={events}
            startAccessor="start"
            endAccessor="end"
            views={"month"}
            defaultView="month"
          />
        </div> */}
      </div>
      <main className="flex w-full flex-row items-center justify-between bg-white dark:bg-black sm:items-start">
        <div style={{ height: "100vh", width: "100%" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day"]}
            defaultView="month"
            formats={formats}
            components={{
              toolbar: CustomToolbar,
            }}
            onSelectEvent={handleSelectEvent}
            // custom colour the events
            eventPropGetter={(event) => {
              const backgroundColor = event.color || "#2563eb"; // fallback blue
              return {
                style: {
                  backgroundColor,
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  padding: "2px 6px",
                },
              };
            }}
          />
        </div>
        {selectedEvent && (
          <Popover open={modalOpen} onOpenChange={setModalOpen}>
            <PopoverTrigger asChild>
              <div
                style={{
                  position: "fixed",
                  left: popoverPosition.x,
                  top: popoverPosition.y,
                  width: 1,
                  height: 1,
                  pointerEvents: "none",
                }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-64" side="right" align="center">
              <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
              {selectedEvent.notes && (
                <p className="text-sm text-gray-600">{selectedEvent.notes}</p>
              )}
              <p className="text-xs mt-2">
                {new Date(selectedEvent.start).toLocaleString()} -{" "}
                {new Date(selectedEvent.end).toLocaleString()}
              </p>
            </PopoverContent>
          </Popover>
        )}
      </main>
    </div>
  );
}
