import { getChannelsData } from "@/lib/channels-server-actions";
import ChannelsClient from "./channels-client";

export default async function ChannelsPage() {
  const data = await getChannelsData();
  
  return <ChannelsClient initialData={data} />;
}