import { requirePremium } from "@/lib/premium";
import { getCalendarData } from "@/lib/calendar-server-actions";
import CalendarClient from "./calendar-client";

export default async function OccupancyPage() {
  await requirePremium();
  const calendarData = await getCalendarData();

  return <CalendarClient initialData={calendarData} />;
}