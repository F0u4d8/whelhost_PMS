// app/dashboard/billing/page.tsx

import { redirect } from "next/navigation";

export default function BillingPage() {
  // Redirect to the billing reports page since that's where the billing functionality is implemented
  redirect('/dashboard/reports/billing');
}