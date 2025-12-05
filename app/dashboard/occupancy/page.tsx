import { getCalendarData } from "@/lib/calendar-server-actions";
import CalendarClient from "./calendar-client";

export default async function OccupancyPage() {
  const calendarData = await getCalendarData();
  
  return <CalendarClient initialData={calendarData} />;
}