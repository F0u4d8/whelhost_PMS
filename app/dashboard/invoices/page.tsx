import { getInvoices } from "@/lib/invoices-server-actions";
import InvoicesClient from "./invoices-client";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return <InvoicesClient initialInvoices={invoices} />;
}
