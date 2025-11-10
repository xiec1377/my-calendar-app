export type EventDTO = {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  notes: string;
  color: string;
  isAllDay: boolean;
};
