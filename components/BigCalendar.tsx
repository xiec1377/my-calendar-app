import { useEffect, useState } from "react";
import { Calendar as SmallCalendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
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
import { emptyEvent } from "@/app/constants/calendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CustomEvent,
  CustomHeader,
  CustomToolbar,
  CustomTimeGutterHeader,
} from "./CustomCalendarComponents";

const successToast = ({ message }: { message: string }) => {
  toast.success(message, {
    duration: 3000,
    style: { background: "#c2ffdeff", color: "#009002ff" },
    icon: <FaCheckCircle />,
  });
};
const errorToast = ({ message }: { message: string }) => {
  toast.error(message, {
    duration: 3000,
    style: { background: "#ffbbbbff", color: "#dd1c1cff" },
    icon: <MdError />,
  });
};

const BigCalendar = () => {
  const queryClient = useQueryClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [event, setEvent] = useState<CalendarEvent>(emptyEvent);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch(
        `/api/events?date=${encodeURIComponent(
          new Date().toISOString().split("T")[0],
        )}`,
        { method: "GET", headers: { "Content-Type": "application/json" } },
      );
      const data = await res.json();
      return data.events.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: eventDetails } = useQuery({
    queryKey: ["event", selectedEventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${selectedEventId}`);
      const data = await res.json();
      const e = data.event;
      return {
        ...e,
        start: new Date(e.start),
        startTime: new Date(e.start).toTimeString().slice(0, 5),
        startDate: new Date(e.start).toISOString().split("T")[0],
        end: new Date(e.end),
        endTime: new Date(e.end).toTimeString().slice(0, 5),
        endDate: new Date(e.end).toISOString().split("T")[0],
      };
    },
    enabled: selectedEventId !== null,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (eventDetails) {
      setEvent(eventDetails);
      setSelectedEvent(eventDetails);
    }
  }, [eventDetails]);

  const handleCreateEvent = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setEvent({
      title: "",
      start: now,
      startDate: now.toISOString().split("T")[0],
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

  const handleSelectEvent = (event: CalendarEvent, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopoverPosition({
      x: rect.right,
      y: rect.top + rect.height / 2,
    });

    setIsNewEvent(false);
    setModalOpen(true);
    setSelectedEventId(event.id!); // This triggers the query
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const eventMutation = useMutation({
    mutationFn: async ({ endpoint, method, body }: any) => {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save event");
      return res.json();
    },
    onSuccess: (data, variables) => {
      const e = data.event;
      const newEvent: CalendarEvent = {
        ...e,
        start: new Date(e.startTime || e.start),
        startTime: new Date(e.startTime || e.start).toTimeString().slice(0, 5),
        startDate: new Date(e.startTime || e.start).toISOString().split("T")[0],
        end: new Date(e.endTime || e.end),
        endTime: new Date(e.endTime || e.end).toTimeString().slice(0, 5),
        endDate: new Date(e.endTime || e.end).toISOString().split("T")[0],
      };

      queryClient.setQueryData(["events"], (old: CalendarEvent[] = []) => {
        if (variables.isNew) {
          return [...old, newEvent];
        } else {
          return old.map((event) =>
            event.id === newEvent.id ? newEvent : event,
          );
        }
      });

      if (newEvent.id) {
        queryClient.setQueryData(["event", newEvent.id], newEvent);
      }
      setModalOpen(false);
      setIsEditMode(false);
      setIsNewEvent(false);
      successToast({
        message: `${
          variables.isNew ? "Created" : "Updated"
        } event successfully!`,
      });
    },
    onError: () => {
      errorToast({
        message: "Failed to save event...",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isNewEvent ? "/api/events" : `/api/events/${event.id}`;
    const method = isNewEvent ? "POST" : "PATCH";

    eventMutation.mutate({
      endpoint,
      method,
      isNew: isNewEvent,
      body: {
        title: event?.title || "Untitled",
        startDate: event?.startDate,
        start: event.startTime,
        endDate: event?.endDate,
        end: event.endTime,
        notes: event?.notes,
        color: event?.color,
        isAllDay: event?.isAllDay || false,
      },
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: (data, eventId) => {
      queryClient.setQueryData(["events"], (old: CalendarEvent[] = []) =>
        old.filter((e) => e.id !== eventId),
      );
      queryClient.removeQueries({ queryKey: ["event", eventId] });
      setModalOpen(false);
      successToast({
        message: "Deleted event successfully!",
      });
    },
    onError: () => {
      errorToast({
        message: "Failed to delete event...",
      });
    },
  });

  const handleDeleteEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event.id) {
      deleteMutation.mutate(event.id);
    }
  };

  const [selectedColors, setSelectedColors] = useState<string[]>(
    Object.keys(colors),
  );

  const filteredEvents = events.filter((event) =>
    selectedColors.includes(event.color || ""),
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
        />
        <div className="flex flex-col gap-2">
          <Label className="text-gray-700 dark:text-gray-300 font-medium">
            Filter by color:
          </Label>
          <div className="flex flex-col gap-2 items-start">
            <Label className="flex items-center gap-1 cursor-pointer">
              <Input
                type="checkbox"
                checked={Object.keys(colors).every((key) =>
                  selectedColors.includes(key),
                )}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColors(Object.keys(colors));
                  } else {
                    setSelectedColors([]);
                  }
                }}
                style={{ accentColor: "#000000" }}
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
                        prev.filter((c) => c !== key),
                      );
                    }
                  }}
                  className="h-4 w-4 cursor-pointer rounded-sm"
                  style={{ accentColor: hex }}
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
        <div className="mr-8 mt-8 h-screen w-full">
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
            defaultView="week"
            formats={formats}
            components={{
              toolbar: CustomToolbar,
              timeGutterHeader: CustomTimeGutterHeader,
              week: { header: CustomHeader },
              event: CustomEvent,
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
              setSelectedEvent(null);
              setSelectedEventId(null);
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

          {!isEditMode && !isNewEvent && selectedEvent && (
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
                      <DialogTitle />
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
                  <p className="text-sm text-gray-600">{event.notes}</p>
                </div>
              )}
            </PopoverContent>
          )}
          {(isEditMode || isNewEvent) && (
            <EventForm
              event={event}
              setEvent={setEvent}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsEditMode(false);
                setIsNewEvent(false);
                setSelectedEvent(null);
                setSelectedEventId(null);
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
