import { requirePremium } from "@/lib/premium";
import { getHotelSettings, getPricingRules, getUserPermissions } from "@/lib/settings-server-actions";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  await requirePremium();
  const hotelSettings = await getHotelSettings();
  const pricingRules = await getPricingRules();
  const userPermissions = await getUserPermissions();

  return (
    <SettingsClient
      hotelSettings={hotelSettings}
      pricingRules={pricingRules}
      userPermissions={userPermissions}
    />
  );
}
