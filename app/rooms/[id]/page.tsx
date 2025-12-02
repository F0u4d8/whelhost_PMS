import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Users, Building, Calendar, DollarSign, Wifi, Car, Utensils, Coffee, Dumbbell, Waves, Mountain, Snowflake, CoffeeIcon, Tv, Phone, ShowerHead, Sun, Moon, Key, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllPublicUnits, getAllPublicRoomTypes } from "@/lib/hotels/public-hotels-service";

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

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const roomId = params.id; // params is available directly in server components

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

  // Fetch the specific room/unit
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, name, hotel_id, room_type_id, status, notes")
    .eq("id", roomId)
    .single();

  if (unitsError || !units) {
    notFound();
  }

  // Fetch the room type for this unit
  const { data: roomType, error: roomTypeError } = await supabase
    .from("room_types")
    .select("id, name, description, base_price, max_occupancy, amenities")
    .eq("id", units.room_type_id)
    .single();

  if (roomTypeError || !roomType) {
    notFound();
  }

  // Fetch the hotel for this room
  const { data: hotel, error: hotelError } = await supabase
    .from("hotels")
    .select("id, name, description, address, city, country, phone, email")
    .eq("id", units.hotel_id)
    .single();

  if (hotelError || !hotel) {
    notFound();
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
          {/* Room Header Section */}
          <div className="mb-12">
            <div className="mb-6">
              <Link
                href={`/hotels/${hotel.id}`}
                className="text-sm font-medium text-amber-600 hover:underline flex items-center gap-1"
              >
                ← Back to {hotel.name}
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h1 className="text-4xl font-serif font-medium mb-2">{roomType.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-muted-foreground">Room in {hotel.name}</span>
                </div>

                <div className="flex items-center text-muted-foreground mb-6">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {hotel.address || 'Address not specified'}, {hotel.city}, {hotel.country}
                  </span>
                </div>
              </div>

              <div className="md:w-1/3">
                <Card className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-700 mb-2">
                      {roomType.base_price} {hotel.currency || 'SAR'}
                      <span className="text-sm font-normal text-muted-foreground">/night</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Based on current rates</p>
                    <Link href={`/checkout?unit_id=${units.id}`}>
                      <Button className="w-full bg-amber-800 hover:bg-amber-700">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Room and Hotel Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    About This Room
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    {roomType.description || "This comfortable room offers all the amenities you need for a relaxing stay. Perfect for both business and leisure travelers."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-medium mb-2">Room Type</h3>
                      <p className="text-muted-foreground">{roomType.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Max Occupancy</h3>
                      <p className="text-muted-foreground">{roomType.max_occupancy || 2} guests</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Room Status</h3>
                      <p className="text-muted-foreground capitalize">{units.status}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Room ID</h3>
                      <p className="text-muted-foreground">{units.name || units.id}</p>
                    </div>
                  </div>

                  {units.notes && (
                    <div>
                      <h3 className="font-medium mb-2">Special Notes</h3>
                      <p className="text-muted-foreground">{units.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Room Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {roomType.amenities
                      ? formatAmenities(roomType.amenities)
                      : formatAmenities(['wifi', 'tv', 'shower', 'air conditioning'])}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Hotel Information Section */}
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  About {hotel.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {hotel.description || "This hotel offers premium accommodations with top-notch services and amenities for an unforgettable stay."}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-medium mb-1">Check-in Time</h3>
                    <p className="text-sm text-muted-foreground">{hotel.check_in_time || '15:00'}</p>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-medium mb-1">Check-out Time</h3>
                    <p className="text-sm text-muted-foreground">{hotel.check_out_time || '11:00'}</p>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground">{hotel.phone || 'N/A'}</p>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">{hotel.email || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Section */}
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Book This Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-medium mb-4">Choose Dates</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Check-in Date</label>
                        <div className="border rounded-lg px-3 py-2 text-muted-foreground">
                          Select date
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Check-out Date</label>
                        <div className="border rounded-lg px-3 py-2 text-muted-foreground">
                          Select date
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/3">
                    <h3 className="font-medium mb-4">Total Cost</h3>
                    <div className="bg-amber-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Room Rate</span>
                        <span>{roomType.base_price} {hotel.currency || 'SAR'}/night</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-muted-foreground">Taxes & Fees</span>
                        <span>+ 15 SAR</span>
                      </div>
                      <div className="border-t border-border pt-2 mt-2">
                        <div className="flex justify-between items-center font-medium">
                          <span>Total</span>
                          <span className="text-amber-700">{roomType.base_price + 15} {hotel.currency || 'SAR'}</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/checkout?unit_id=${units.id}`}>
                      <Button className="w-full mt-4 bg-amber-800 hover:bg-amber-700">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Complete Booking
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}