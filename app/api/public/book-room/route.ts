import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // For public booking, we don't need authentication
    const supabase = await createClient();
    
    const body = await request.json();
    const { room_id, check_in, check_out, guest_name, guest_email, guest_phone, adults, children } = body;

    // Validate required fields
    if (!room_id || !check_in || !check_out || !guest_name || !guest_email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch the unit to get hotel_id and verify it's available
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select(`
        id, 
        name, 
        hotel_id,
        room_types (
          base_price
        )
      `)
      .eq('id', room_id)
      .single();

    if (unitError || !unit) {
      return Response.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check for booking conflicts
    const { data: conflictingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .eq('unit_id', room_id)
      .or(`and(check_in.lte.${check_out},check_out.gte.${check_in})`) // Check for overlapping dates
      .neq('status', 'cancelled');

    if (bookingError) {
      console.error('Error checking booking conflicts:', bookingError);
      return Response.json(
        { error: 'Error checking availability' },
        { status: 500 }
      );
    }

    if (conflictingBookings && conflictingBookings.length > 0) {
      return Response.json(
        { error: 'Room is not available for selected dates' },
        { status: 409 }
      );
    }

    // Create the guest if they don't exist
    const { data: existingGuest, error: guestError } = await supabase
      .from('guests')
      .select('id')
      .eq('email', guest_email)
      .eq('hotel_id', unit.hotel_id)
      .single();

    let guestId: string;

    if (guestError || !existingGuest) {
      // Create new guest
      const { data: newGuest, error: createGuestError } = await supabase
        .from('guests')
        .insert({
          hotel_id: unit.hotel_id,
          first_name: guest_name.split(' ')[0] || guest_name,
          last_name: guest_name.split(' ').slice(1).join(' ') || '',
          email: guest_email,
          phone: guest_phone || null,
        })
        .select('id')
        .single();

      if (createGuestError) {
        console.error('Error creating guest:', createGuestError);
        return Response.json(
          { error: 'Error creating guest' },
          { status: 500 }
        );
      }

      guestId = newGuest.id;
    } else {
      guestId = existingGuest.id;
    }

    // Calculate total amount based on number of nights
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * (unit.room_types?.base_price || 0);

    // Create the booking
    const bookingData = {
      hotel_id: unit.hotel_id,
      unit_id: unit.id,
      guest_id: guestId,
      check_in: check_in,
      check_out: check_out,
      adults: adults || 1,
      children: children || 0,
      source: 'website',
      status: 'pending',
      total_amount: totalAmount,
      notes: `Online booking for ${guest_name}`,
    };

    const { data: newBooking, error: bookingCreateError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingCreateError) {
      console.error('Error creating booking:', bookingCreateError);
      return Response.json(
        { error: 'Error creating booking' },
        { status: 500 }
      );
    }

    // Optionally send a confirmation email here

    return Response.json({
      success: true,
      booking: newBooking,
      message: 'Booking request submitted successfully. We will contact you shortly.',
    });
  } catch (error) {
    console.error('Error in public book-room API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}