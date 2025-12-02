import { Star } from "lucide-react";
import { ClientRoomsSection } from "./client-rooms-section";

// Server Component - fetches data from Supabase
interface RoomType {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: number;
  max_occupancy?: number;
  amenities?: string[];
  hotelId?: string;
  hotelName?: string;
  hotelDescription?: string;
  image_url?: string;
}

// Define the new Server Component
export async function RoomsSection() {
  // Import the Supabase client for server component use
  const { createClient } = await import('@/lib/supabase/server');

  try {
    const supabase = await createClient();

    // Fetch published rooms and their associated data
    const { data: units, error } = await supabase
      .from('units')
      .select(`
        id,
        name,
        notes,
        room_type_id,
        status,
        room_types (
          name,
          description,
          base_price,
          max_occupancy,
          amenities
        ),
        hotels (
          id,
          name,
          description
        )
      `)
      .eq('status', 'available') // Only show available units
      .limit(6); // Limit to 6 rooms for display

    if (error) {
      console.error('Error fetching rooms:', error);
      // Return empty section if there's an error
      return <section id="rooms" className="py-24 lg:py-32" />;
    }

    if (!units || units.length === 0) {
      return <section id="rooms" className="py-24 lg:py-32" />;
    }

    // Transform the data to match the RoomType interface
    // For now, using placeholder images since image fetching might cause issues
    const rooms: RoomType[] = units.map(unit => ({
      id: unit.id,
      name: unit.name,
      description: unit.notes || unit.room_types?.description || '',
      price: unit.room_types?.base_price ? `From SAR ${unit.room_types.base_price}/night` : '',
      rating: 5, // Default rating, could come from reviews if available
      max_occupancy: unit.room_types?.max_occupancy,
      amenities: unit.room_types?.amenities || [],
      hotelId: unit.hotels?.id,
      hotelName: unit.hotels?.name,
      hotelDescription: unit.hotels?.description,
      image_url: "/placeholder-room.jpg", // Using placeholder for now to avoid issues
    }));

    return (
      <section id="rooms" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
              <Star className="h-4 w-4 fill-current" />
              Accommodations
            </span>
            <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl"><span className="italic">Curated</span> Room Collection</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
              Each space thoughtfully designed to provide an unparalleled guest experience
            </p>
          </div>

          <ClientRoomsSection rooms={rooms} />
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error in RoomsSection:', error);
    return <section id="rooms" className="py-24 lg:py-32" />;
  }
}