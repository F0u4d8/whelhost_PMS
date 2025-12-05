"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export interface Receipt {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  method: string;
  reservationNumber: string;
  notes: string;
  user: string;
  createdAt: string;
}

export async function getReceipts(): Promise<Receipt[]> {
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

  // Get receipts for the user's hotels - try different table possibilities
  let receipts: Receipt[] = [];

  // First try to get from payments table (if receipts are stored as payments)
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      payment_method,
      reservation_id,
      created_at,
      status
    `)
    .in("hotel_id", hotelIds);

  if (paymentsError) {
    console.warn("Error fetching payments:", paymentsError.message);
    
    // Try to get from a receipts table if it exists
    try {
      const { data: receiptsData, error: receiptsError } = await supabase
        .from("receipts")
        .select(`
          id,
          amount,
          type,
          payment_method,
          reservation_id,
          notes,
          created_by,
          created_at
        `)
        .in("hotel_id", hotelIds);

      if (receiptsError) {
        console.warn("Error fetching receipts:", receiptsError.message);
        // If no receipts table exists, return an empty array
        return [];
      } else {
        // Process receipts data
        for (const receipt of receiptsData) {
          // Get user information
          let userName = "User";
          if (receipt.created_by) {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", receipt.created_by)
              .single();
            
            if (!userError && userData) {
              userName = userData.full_name || "User";
            }
          }
          
          receipts.push({
            id: receipt.id,
            date: receipt.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            type: receipt.type || (receipt.amount >= 0 ? "income" : "expense"),
            amount: Math.abs(receipt.amount || 0),
            method: receipt.payment_method || "Unknown",
            reservationNumber: receipt.reservation_id || "N/A",
            notes: receipt.notes || "",
            user: userName,
            createdAt: receipt.created_at || new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.warn("Receipts table access error:", error);
      return [];
    }
  } else {
    // Process payments data as receipts
    for (const payment of paymentsData) {
      // Get user information - using the current user for simplicity
      receipts.push({
        id: payment.id,
        date: payment.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        type: payment.amount >= 0 ? "income" : "expense",
        amount: Math.abs(payment.amount || 0),
        method: payment.payment_method || "Unknown",
        reservationNumber: payment.reservation_id || "N/A",
        notes: "Payment record",
        user: user.user_metadata?.full_name || user.email || "Current User",
        createdAt: payment.created_at || new Date().toISOString(),
      });
    }
  }

  return receipts;
}

export async function addReceipt(receiptData: Omit<Receipt, 'id' | 'createdAt'>): Promise<Receipt> {
  const supabase = await createClient();
  const user = await requireAuth();

  // Get the user's hotels to link the receipt
  const { data: userHotels, error: hotelError } = await supabase
    .from("hotels")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1);

  if (hotelError || !userHotels || userHotels.length === 0) {
    throw new Error("No hotel found for user");
  }

  // Try to insert into receipts table
  try {
    // First check if receipts table exists
    const { error: tableCheckError } = await supabase
      .from("receipts")
      .select("id")
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.warn("Receipts table does not exist, attempting to create receipt via payments...");
      
      // If no receipts table exists, try creating via payments table
      try {
        const { data, error } = await supabase
          .from("payments")
          .insert([{
            hotel_id: userHotels[0].id,
            amount: receiptData.type === "income" ? receiptData.amount : -receiptData.amount,
            payment_method: receiptData.method,
            reservation_id: receiptData.reservationNumber,
            status: "completed",
            created_by: user.id,
          }])
          .select("id, amount, payment_method, reservation_id, created_at")
          .single();

        if (error) {
          console.error("Error adding receipt via payments:", error);
          throw new Error("Failed to add receipt: " + error.message);
        }

        // Return the created receipt
        return {
          id: data.id,
          date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          type: data.amount >= 0 ? "income" : "expense",
          amount: Math.abs(data.amount || 0),
          method: data.payment_method || "Unknown",
          reservationNumber: data.reservation_id || "N/A",
          notes: "Payment record",
          user: user.user_metadata?.full_name || user.email || "Current User",
          createdAt: data.created_at || new Date().toISOString(),
        };
      } catch (paymentError) {
        console.error("Error adding receipt via payments:", paymentError);
        throw new Error("Failed to add receipt via payments: " + (paymentError as Error).message);
      }
    }

    // If receipts table exists, add via receipts table
    const { data, error } = await supabase
      .from("receipts")
      .insert([{
        hotel_id: userHotels[0].id,
        amount: receiptData.amount,
        type: receiptData.type,
        payment_method: receiptData.method,
        reservation_id: receiptData.reservationNumber,
        notes: receiptData.notes,
        created_by: user.id,
      }])
      .select("id, amount, type, payment_method, reservation_id, notes, created_at")
      .single();

    if (error) {
      console.error("Error adding receipt:", error);
      throw new Error("Failed to add receipt: " + error.message);
    }

    // Return the created receipt
    return {
      id: data.id,
      date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      type: data.type as "income" | "expense",
      amount: data.amount || 0,
      method: data.payment_method || "Unknown",
      reservationNumber: data.reservation_id || "N/A",
      notes: data.notes || "",
      user: user.user_metadata?.full_name || user.email || "Current User",
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error adding receipt:", error);
    throw new Error("Failed to add receipt: " + (error as Error).message);
  }
}

export async function updateReceipt(id: string, receiptData: Partial<Omit<Receipt, 'id' | 'createdAt'>>): Promise<Receipt> {
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

  // Check if receipts table exists
  const { error: tableCheckError } = await supabase
    .from("receipts")
    .select("id")
    .limit(1);

  try {
    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      // If no receipts table exists, try updating via payments table
      const updateData: any = {};
      if (receiptData.amount !== undefined) updateData.amount = receiptData.type === "income" ? receiptData.amount : -receiptData.amount;
      if (receiptData.method) updateData.payment_method = receiptData.method;
      if (receiptData.reservationNumber) updateData.reservation_id = receiptData.reservationNumber;

      const { data, error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", id)
        .in("hotel_id", hotelIds)
        .select("id, amount, payment_method, reservation_id, created_at")
        .single();

      if (error) {
        console.error("Error updating receipt via payments:", error);
        throw new Error("Failed to update receipt: " + error.message);
      }

      // Return the updated receipt
      return {
        id: data.id,
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        type: data.amount >= 0 ? "income" : "expense",
        amount: Math.abs(data.amount || 0),
        method: data.payment_method || "Unknown",
        reservationNumber: data.reservation_id || "N/A",
        notes: "Payment record",
        user: user.user_metadata?.full_name || user.email || "Current User",
        createdAt: data.created_at || new Date().toISOString(),
      };
    }

    // If receipts table exists, update via receipts table
    const updateData: any = {};
    if (receiptData.amount !== undefined) updateData.amount = receiptData.amount;
    if (receiptData.type !== undefined) updateData.type = receiptData.type;
    if (receiptData.method) updateData.payment_method = receiptData.method;
    if (receiptData.reservationNumber) updateData.reservation_id = receiptData.reservationNumber;
    if (receiptData.notes) updateData.notes = receiptData.notes;

    const { data, error } = await supabase
      .from("receipts")
      .update(updateData)
      .eq("id", id)
      .in("hotel_id", hotelIds)
      .select("id, amount, type, payment_method, reservation_id, notes, created_at")
      .single();

    if (error) {
      console.error("Error updating receipt:", error);
      throw new Error("Failed to update receipt: " + error.message);
    }

    // Return the updated receipt
    return {
      id: data.id,
      date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      type: data.type as "income" | "expense",
      amount: data.amount || 0,
      method: data.payment_method || "Unknown",
      reservationNumber: data.reservation_id || "N/A",
      notes: data.notes || "",
      user: user.user_metadata?.full_name || user.email || "Current User",
      createdAt: data.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error updating receipt:", error);
    throw new Error("Failed to update receipt: " + (error as Error).message);
  }
}

export async function deleteReceipt(id: string): Promise<void> {
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

  // Check which table to delete from
  try {
    // Check if receipts table exists
    const { error: tableCheckError } = await supabase
      .from("receipts")
      .select("id")
      .limit(1);

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      // If no receipts table exists, try deleting from payments table
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", id)
        .in("hotel_id", hotelIds);

      if (error) {
        console.error("Error deleting receipt via payments:", error);
        throw new Error("Failed to delete receipt: " + error.message);
      }
    } else {
      // If receipts table exists, delete from receipts table
      const { error } = await supabase
        .from("receipts")
        .delete()
        .eq("id", id)
        .in("hotel_id", hotelIds);

      if (error) {
        console.error("Error deleting receipt:", error);
        throw new Error("Failed to delete receipt: " + error.message);
      }
    }
  } catch (error) {
    console.error("Error deleting receipt:", error);
    throw new Error("Failed to delete receipt: " + (error as Error).message);
  }
}