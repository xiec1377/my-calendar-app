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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";

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
  color?: string;
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);

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
      y: rect.top + rect.height / 2,
    });
    setSelectedEvent(event);
    setEvent(event);
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
      setSelectedEvent(data.dto);
      setEvent(data.dto);
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
    const { name, type, value, checked } = e.target;
    // console.log("name:", name, "value:", type === "checkbox" ? checked : value);

    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCancel = () => {
    setEvent({
      title: "",
      startDate: "",
      start: "",
      endDate: "",
      end: "",
      notes: "",
      color: "",
      isAllDay: false,
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
          color: event?.color,
          isAllDay: event?.isAllDay || false,
        }),
      });

      const data = await res.json();
      console.log(data);
    } catch (error) {
      console.error("error:", error);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitting event...");

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event?.title || "Untitled",
          start: combineDateAndTimeUTC(event?.startDate, event?.start),
          end: combineDateAndTimeUTC(event?.endDate, event?.end),
          notes: event?.notes,
          color: event?.color,
        }),
      });
      const data = await res.json();
      console.log("updated data:", data);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const handleDeleteEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submitting event...");

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("deleted data:", data);
    } catch (error) {
      console.error("Error fetching event:", error);
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

  const colors: Record<string, string> = {
    red: "#EF4444",
    green: "#22C55E",
    blue: "#3B82F6",
    yellow: "#FACC15",
    purple: "#A855F7",
    orange: "#F97316",
  };

  return (
    // max-w-3xl
    <div className="flex w-full h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex h-full flex-col gap-4 p-8">
        {/* <Button variant="outline">+ Create</Button> */}
        <Dialog>
          <form>
            <DialogTrigger asChild>
              {/* <Button variant="outline">Open Dialog</Button> */}
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleCancel}
              >
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
                <Input
                  type="checkbox"
                  id="isAllDay"
                  name="isAllDay"
                  checked={event.isAllDay || false}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer accent-blue-600"
                />
                <Label
                  htmlFor="isAllDay"
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
                {Object.entries(colors).map(([name, hex]) => (
                  <Button
                    key={name}
                    name="color"
                    type="button"
                    variant="outline"
                    className={`h-8 w-8 p-0 border-2 ${
                      event.color === name
                        ? "ring-2 ring-offset-2 ring-black"
                        : ""
                    }`}
                    style={{
                      backgroundColor: hex,
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleChange(({
                        target: { name: "color", value: name },
                      } as unknown) as React.ChangeEvent<HTMLInputElement>)
                    }
                    aria-label={name}
                  />
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={handleSubmitEvent}>
                  Save
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
            date={date}
            defaultView="month"
            formats={formats}
            components={{
              toolbar: CustomToolbar,
            }}
            onSelectEvent={handleSelectEvent}
            // custom color the events
            eventPropGetter={(event) => {
              return {
                style: {
                  backgroundColor: colors[event.color || "blue"],
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  padding: "2px 6px",
                },
              };
            }}
          />
        </div>
        {event && (
          <Popover
            open={modalOpen}
            onOpenChange={(isOpen) => {
              setModalOpen(isOpen);
              if (!isOpen) {
                setIsEditMode(false); // reset edit mode when popover closes
              }
            }}
          >
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
            {deleteModalOpen && (
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
                      <Input
                        type="checkbox"
                        id="isAllDay"
                        name="isAllDay"
                        checked={event.isAllDay || false}
                        onChange={handleChange}
                        className="h-4 w-4 cursor-pointer accent-blue-600"
                      />
                      <Label
                        htmlFor="isAllDay"
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
                      {Object.entries(colors).map(([name, hex]) => (
                        <Button
                          key={name}
                          name="color"
                          type="button"
                          variant="outline"
                          className={`h-8 w-8 p-0 border-2 ${
                            event.color === name
                              ? "ring-2 ring-offset-2 ring-black"
                              : ""
                          }`}
                          style={{
                            backgroundColor: hex,
                            borderRadius: "50%",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleChange(({
                              target: { name: "color", value: name },
                            } as unknown) as React.ChangeEvent<HTMLInputElement>)
                          }
                          aria-label={name}
                        />
                      ))}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" onClick={handleSubmitEvent}>
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            )}
            {!isEditMode ? (
              <PopoverContent className="w-64" side="right" align="center">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">
                    {event.title} {event.isAllDay}{" "}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      className="text-gray-500 hover:text-blue-700"
                      onClick={() => setIsEditMode(true)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <Dialog>
                      <form>
                        <DialogTrigger asChild>
                          <button className="text-gray-500 hover:text-red-700">
                            <FontAwesomeIcon
                              icon={faTrash}
                              onClick={() => setDeleteModalOpen(true)}
                            />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            {/* <DialogTitle className="text-center">
                              Are you sure you want to delete this event?
                            </DialogTitle> */}
                            {/* <DialogDescription>
                              Schedule an event.
                            </DialogDescription> */}
                          </DialogHeader>
                          <h3 className="text-center">
                            Are you sure you want to delete this event?
                          </h3>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteModalOpen(false)}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleDeleteEvent}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </form>
                    </Dialog>
                  </div>
                </div>

                {event.notes && (
                  <p className="text-sm text-gray-600">{event.notes}</p>
                )}
                <p className="text-xs mt-2">
                  {/* {event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : ''}  */}
                  {/* {event?.startDate && (
                    <p className="text-xs mt-2">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  )}
                   */}
                  {event.startDate}
                </p>
              </PopoverContent>
            ) : (
              <PopoverContent className="w-full" side="right" align="center">
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
                      value={
                        event.startDate
                          ? new Date(event.startDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      // value={new Date(event.start).toISOString().split("T")[0]}
                    ></Input>
                    <Input
                      id="start"
                      name="start"
                      type="time"
                      className="flex-[1]"
                      onChange={handleChange}
                      value={
                        event.start
                          ? new Date(event.start).toTimeString().slice(0, 5)
                          : ""
                      }
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
                      value={
                        event.endDate
                          ? new Date(event.endDate).toISOString().split("T")[0]
                          : ""
                      }
                    ></Input>
                    <Input
                      id="end"
                      name="end"
                      type="time"
                      className="flex-[1]"
                      onChange={handleChange}
                      value={
                        event.end
                          ? new Date(event.end).toTimeString().slice(0, 5)
                          : ""
                      }
                    ></Input>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="checkbox"
                    id="isAllDay"
                    name="isAllDay"
                    checked={event.isAllDay || false}
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                  <Label
                    htmlFor="isAllDay"
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
                  {Object.entries(colors).map(([name, hex]) => (
                    <Button
                      key={name}
                      name="color"
                      type="button"
                      variant="outline"
                      className={`h-8 w-8 p-0 border-2 ${
                        event.color === name
                          ? "ring-2 ring-offset-2 ring-black"
                          : ""
                      }`}
                      style={{
                        backgroundColor: hex,
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleChange(({
                          target: { name: "color", value: name },
                        } as unknown) as React.ChangeEvent<HTMLInputElement>)
                      }
                      aria-label={name}
                    />
                  ))}
                </div>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleUpdateEvent}>
                  Save
                </Button>
              </PopoverContent>
            )}{" "}
          </Popover>
        )}
      </main>
    </div>
  );
}
