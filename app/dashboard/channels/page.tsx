import { requirePremium } from "@/lib/premium";
import { getChannelsData } from "@/lib/channels-server-actions";
import ChannelsClient from "./channels-client";

export default async function ChannelsPage() {
  await requirePremium();
  const data = await getChannelsData();

  return <ChannelsClient initialData={data} />;
}