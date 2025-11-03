// export default function BigCalendar() {
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const localizer = momentLocalizer(moment);
//   const formats = {
//     dateFormat: "D", // Single digit day (1, 2, 3... instead of 01, 02, 03)
//     dayFormat: "ddd D", // Mon 1, Tue 2, etc.
//     monthHeaderFormat: "MMMM YYYY", // November 2025
//   };

//   return (
//     <div style={{ height: "100vh", width: "100%" }}>
//       <Calendar
//         localizer={localizer}
//         // events={events}
//         startAccessor="start"
//         endAccessor="end"
//         views={["month", "week", "day"]}
//         defaultView="month"
//         formats={formats}
//         components={{
//           toolbar: CustomToolbar,
//         }}
//       />
//     </div>
//   );
// }
