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
import { endOfDay, format, parseISO } from "date-fns";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";

import { BsTextLeft } from "react-icons/bs";
import { LuTrash2 } from "react-icons/lu";
import { LuPencil } from "react-icons/lu";
import { MdError } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import moment from "moment-timezone";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { CalendarEvent } from "@/app/types/calendar";
import EventForm from "./EventForm";
import { colors } from "@/app/constants/colors";

const CustomEvent = ({ event }: any) => {
  return <div className="font-bold">{event.title}</div>;
};
const CustomTimeGutterHeader = () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetHours = moment.tz(tz).utcOffset() / 60;
  const sign = offsetHours >= 0 ? "+" : "";
  const tzAbbr = `GMT${sign}${offsetHours}`;
  return (
    <div className="rbc-time-gutter-header text-xs text-gray-600 flex items-center justify-center h-full w-full text-center">
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
  // const buttonClasses =
  //   "px-2 py-1 bg-transparent border-0 text-sm cursor-pointer focus:outline-none";
  return (
    <div className="rbc-toolbar flex w-full pb-4 m-0">
      <button onClick={() => onNavigate("TODAY")}>Today</button>
      <div className="rbc-btn-group">
        <button id="prev-button" onClick={() => onNavigate("PREV")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-chevron-left size-4 rdp-chevron"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        <span className="rbc-toolbar-label text-2xl">{label}</span>
        <button id="next-button" onClick={() => onNavigate("NEXT")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-chevron-right size-4 rdp-chevron"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </div>
      <div className="rbc-btn-group flex gap-2">
        <button onClick={() => onView("day")}>Day</button>
        <button onClick={() => onView("week")}>Week</button>
        <button onClick={() => onView("month")}>Month</button>
      </div>
    </div>
  );
};

const emptyEvent: CalendarEvent = {
  title: "",
  isAllDay: false,
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  start: "",
  end: "",
  notes: "",
  color: "",
};

const BigCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [event, setEvent] = useState<CalendarEvent>(emptyEvent);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);

  const localizer = momentLocalizer(moment);
  const formats = {
    dateFormat: "D",
    dayFormat: "ddd D",
    monthHeaderFormat: "MMMM YYYY",
    timeGutterFormat: "h A",
    dayRangeHeaderFormat: ({ start }: { start: Date }) =>
      format(start, "MMMM yyyy"),
    dayHeaderFormat: (date: Date) => format(date, "MMMM d, yyyy"),
  };

  const fetchEvents = async () => {
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

  const handleClearEvent = () => {
    setEvent(emptyEvent);
  };

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

      setEvents((prev) => {
        if (isNewEvent) {
          return [...prev, newEvent];
        } else {
          return prev.map((event) =>
            event.id === newEvent.id ? newEvent : event
          );
        }
      });
      console.log("new events:", events);
      setModalOpen(false);
      setIsEditMode(false);
      toast.success(
        `${isNewEvent ? "Created" : "Updated"} event successfully!`,
        {
          duration: 3000,
          style: {
            background: "#5fe89fff",
            color: "#009002ff",
          },
          icon: <FaCheckCircle />,
        }
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete event...", {
        duration: 3000,
        style: {
          background: "#FEE2E2",
          color: "#B91C1C",
        },
        icon: <MdError />,
      });
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
      toast.success("Deleted event successfully!", {
        duration: 3000,
        style: {
          background: "#5fe89fff",
          color: "#009002ff",
        },
        icon: <FaCheckCircle />,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete event...", {
        duration: 3000,
        style: {
          background: "#FEE2E2",
          color: "#B91C1C",
        },
        icon: <MdError />,
      });
    }
  };

  const [selectedColors, setSelectedColors] = useState<string[]>(
    Object.keys(colors)
  );

  const filteredEvents = events.filter((event) =>
    selectedColors.includes(event.color || "")
  );

  return (
    <div className="flex w-full h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex h-full flex-col gap-4 p-8">
        <Button
          className="bg-black text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateEvent}
        >
          + Create
        </Button>
        <SmallCalendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />{" "}
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Filter by color:
          </Label>
          <div className="flex flex-col gap-2 items-start">
            <Label className="flex items-center gap-1 cursor-pointer">
              <Input
                type="checkbox"
                checked={Object.keys(colors).every((key) =>
                  selectedColors.includes(key)
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColors(Object.keys(colors));
                  } else {
                    setSelectedColors([]);
                  }
                }}
                style={{
                  accentColor: "#000000",
                }}
                className="h-4 w-4 accent-gray-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                All
              </span>
            </Label>

            {Object.entries(colors).map(([key, hex]) => (
              <Label
                key={key}
                className="flex items-center gap-1 cursor-pointer"
              >
                <Input
                  type="checkbox"
                  checked={selectedColors.includes(key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedColors((prev) => [...prev, key]);
                    } else {
                      setSelectedColors((prev) =>
                        prev.filter((c) => c !== key)
                      );
                    }
                  }}
                  className="h-4 w-4 cursor-pointer rounded-sm "
                  style={{
                    accentColor: hex,
                  }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {key}
                </span>
              </Label>
            ))}
          </div>
        </div>
      </div>

      <main className="flex w-full flex-row items-center justify-between sm:items-start">
        <div className="mr-8 mt-8 mt-8 h-screen w-full">
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                padding: "1rem 1.25rem",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              },
            }}
          />
          <Calendar
            localizer={localizer}
            events={filteredEvents}
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
              event: CustomEvent,
              // eventWrapper: CustomerEventWrapper,
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

          {!isEditMode && !isNewEvent && event && event.id ? (
            <PopoverContent
              className="w-[300px] flex flex-col gap-1 p-4"
              side="right"
              align="center"
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="rounded-sm"
                  style={{
                    backgroundColor: colors[event.color || "blue"],
                    width: "20px",
                    height: "20px",
                  }}
                />
                <h3 className="text-lg font-bold flex-1">{event.title}</h3>

                <div className="flex gap-2">
                  <button
                    className="text-gray-500 hover:text-blue-700"
                    onClick={() => setIsEditMode(true)}
                  >
                    <LuPencil size={20} color="black" />
                  </button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-gray-500 hover:text-red-700">
                        <LuTrash2 size={20} color="#dd1c1cff" />
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

              <div className="flex items-center gap-2 w-full">
                {/* <BsClock className="text-gray-500" size={20} /> */}
                <span style={{ width: "20px", height: "20px" }} />
                <p className="text-sm text-gray-600 break-words">
                  {event.start &&
                    (() => {
                      const sameDay =
                        event.start &&
                        event.end &&
                        format(event.start, "yyyy-MM-dd") ===
                          format(event.end, "yyyy-MM-dd");

                      if (event.isAllDay) {
                        if (event.end && !sameDay) {
                          return (
                            <>
                              {format(event.start, "MMMM d, yyyy")} –{" "}
                              {format(event.end, "MMMM d, yyyy")}
                            </>
                          );
                        }
                        return format(event.start, "MMMM d, yyyy");
                      }

                      if (event.end) {
                        if (sameDay) {
                          return (
                            <>
                              {format(event.start, "MMMM d, yyyy")},{" "}
                              {format(event.start, "h:mm a")} –{" "}
                              {format(event.end, "h:mm a")}
                            </>
                          );
                        }
                        return (
                          <>
                            {format(event.start, "MMMM d, yyyy, h:mm a")} –{" "}
                            {format(event.end, "MMMM d, yyyy, h:mm a")}
                          </>
                        );
                      }

                      return format(event.start, "MMMM d, yyyy, h:mm a");
                    })()}
                </p>
              </div>

              {event.notes && (
                <div className="flex items-center gap-2 w-full">
                  <BsTextLeft className="text-gray-500" size={20} />
                  {/* <span style={{ width: "20px", height: "20px" }} />  */}
                  <p className="text-sm text-gray-600">{event.notes}</p>
                </div>
              )}
            </PopoverContent>
          ) : (
            <EventForm
              event={event}
              setEvent={setEvent}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsEditMode(false);
                setIsNewEvent(false);
                // handleClearEvent();
                if (isNewEvent) setModalOpen(false);
              }}
              isNew={isNewEvent}
            />
          )}
        </Popover>
      </main>
    </div>
  );
};

export default BigCalendar;
