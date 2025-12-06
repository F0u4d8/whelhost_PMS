import { requirePremium } from "@/lib/premium";
import { getInvoices } from "@/lib/invoices-server-actions";
import InvoicesClient from "./invoices-client";

export default async function InvoicesPage() {
  await requirePremium();
  const invoices = await getInvoices();

  return <InvoicesClient initialInvoices={invoices} />;
}
