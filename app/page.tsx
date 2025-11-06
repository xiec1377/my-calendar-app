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
  BsPencilFill,
  BsFillTrashFill,
} from "react-icons/bs";
import { LuTrash2 } from "react-icons/lu";
import { LuPencil } from "react-icons/lu";
import { MdError } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import moment from "moment-timezone";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { CalendarEvent } from "@/app/types/calendar";
import BigCalendar from "@/components/BigCalendar";


export default function Home() {
  return <BigCalendar />;
}
