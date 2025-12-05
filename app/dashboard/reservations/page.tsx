import { getReservationsPageData } from "@/lib/reservations-server-actions";
import ReservationsClient from "./reservations-client";

export default async function ReservationsPage() {
  const pageData = await getReservationsPageData();

  return <ReservationsClient initialData={pageData} />;
}