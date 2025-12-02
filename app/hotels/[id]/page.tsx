import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Building, Calendar, DollarSign, Wifi, Car, Utensils, Coffee, Dumbbell, Waves, Mountain, Snowflake, CoffeeIcon, Tv, Phone, ShowerHead, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublicHotels } from "@/lib/hotels/public-hotels-service";

interface Hotel {
  id: string;
  name: string;
  description: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  timezone?: string;
  currency?: string;
  check_in_time?: string;
  check_out_time?: string;
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

// Header component extracted for reusability
function Header({ user, userProfile }: { user: any, userProfile: any }) {
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Hotels", href: "/hotels" },
    { name: "Rooms", href: "/rooms" },
    { name: "Packages", href: "/dashboard/upgrade" },
    { name: "Support", href: "#support" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-12 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons - Different based on auth status */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            // User is logged in
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Profile
              </Link>
            </div>
          ) : (
            // User is not logged in
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-lg bg-amber-800 hover:bg-amber-700 px-6">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default async function HotelDetailPage({ params }: { params: { id: string } }) {
  const hotelId = params.id; // params is available directly in server components

  // Get current user (if any) for header
  let user = null;
  let userProfile = null;
  const supabase = await createClient();
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    // Fetch user profile if user exists
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      userProfile = profileData;
    }
  } catch (error) {
    // If there's an error getting the user or profile, continue without user info
    console.log("No authenticated user or error fetching profile:", error);
  }

  // Fetch the specific hotel
  const { hotels, error } = await getPublicHotels();
  const hotel = hotels?.find(h => h.id === hotelId) || null;

  if (!hotel || error) {
    notFound();
  }

  // Get room types for this specific hotel
  const { data: roomTypes, error: roomTypesError } = await supabase
    .from("room_types")
    .select("id, name, description, base_price, max_occupancy, amenities")
    .eq("hotel_id", hotelId);

  if (roomTypesError) {
    console.error("Error fetching room types:", roomTypesError);
  }

  // Get units for this specific hotel
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, name, status, room_type_id, notes")
    .eq("hotel_id", hotelId)
    .not("status", "eq", "maintenance");

  if (unitsError) {
    console.error("Error fetching units:", unitsError);
  }

  // Group units by room type
  const unitsByRoomType: Record<string, any[]> = {};
  if (units) {
    units.forEach((unit: any) => {
      if (!unitsByRoomType[unit.room_type_id]) {
        unitsByRoomType[unit.room_type_id] = [];
      }
      unitsByRoomType[unit.room_type_id].push(unit);
    });
  }

  // Format amenities
  const formatAmenities = (amenities: string[]) => {
    if (!amenities || amenities.length === 0) return [];

    const amenityIcons: Record<string, any> = {
      'wifi': Wifi,
      'parking': Car,
      'restaurant': Utensils,
      'breakfast': Coffee,
      'gym': Dumbbell,
      'pool': Waves,
      'spa': Waves,
      'mountain view': Mountain,
      'ocean view': Waves,
      'air conditioning': Snowflake,
      'tv': Tv,
      'phone': Phone,
      'shower': ShowerHead,
      'balcony': Sun,
      'terrace': Sun,
      'coffee maker': CoffeeIcon,
    };

    return amenities.map((amenity, index) => {
      const cleanAmenity = amenity.toLowerCase().trim();
      const IconComponent = amenityIcons[cleanAmenity] || Star;

      return (
        <div key={index} className="flex items-center gap-2">
          <IconComponent className="h-4 w-4 text-amber-600" />
          <span className="text-sm capitalize">{amenity}</span>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Persistent Header */}
      <Header user={user} userProfile={userProfile} />

      <div className="min-h-screen bg-background pt-24 pb-16"> {/* Account for fixed header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hotel Header Section */}
          <div className="mb-12">
            <div className="mb-6">
              <Link
                href="/hotels"
                className="text-sm font-medium text-amber-600 hover:underline flex items-center gap-1"
              >
                ← Back to Hotels
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h1 className="text-4xl font-serif font-medium mb-4">{hotel.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-muted-foreground">Premium Hotel</span>
                </div>

                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {hotel.address || 'Address not specified'}, {hotel.city}, {hotel.country}
                  </span>
                </div>
              </div>

              <div className="md:w-1/3">
                <div className="aspect-video w-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                  <Building className="h-16 w-16 text-amber-700/30" />
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    About {hotel.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {hotel.description || "This hotel offers premium accommodations with top-notch services and amenities for an unforgettable stay."}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Check-in Time</h3>
                      <p className="text-muted-foreground">{hotel.check_in_time || '15:00'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Check-out Time</h3>
                      <p className="text-muted-foreground">{hotel.check_out_time || '11:00'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Contact</h3>
                      <p className="text-muted-foreground">{hotel.phone || 'Phone not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Email</h3>
                      <p className="text-muted-foreground">{hotel.email || 'Email not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Hotel Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {formatAmenities([
                      'wifi', 'parking', 'restaurant', 'breakfast',
                      'gym', 'pool', 'spa', 'air conditioning'
                    ])}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Room Types Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-serif font-medium mb-6">Available Room Types</h2>

            {roomTypes && roomTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomTypes.map((roomType: any) => (
                  <Card key={roomType.id} className="overflow-hidden">
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Building className="h-12 w-12 text-gray-700/30" />
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium">{roomType.name}</h3>
                        <span className="text-lg font-bold text-amber-700">
                          {roomType.base_price} {hotel.currency || 'SAR'}/night
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {roomType.description || 'A comfortable room with premium amenities.'}
                      </p>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Up to {roomType.max_occupancy || 2} guests
                          </span>
                        </div>
                      </div>

                      {/* Show available units count */}
                      <div className="text-sm text-muted-foreground mb-4">
                        {unitsByRoomType[roomType.id]?.length || 0} room{unitsByRoomType[roomType.id]?.length !== 1 ? 's' : ''} available
                      </div>

                      <Link href={`/rooms?hotel_id=${hotelId}&room_type_id=${roomType.id}`}>
                        <Button className="w-full bg-amber-800 hover:bg-amber-700">
                          View Rooms
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg text-muted-foreground">No room types available for this hotel yet.</p>
              </div>
            )}
          </div>

          {/* Nearby Attractions Section (if needed) */}
          {/* <div className="mb-12">
            <h2 className="text-2xl font-serif font-medium mb-6">Nearby Attractions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Beach', 'Mall', 'Restaurant', 'Historic Site', 'Park', 'Museum'].map((attraction, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">{attraction}</h3>
                    <p className="text-sm text-muted-foreground">Approximately 2 km from the hotel</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}