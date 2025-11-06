
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";
import moment from "moment-timezone";


export const CustomEvent = ({ event }: any) => {
  return <div className="font-bold">{event.title}</div>;
};
export const CustomTimeGutterHeader = () => {
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

export const CustomHeader = ({ label }: { label: string }) => {
  const [day, date] = label.split(" ");
  return (
    <div className="flex flex-col items-center justify-center h-[40px] leading-none">
      <span>{day}</span>
      <span className="text-lg font-bold">{date}</span>
    </div>
  );
};

export const CustomToolbar = ({ label, onNavigate, onView }: any) => {
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