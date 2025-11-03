/**
 * Combines a date string (YYYY-MM-DD) and time string (HH:mm)
 * into a full UTC ISO string (e.g. "2025-11-02T23:53:09.623Z")
 */
export function combineDateAndTimeUTC(
  dateStr: string,
  timeStr: string,
): string | null {
  console.log('here')
  if (!dateStr || !timeStr) return null
  console.log('dateStr:', dateStr, 'timeStr:', timeStr)

  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)

  console.log('another year')

  // Create Date in local time
  const localDate = new Date(year, month - 1, day, hours, minutes)

  console.log('localDate.toISOString():', localDate)
  // Convert to UTC ISO string
  return localDate.toISOString()
}
