import { getGuests } from "@/lib/guests-server-actions";
import GuestsClient from "./guests-client";

export default async function GuestsPage() {
  const guests = await getGuests();
  
  return <GuestsClient initialGuests={guests} />;
}