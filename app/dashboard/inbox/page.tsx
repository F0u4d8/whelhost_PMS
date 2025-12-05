import { getConversations } from "@/lib/messaging-server-actions";
import MessagingClient from "./messaging-client";

export default async function InboxPage() {
  const conversations = await getConversations();
  
  return <MessagingClient initialConversations={conversations} />;
}