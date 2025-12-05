import { getProperties } from "@/lib/properties-server-actions";
import PropertiesClient from "./properties-client";

export default async function PropertiesPage() {
  const properties = await getProperties();
  
  return <PropertiesClient initialProperties={properties} />;
}