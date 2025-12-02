import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { hotelId, roomId, senderName, senderEmail, senderPhone, message } = body;

    // Validate required fields
    if (!hotelId || !roomId || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get hotel and room information
    const { data: hotel, error: hotelError } = await supabase
      .from("hotels")
      .select("name, owner_id")
      .eq("id", hotelId)
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json(
        { success: false, message: "Hotel not found" },
        { status: 404 }
      );
    }

    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("name")
      .eq("id", roomId)
      .single();

    if (unitError || !unit) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Get owner profile
    const { data: ownerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", hotel.owner_id)
      .single();

    if (profileError || !ownerProfile) {
      return NextResponse.json(
        { success: false, message: "Owner information not available" },
        { status: 404 }
      );
    }

    // Create contact request in the database
    const { error: insertError } = await supabase
      .from("contact_requests")
      .insert({
        hotel_id: hotelId,
        unit_id: roomId,
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone || null,
        message: message,
        status: "pending",
      });

    if (insertError) {
      console.error("Error creating contact request:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to send message" },
        { status: 500 }
      );
    }

    // In a real application, you would send an email notification to the owner here
    // For now, we'll simulate a success response

    // Optional: Send notification email to owner
    // This would require your email service integration

    return NextResponse.json({
      success: true,
      message: "Your message has been sent to the property owner. They will contact you shortly.",
    });
  } catch (error) {
    console.error("Error handling contact request:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while sending your message" },
      { status: 500 }
    );
  }
}