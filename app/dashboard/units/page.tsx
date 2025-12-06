import { requirePremium } from "@/lib/premium";
import { getUnits } from "@/lib/units-server-actions";
import UnitsClient from "./units-client";

export default async function UnitsPage() {
  await requirePremium();
  const units = await getUnits();

  return <UnitsClient initialUnits={units} />;
}