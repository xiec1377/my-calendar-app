
export type CalendarEvent = {
  id?: string;
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
