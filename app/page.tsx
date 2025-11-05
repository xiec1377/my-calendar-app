"use client";

import { useEffect, useState } from "react";
import { Calendar as SmallCalendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import { endOfDay, format } from "date-fns";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";

import { combineDateAndTimeUTC } from "@/lib/dateUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { RiFontSize } from "react-icons/ri";
import {
  BsTextLeft,
  BsClock,
  BsArrowDown,
  BsTrash,
  BsPencil,
} from "react-icons/bs";
import moment from "moment-timezone";

// Components
const CustomTimeGutterHeader = () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetHours = moment.tz(tz).utcOffset() / 60;
  const sign = offsetHours >= 0 ? "+" : "";
  const tzAbbr = `GMT${sign}${offsetHours}`;
  return (
    <div className="rbc-time-gutter-header text-xs text-gray-600 flex items-center justify-center">
      {tzAbbr}
    </div>
  );
};

const CustomHeader = ({ label }: { label: string }) => {
  const [day, date] = label.split(" ");
  return (
    <div className="flex flex-col items-center justify-center h-[40px] leading-none">
      <span>{day}</span>
      <span className="text-lg font-bold">{date}</span>
    </div>
  );
};

const CustomToolbar = ({ label, onNavigate, onView }: any) => {
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
  startTime?: string;
  endTime?: string;
  start: string | Date;
  end: string | Date;
  notes?: string;
  color?: string;
};

const colors: Record<string, string> = {
  red: "#EF4444",
  green: "#22C55E",
  blue: "#3B82F6",
  yellow: "#FACC15",
  purple: "#A855F7",
  orange: "#F97316",
};

// Event Form Component
const EventForm = ({
  event,
  onChange,
  onSubmit,
  onCancel,
  isNew,
}: {
  event: CalendarEvent;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isNew: boolean;
}) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(e); // propagate change to parent state

    if (name === "startDate" || name === "startTime") {
      const startDate = name === "startDate" ? value : event.startDate;
      const startTime = name === "startTime" ? value : event.startTime;

      if (startDate && startTime) {
        const start = new Date(`${startDate}T${startTime}`);
        const newEnd = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

        const endDate = newEnd.toISOString().split("T")[0];
        const endTime = newEnd.toTimeString().slice(0, 5);

        // update endDate and endTime automatically
        onChange({
          target: { name: "endDate", value: endDate },
        } as any);
        onChange({
          target: { name: "endTime", value: endTime },
        } as any);
      }
    }
  };
  return (
    <PopoverContent
      className="w-full flex flex-col gap-y-4"
      side="right"
      align="center"
    >
      <div className="flex items-center gap-2 justify-center w-full">
        <RiFontSize className="text-gray-500" size={20} />
        <Input
          id="title"
          name="title"
          placeholder="Event title"
          value={event.title}
          onChange={onChange}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 justify-center w-full">
          <BsClock className="text-gray-500" size={20} />
          <Input
            id="startDate"
            name="startDate"
            type="date"
            className="flex-[2]"
            onChange={handleStartChange}
            value={event.startDate}
          />
          <Input
            id="startTime"
            name="startTime"
            type="time"
            className="flex-[1]"
            onChange={handleStartChange}
            value={event.startTime}
          />{" "}
        </div>

        <div className="flex items-center gap-2 justify-center w-full">
          <BsArrowDown className="text-gray-500" size={20} />
        </div>

        <div className="flex items-center gap-2 justify-center w-full">
          <span style={{ width: "20px", height: "20px" }} />
          <Input
            id="endDate"
            name="endDate"
            type="date"
            className="flex-[2]"
            onChange={onChange}
            value={event.endDate}
            min={event.startDate}
          />
          <Input
            id="endTime"
            name="endTime"
            type="time"
            className="flex-[1]"
            onChange={onChange}
            value={event.endTime}
            min={event.startTime}
          />
        </div>

        <div className="flex items-end gap-2">
          <span style={{ width: "20px", height: "20px" }} />
          <Input
            type="checkbox"
            id="isAllDay"
            name="isAllDay"
            checked={event.isAllDay || false}
            onChange={onChange}
            className="h-4 w-4 cursor-pointer accent-blue-600"
          />
          <Label
            htmlFor="isAllDay"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            All day
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-center w-full">
        <BsTextLeft className="text-gray-500" size={20} />
        <Input
          id="notes"
          name="notes"
          placeholder="Add notes here..."
          value={event.notes}
          onChange={onChange}
        />
      </div>

      <div className="flex gap-2 mt-2">
        {Object.entries(colors).map(([name, hex]) => (
          <Button
            key={name}
            type="button"
            variant="outline"
            className={`h-8 w-8 p-0 border-2 ${
              event.color === name ? "ring-2 ring-offset-2 ring-black" : ""
            }`}
            style={{
              backgroundColor: hex,
              borderRadius: "50%",
              cursor: "pointer",
            }}
            onClick={() =>
              onChange({ target: { name: "color", value: name } } as any)
            }
            aria-label={name}
          />
        ))}
      </div>

      <div className="flex flex-row justify-end w-full gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" onClick={onSubmit}>
          Save
        </Button>
      </div>
    </PopoverContent>
  );
};

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [event, setEvent] = useState<CalendarEvent>({});
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);

  const localizer = momentLocalizer(moment);
  const formats = {
    dateFormat: "D",
    dayFormat: "ddd D",
    monthHeaderFormat: "MMMM YYYY",
    timeGutterFormat: "h a",
    dayRangeHeaderFormat: ({ start }: { start: Date }) =>
      format(start, "MMMM yyyy"),
    dayHeaderFormat: (date: Date) => format(date, "MMMM d, yyyy"),
  };

  const fetchEvents = async () => {
    console.log("fetching events...heree");
    try {
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
      console.log("fetched events:", data.events);
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

  useEffect(() => {
    console.log("fetche eventgs....");
    fetchEvents();
  }, []);

  // useEffect(() => {
  //   fetchEvents().then((fetched) =>
  //     setEvents((prev) => {
  //       const ids = new Set(fetched.map((e) => e.id));
  //       return [...fetched, ...prev.filter((e) => !ids.has(e.id))];
  //     })
  //   );
  // }, [date]);

  const handleCreateEvent = () => {
    const now = new Date();
    console.log("now:", now);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setEvent({
      title: "",
      startDate: now.toISOString().split("T")[0],
      start: now,
      startTime: now.toTimeString().slice(0, 5),
      end: oneHourLater,
      endDate: oneHourLater.toISOString().split("T")[0],
      endTime: oneHourLater.toTimeString().slice(0, 5),
      notes: "",
      color: "blue",
      isAllDay: false,
    });
    setIsNewEvent(true);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleSelectEvent = async (
    event: CalendarEvent,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      x: rect.right,
      y: rect.top + rect.height / 2,
    });

    setIsNewEvent(false);
    setModalOpen(true);

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("Data:", data);
      console.log("fetched events", data.event);
      const e = data.event;
      const selectedEvent: CalendarEvent = {
        ...e,
        start: new Date(e.start),
        startTime: new Date(e.start).toTimeString().slice(0, 5),
        startDate: new Date(e.start).toISOString().split("T")[0],
        end: new Date(e.end),
        endTime: new Date(e.end).toTimeString().slice(0, 5),
        endDate: new Date(e.end).toISOString().split("T")[0],
      };
      console.log("selectedEvent:", selectedEvent);
      setEvent(selectedEvent);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isNewEvent ? "/api/events" : `/api/events/${event.id}`;
    const method = isNewEvent ? "POST" : "PATCH";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event?.title || "Untitled",
          startDate: event?.startDate,
          start: event.startTime, //combineDateAndTimeUTC(event?.startDate, event?.start),
          endDate: event?.endDate,
          end: event.endTime, // combineDateAndTimeUTC(event?.endDate, event?.end),
          notes: event?.notes,
          color: event?.color,
          isAllDay: event?.isAllDay || false,
        }),
      });

      const data = await res.json();
      console.log(isNewEvent ? "Created:" : "Updated:", data.event);

      // const updatedEvents = [...events, data.event]; // create a new array
      // setEvents((prev) => [...prev, data.event]);

      // setEvents((prev) => [...prev.map(e => ({ ...e })), data.event]);
      const apiEvents = [
        {
          id: 3,
          title: "Project Deadline",
          start: new Date(2025, 9, 5, 9, 0), // October 5, 2025, 9:00 AM
          end: new Date(2025, 9, 5, 9, 30),
          color: "red",
        },
      ];
      const e = data.event;
      const newEvent: CalendarEvent = {
        ...e,
        start: new Date(e.startTime),
        startTime: new Date(e.startTime).toTimeString().slice(0, 5),
        startDate: new Date(e.startTime).toISOString().split("T")[0],
        end: new Date(e.endTime),
        endTime: new Date(e.endTime).toTimeString().slice(0, 5),
        endDate: new Date(e.endTime).toISOString().split("T")[0],
      };

      setEvents((prev) => [...prev, newEvent]);

      // const newEvents = apiEvents.map((e: any) => ({
      //   ...e,
      //   start: new Date(e.start),
      //   end: new Date(e.end),
      // }));
      // setEvents(newEvents);

      console.log("new events:", events);
      // setEvents(updatedEvents);

      // Refresh events
      // await fetchEvents();

      // Add new event to calendar immediately
      // if (isNewEvent) {
      //   setEvents(prev => [
      //     ...prev,
      //     {
      //       id: data.event.id,
      //       title: data.event.title,
      //       start: new Date(data.event.startTime || data.event.start).toISOString(),
      //       end: new Date(data.event.endTime || data.event.end).toISOString(),
      //       notes: data.event.notes,
      //       color: data.event.color,
      //       isAllDay: data.event.isAllDay,
      //     },
      //   ]);
      // } else {
      //   setEvents(prev =>
      //     prev.map(e =>
      //       e.id === event.id
      //         ? {
      //             ...e,
      //             title: data.event.title,
      //             start: new Date(data.event.startTime || data.event.start).toISOString(),
      //             end: new Date(data.event.endTime || data.event.end).toISOString(),
      //             notes: data.event.notes,
      //             color: data.event.color,
      //             isAllDay: data.event.isAllDay,
      //           }
      //         : e
      //     )
      //   );
      // }

      setModalOpen(false);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("Deleted:", data);

      // await fetchEvents();
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setModalOpen(false);
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex w-full h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex h-full flex-col gap-4 p-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateEvent}
        >
          + Create
        </button>

        <SmallCalendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />
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
              timeGutterHeader: CustomTimeGutterHeader,
              week: { header: CustomHeader },
            }}
            onNavigate={(date) => setDate(date)}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: colors[event.color || "blue"],
                color: "white",
                borderRadius: "8px",
                border: "none",
                padding: "2px 6px",
              },
            })}
          />
        </div>

        {event && (
          <Popover
            open={modalOpen}
            onOpenChange={(isOpen) => {
              setModalOpen(isOpen);
              if (!isOpen) {
                setIsEditMode(false);
                setIsNewEvent(false);
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

            {!isEditMode && !isNewEvent ? (
              <PopoverContent className="w-64" side="right" align="center">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <div className="flex gap-2">
                    <button
                      className="text-gray-500 hover:text-blue-700"
                      onClick={() => setIsEditMode(true)}
                    >
                      <BsPencil className="text-gray-500" size={20} />
                    </button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-gray-500 hover:text-red-700">
                          <BsTrash className="text-gray-500" size={20} />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <h3 className="text-center">
                          Are you sure you want to delete this event?
                        </h3>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleDeleteEvent}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {event.notes && (
                  <p className="text-sm text-gray-600">{event.notes}</p>
                )}
                {event.startDate && (
                  <p className="text-sm text-gray-600">{event.startDate}</p>
                )}
                {event.endDate && (
                  <p className="text-sm text-gray-600">{event.endDate}</p>
                )}
              </PopoverContent>
            ) : (
              <EventForm
                event={event}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsEditMode(false);
                  setIsNewEvent(false);
                  if (isNewEvent) setModalOpen(false);
                }}
                isNew={isNewEvent}
              />
            )}
          </Popover>
        )}
      </main>
    </div>
  );
}
