import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Building } from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  rating: number;
  owner_id: string;
}

interface RoomType {
  id: string;
  name: string;
  description: string;
  base_price: number;
  max_occupancy?: number;
  amenities?: string[];
  hotel_id: string;
}

interface Unit {
  id: string;
  name: string;
  notes?: string;
  room_type_id: string;
  status: string;
  hotel_id: string;
}

export default async function HotelsPage() {
  const supabase = await createClient();

  // Get all hotels
  const { data: hotels, error: hotelsError } = await supabase
    .from("hotels")
    .select("id, name, description, location, rating, owner_id")
    .order("name");

  if (hotelsError) {
    console.error("Error fetching hotels:", hotelsError);
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive">Error loading hotels</h1>
            <p className="mt-2 text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotels || hotels.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <Building className="mx-auto h-16 w-16 text-muted-foreground" />
            <h1 className="mt-4 text-3xl font-bold">No Hotels Available</h1>
            <p className="mt-2 text-muted-foreground">There are currently no hotels in the system.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get all room types to associate with hotels
  const { data: roomTypes, error: roomTypesError } = await supabase
    .from("room_types")
    .select("id, name, base_price, max_occupancy, hotel_id");

  if (roomTypesError) {
    console.error("Error fetching room types:", roomTypesError);
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive">Error loading room types</h1>
            <p className="mt-2 text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Group room types by hotel_id
  const roomTypesByHotel: Record<string, RoomType[]> = {};
  if (roomTypes && roomTypes.length > 0) {
    roomTypes.forEach((roomType) => {
      if (!roomTypesByHotel[roomType.hotel_id]) {
        roomTypesByHotel[roomType.hotel_id] = [];
      }
      roomTypesByHotel[roomType.hotel_id].push(roomType);
    });
  }

  // Get units to display available rooms in hotels
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, name, status, room_type_id, hotel_id")
    .not("status", "eq", "maintenance");

  if (unitsError) {
    console.error("Error fetching units:", unitsError);
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-destructive">Error loading units</h1>
            <p className="mt-2 text-muted-foreground">Please try again later</p>
          </div>
        </div>
      </div>
    );
    }

  // Group units by hotel_id
  const unitsByHotel: Record<string, Unit[]> = {};
  if (units && units.length > 0) {
    units.forEach((unit) => {
      if (!unitsByHotel[unit.hotel_id]) {
        unitsByHotel[unit.hotel_id] = [];
      }
      unitsByHotel[unit.hotel_id].push(unit);
    });
  }

  // Get the first available room for each hotel to show as sample
  const sampleRooms: Record<string, { name: string; price: number; unitId: string }> = {};
  Object.entries(unitsByHotel).forEach(([hotelId, hotelUnits]) => {
    if (hotelUnits.length > 0) {
      // Find the first unit and get its room type to get the price
      const firstUnit = hotelUnits[0];
      const roomType = roomTypes?.find(rt => rt.id === firstUnit.room_type_id);
      if (roomType) {
        sampleRooms[hotelId] = {
          name: roomType.name,
          price: roomType.base_price,
          unitId: firstUnit.id
        };
      }
    }
  });

  return (
    <div className="min-h-screen bg-background py-24"> {/* Increased top padding to account for fixed header */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-sm uppercase tracking-widest text-amber-600 flex items-center justify-center gap-2">
            <Star className="h-4 w-4 fill-current" />
            Premium <span className="italic">Hotels</span>
          </span>
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight lg:text-5xl">
            Discover Our <span className="italic">Hotel Collection</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground italic">
            Explore our exclusive collection of hotels from around the world
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Card
              key={hotel.id}
              className="group overflow-hidden rounded-xl border border-border/30 transition-all duration-300 hover:shadow-xl hover:border-amber-700/40"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <div className="h-full w-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <Building className="h-12 w-12 text-amber-700/30" />
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-medium italic">{hotel.name}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < (hotel.rating || 0) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {hotel.description || 'A premium destination for your stay'}
                </p>
                
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>{hotel.location || 'Location not specified'}</span>
                </div>
                
                {/* Show sample room if available */}
                {sampleRooms[hotel.id] && (
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/30">
                    <div>
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="text-lg font-medium text-amber-700">
                        SAR {sampleRooms[hotel.id].price}/night
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sampleRooms[hotel.id].name}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-lg border-amber-800/30">
                      <Link href={`/rooms/${sampleRooms[hotel.id].unitId}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Show number of room types */}
                {roomTypesByHotel[hotel.id] && roomTypesByHotel[hotel.id].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      {roomTypesByHotel[hotel.id].length} room type{roomTypesByHotel[hotel.id].length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No hotels available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}