import { requirePremium } from "@/lib/premium";
import { getGuests } from "@/lib/guests-server-actions";
import GuestsClient from "./guests-client";

export default async function GuestsPage() {
  await requirePremium();
  const guests = await getGuests();

  return <GuestsClient initialGuests={guests} />;
}