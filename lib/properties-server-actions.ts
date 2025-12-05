"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export type PropertyType = "hotel" | "apartments" | "resort" | "villa";
export type PropertyStatus = "active" | "inactive";

export interface Property {
  id: string;
  name: string;
  nameAr: string;
  type: PropertyType;
  address: string;
  city: string;
  country: string;
  unitsCount: number;
  status: PropertyStatus;
  channelConnected: boolean;
  image?: string;
}

export interface PropertyFormData {
  name: string;
  nameAr: string;
  type: PropertyType;
  address: string;
  city: string;
  country: string;
  unitsCount: number;
  status: PropertyStatus;
  channelConnected: boolean;
}

export async function getProperties(): Promise<Property[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First try to get with all expected columns, if that fails, use basic columns
  const { data, error: fullError } = await supabase
    .from("hotels")
    .select("id, name, address, city, country, type, units_count, status, name_ar")
    .eq("owner_id", user.id);

  if (fullError) {
    console.warn("Could not fetch with full schema, using basic schema:", fullError.message);

    // Fallback to basic columns only
    const { data: basicData, error: basicError } = await supabase
      .from("hotels")
      .select("id, name, address, city, country")
      .eq("owner_id", user.id);

    if (basicError) {
      console.error("Error fetching basic properties:", basicError);
      throw new Error(`Failed to fetch properties: ${basicError.message}`);
    }

    if (!basicData) {
      console.warn("No data returned from Supabase query");
      return [];
    }

    // Map the data to match the Property interface format with default values
    return basicData.map(item => ({
      id: item.id,
      name: item.name,
      nameAr: item.name, // Use the same name if no Arabic name available
      type: "hotel" as PropertyType, // Default type
      address: item.address || "",
      city: item.city || "",
      country: item.country || "السعودية",
      unitsCount: 0, // Default units count
      status: "active" as PropertyStatus, // Default status
      channelConnected: false,
      image: undefined,
    }));
  }

  if (!data) {
    console.warn("No data returned from Supabase query");
    return [];
  }

  // Map the data to match the Property interface format
  return data.map(item => ({
    id: item.id,
    name: item.name,
    nameAr: item.name_ar || item.name,
    type: (item.type || "hotel") as PropertyType,
    address: item.address || "",
    city: item.city || "",
    country: item.country || "السعودية",
    unitsCount: item.units_count || 0,
    status: (item.status || "active") as PropertyStatus,
    channelConnected: false, // Placeholder - would need to implement proper channel connection tracking
    image: undefined,
  }));
}

export async function addProperty(formData: PropertyFormData): Promise<Property> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First try to insert with all fields, if that fails, use basic fields
  const insertData: any = {
    owner_id: user.id,
    name: formData.name,
    address: formData.address,
    city: formData.city,
    country: formData.country,
  };

  // Only add optional fields if they exist in the schema
  if (formData.nameAr) insertData.name_ar = formData.nameAr;
  if (formData.type) insertData.type = formData.type;
  if (formData.unitsCount !== undefined) insertData.units_count = formData.unitsCount;
  if (formData.status) insertData.status = formData.status;

  const { data, error } = await supabase
    .from("hotels")
    .insert([insertData])
    .select("id, name, name_ar, address, city, country, type, units_count, status")
    .single();

  if (error) {
    console.warn("Error adding property with full schema, trying basic schema:", error.message);

    // Fallback to insert with only basic fields
    const basicInsertData = {
      owner_id: user.id,
      name: formData.name,
      address: formData.address,
      city: formData.city,
      country: formData.country,
    };

    const { data: basicData, error: basicError } = await supabase
      .from("hotels")
      .insert([basicInsertData])
      .select("id, name, address, city, country")
      .single();

    if (basicError) {
      console.error("Error adding property with basic schema:", basicError);
      throw new Error(`Failed to add property: ${basicError.message}`);
    }

    // Return the basic data with default values
    return {
      id: basicData.id,
      name: basicData.name,
      nameAr: formData.nameAr || basicData.name,
      type: formData.type || "hotel",
      address: basicData.address || "",
      city: basicData.city || "",
      country: basicData.country || "السعودية",
      unitsCount: formData.unitsCount || 0,
      status: formData.status || "active",
      channelConnected: false,
      image: undefined,
    };
  }

  // Map the response to match the Property interface
  return {
    id: data.id,
    name: data.name,
    nameAr: data.name_ar || formData.nameAr || data.name,
    type: (data.type || formData.type || "hotel") as PropertyType,
    address: data.address || "",
    city: data.city || "",
    country: data.country || "السعودية",
    unitsCount: data.units_count || formData.unitsCount || 0,
    status: (data.status || formData.status || "active") as PropertyStatus,
    channelConnected: false,
    image: undefined,
  };
}

export async function updateProperty(id: string, formData: PropertyFormData): Promise<Property> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Create update object with all fields
  const updateData: any = {
    name: formData.name,
    address: formData.address,
    city: formData.city,
    country: formData.country,
  };

  // Only add optional fields if they exist
  if (formData.nameAr !== undefined) updateData.name_ar = formData.nameAr;
  if (formData.type !== undefined) updateData.type = formData.type;
  if (formData.unitsCount !== undefined) updateData.units_count = formData.unitsCount;
  if (formData.status !== undefined) updateData.status = formData.status;

  const { data, error } = await supabase
    .from("hotels")
    .update(updateData)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, name, name_ar, address, city, country, type, units_count, status")
    .single();

  if (error) {
    console.warn("Error updating property with full schema, trying basic schema:", error.message);

    // Fallback: update only basic fields
    const basicUpdateData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      country: formData.country,
    };

    const { data: basicData, error: basicError } = await supabase
      .from("hotels")
      .update(basicUpdateData)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id, name, address, city, country")
      .single();

    if (basicError) {
      console.error("Error updating property with basic schema:", basicError);
      throw new Error(`Failed to update property: ${basicError.message}`);
    }

    // Return the basic data with default values
    return {
      id: basicData.id,
      name: basicData.name,
      nameAr: formData.nameAr || basicData.name,
      type: formData.type || "hotel",
      address: basicData.address || "",
      city: basicData.city || "",
      country: basicData.country || "السعودية",
      unitsCount: formData.unitsCount || 0,
      status: formData.status || "active",
      channelConnected: false,
      image: undefined,
    };
  }

  // Map the response to match the Property interface
  return {
    id: data.id,
    name: data.name,
    nameAr: data.name_ar || formData.nameAr || data.name,
    type: (data.type || formData.type || "hotel") as PropertyType,
    address: data.address || "",
    city: data.city || "",
    country: data.country || "السعودية",
    unitsCount: data.units_count || formData.unitsCount || 0,
    status: (data.status || formData.status || "active") as PropertyStatus,
    channelConnected: false,
    image: undefined,
  };
}

export async function deleteProperty(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  const { error } = await supabase
    .from("hotels")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error deleting property:", error);
    throw new Error("Failed to delete property");
  }
}