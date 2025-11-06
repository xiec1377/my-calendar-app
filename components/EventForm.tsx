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
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";
import { RiFontSize } from "react-icons/ri";
import { BsTextLeft, BsClock, BsArrowDown } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { CalendarEvent } from "@/app/types/calendar";
import { colors } from "@/app/constants/colors";
import { emptyEvent } from "@/app/constants/calendar";

const EventForm = ({
  event,
  setEvent,
  onChange,
  onSubmit,
  onCancel,
  isNew,
}: {
  event: CalendarEvent;
  setEvent: React.Dispatch<React.SetStateAction<CalendarEvent>>;
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
      <div className="flex justify-end w-full">
        <button
          className="text-gray-500 hover:text-blue-700"
          onClick={onCancel}
        >
          <MdClose className="text-gray-500" size={20} />
        </button>
      </div>
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
            className="flex-[1]"
            value={event.startDate}
          />
          {!event.isAllDay && (
            <Input
              id="startTime"
              name="startTime"
              type="time"
              className="flex-[1]"
              onChange={handleStartChange}
              value={event.startTime}
            />
          )}
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
            className="flex-[1]"
            onChange={onChange}
            value={event.endDate}
            min={event.startDate}
          />
          {!event.isAllDay && (
            <Input
              id="endTime"
              name="endTime"
              type="time"
              className="flex-[1]"
              onChange={onChange}
              value={event.endTime}
              min={event.startTime}
            />
          )}
        </div>

        <div className="flex items-end gap-2">
          <span style={{ width: "20px", height: "20px" }} />
          <Input
            type="checkbox"
            id="isAllDay"
            name="isAllDay"
            checked={event.isAllDay || false}
            // onChange={onChange}
            onChange={(e) => {
              const { name, type, checked, value } = e.target;
              setEvent((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
                startTime:
                  name === "isAllDay" && checked ? "00:00" : prev.startTime,
                endTime:
                  name === "isAllDay" && checked ? "23:59" : prev.endTime,
              }));
            }}
            className="h-4 w-4 "
            style={{
              accentColor: "#000000",
            }}
          />
          <Label
            htmlFor="isAllDay"
            className="text-sm font-normal leading-none cursor-pointer"
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
              event.color === name ? "ring-2 ring-black" : ""
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

export default EventForm;
