"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
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
// radix

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    // max-w-3xl
    <div className="flex w-full items-start justify-center bg-zinc-50 font-sans dark:bg-black">
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
                  id="event-name"
                  name="name"
                  placeholder="Design machines"
                />
              </div>
              <div className="grid gap-4">
                <Label htmlFor="date">Time</Label>
                <div className="flex flex-row gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-[2] justify-start text-left"
                    >
                      {/* <CalendarIcon className="mr-2 h-4 w-4" /> */}
                      {date ? "10-10-10" : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  id="date"
                  name="date"
                  defaultValue="@peduarte"
                  type="time"
                  className="flex-[1]"
                ></Input>
                -
                <Input
                  id="date"
                  name="date"
                  defaultValue="@peduarte"
                  type="time"
                  className="flex-[1]"
                ></Input>
                </div>
              </div>
              <div className="grid gap-4">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="name"
                  placeholder="Add notes here..."
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm"
          captionLayout="dropdown"
        />
      </div>
      <main className="flex w-full flex-row items-center justify-between bg-white dark:bg-black sm:items-start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border w-full h-full"
        />
      </main>
    </div>
  );
}
