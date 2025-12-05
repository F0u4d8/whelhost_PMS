import { getReceipts } from "@/lib/receipts-server-actions";
import ReceiptsClient from "./receipts-client";

export default async function ReceiptsPage() {
  const receipts = await getReceipts();

  return <ReceiptsClient initialReceipts={receipts} />;
}
