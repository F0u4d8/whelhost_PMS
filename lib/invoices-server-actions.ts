"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Invoice {
  id: string;
  date: string;
  guest: string;
  contractNumber: string;
  subtotal: number;
  vat: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  createdAt: string;
  dueDate?: string;
  guestId?: string;
  reservationId?: string;
}

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient();
  const user = await requireAuth();

  // First get the user's hotels
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    console.error("Error fetching user hotels:", hotelError);
    return [];
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  // Get invoices for the user's hotels - try full schema first, then basic
  // Since there might not be a dedicated invoices table, we might need to construct
  // invoices from payments or bookings data
  let invoices: Invoice[] = [];

  // First, try to get from an invoices table if it exists
  const { data: invoicesData, error: invoicesError } = await supabase
    .from("invoices")
    .select(`
      id,
      date,
      guest_id,
      contract_number,
      subtotal,
      vat,
      total,
      status,
      created_at,
      due_date
    `)
    .in("hotel_id", hotelIds);

  if (invoicesError) {
    console.warn("Error fetching invoices with full schema:", invoicesError.message);
    
    // Fallback: If no invoices table exists, try to create invoices from payments
    // This assumes there might be a payments table that we can use
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          created_at,
          reservation_id,
          guest_id,
          payment_method,
          status
        `)
        .in("hotel_id", hotelIds);

      if (paymentsError) {
        console.warn("Error fetching payments:", paymentsError.message);
        // If no payments table exists either, return an empty array
        return [];
      } else {
        // Create invoice-like objects from payment data
        for (const payment of paymentsData) {
          // Get guest information
          let guestName = "Guest";
          if (payment.guest_id) {
            const { data: guestData, error: guestError } = await supabase
              .from("guests")
              .select("first_name, last_name")
              .eq("id", payment.guest_id)
              .single();
            
            if (!guestError && guestData) {
              guestName = `${guestData.first_name} ${guestData.last_name}`.trim() || "Guest";
            }
          }
          
          // Create a temporary invoice object
          invoices.push({
            id: payment.id,
            date: payment.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            guest: guestName,
            contractNumber: payment.reservation_id || payment.id,
            subtotal: payment.amount,
            vat: 0, // Calculate VAT if needed
            total: payment.amount,
            status: payment.status === 'completed' ? 'paid' : payment.status === 'pending' ? 'pending' : 'pending',
            createdAt: payment.created_at || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.warn("Error processing payments data:", error);
      return [];
    }
  } else {
    // Process the invoices data
    for (const invoice of invoicesData) {
      // Get guest information
      let guestName = "Guest";
      if (invoice.guest_id) {
        const { data: guestData, error: guestError } = await supabase
          .from("guests")
          .select("first_name, last_name")
          .eq("id", invoice.guest_id)
          .single();
        
        if (!guestError && guestData) {
          guestName = `${guestData.first_name} ${guestData.last_name}`.trim() || "Guest";
        }
      }
      
      invoices.push({
        id: invoice.id,
        date: invoice.date || invoice.created_at?.split('T')[0],
        guest: guestName,
        contractNumber: invoice.contract_number || invoice.id,
        subtotal: invoice.subtotal || 0,
        vat: invoice.vat || 0,
        total: invoice.total || 0,
        status: (invoice.status as Invoice["status"]) || "pending",
        createdAt: invoice.created_at || new Date().toISOString(),
        dueDate: invoice.due_date,
      });
    }
  }

  return invoices;
}

export async function addInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to link the invoice
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  // Try to insert into the invoices table
  try {
    const insertData: any = {
      hotel_id: userHotels[0].id,
      date: invoiceData.date,
      guest_id: invoiceData.guestId || null,
      contract_number: invoiceData.contractNumber,
      subtotal: invoiceData.subtotal,
      vat: invoiceData.vat,
      total: invoiceData.total,
      status: invoiceData.status,
      due_date: invoiceData.dueDate || null,
    };

    // Try to insert with all fields first
    const { data, error } = await supabase
      .from("invoices")
      .insert([insertData])
      .select(`
        id,
        date,
        guest_id,
        contract_number,
        subtotal,
        vat,
        total,
        status,
        created_at,
        due_date
      `)
      .single();

    if (error) {
      console.error("Error adding invoice:", error);
      throw new Error("Failed to add invoice: " + error.message);
    }

    // Get guest information
    let guestName = "Guest";
    if (data.guest_id) {
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("first_name, last_name")
        .eq("id", data.guest_id)
        .single();
      
      if (!guestError && guestData) {
        guestName = `${guestData.first_name} ${guestData.last_name}`.trim() || "Guest";
      }
    }
    
    // Return the created invoice
    return {
      id: data.id,
      date: data.date || data.created_at?.split('T')[0],
      guest: guestName,
      contractNumber: data.contract_number || data.id,
      subtotal: data.subtotal || 0,
      vat: data.vat || 0,
      total: data.total || 0,
      status: (data.status as Invoice["status"]) || "pending",
      createdAt: data.created_at || new Date().toISOString(),
      dueDate: data.due_date || undefined,
      guestId: data.guest_id || undefined,
    };
  } catch (error) {
    console.error("Error adding invoice:", error);
    throw new Error("Failed to add invoice: " + (error as Error).message);
  }
}

export async function updateInvoice(id: string, invoiceData: Partial<Omit<Invoice, 'id' | 'createdAt'>>): Promise<Invoice> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  try {
    // Prepare update data
    const updateData: any = {};
    if (invoiceData.date !== undefined) updateData.date = invoiceData.date;
    if (invoiceData.guestId !== undefined) updateData.guest_id = invoiceData.guestId;
    if (invoiceData.contractNumber !== undefined) updateData.contract_number = invoiceData.contractNumber;
    if (invoiceData.subtotal !== undefined) updateData.subtotal = invoiceData.subtotal;
    if (invoiceData.vat !== undefined) updateData.vat = invoiceData.vat;
    if (invoiceData.total !== undefined) updateData.total = invoiceData.total;
    if (invoiceData.status !== undefined) updateData.status = invoiceData.status;
    if (invoiceData.dueDate !== undefined) updateData.due_date = invoiceData.dueDate;

    // Try to update the invoice
    const { data, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .in("hotel_id", hotelIds)
      .select(`
        id,
        date,
        guest_id,
        contract_number,
        subtotal,
        vat,
        total,
        status,
        created_at,
        due_date
      `)
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      throw new Error("Failed to update invoice: " + error.message);
    }

    // Get guest information
    let guestName = "Guest";
    if (data.guest_id) {
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("first_name, last_name")
        .eq("id", data.guest_id)
        .single();
      
      if (!guestError && guestData) {
        guestName = `${guestData.first_name} ${guestData.last_name}`.trim() || "Guest";
      }
    }
    
    // Return the updated invoice
    return {
      id: data.id,
      date: data.date || data.created_at?.split('T')[0],
      guest: guestName,
      contractNumber: data.contract_number || data.id,
      subtotal: data.subtotal || 0,
      vat: data.vat || 0,
      total: data.total || 0,
      status: (data.status as Invoice["status"]) || "pending",
      createdAt: data.created_at || new Date().toISOString(),
      dueDate: data.due_date || undefined,
      guestId: data.guest_id || undefined,
    };
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw new Error("Failed to update invoice: " + (error as Error).message);
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to verify authorization
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  const hotelIds = userHotels.map(hotel => hotel.id);

  try {
    // Delete the invoice
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .in("hotel_id", hotelIds);

    if (error) {
      console.error("Error deleting invoice:", error);
      throw new Error("Failed to delete invoice: " + error.message);
    }
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw new Error("Failed to delete invoice: " + (error as Error).message);
  }
}