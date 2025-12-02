import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Star, MapPin, Users, Building, Menu, Sparkles, User, Crown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllPublicRoomTypes, getAllPublicUnits, createServiceRoleClient, getPublicHotels } from "@/lib/hotels/public-hotels-service";

interface Hotel {
  id: string;
  name: string;
  description: string;
  location?: string;
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

const navigation = [
  { name: "Home", href: "/" },
  { name: "Hotels", href: "/hotels" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/dashboard/upgrade" },
  { name: "Support", href: "#support" },
];

export default async function HotelsPage() {
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

  // Use service role client to fetch all hotels using dedicated public function
  const { hotels, error: hotelsError } = await getPublicHotels();

  // Handle error case
  if (hotelsError) {
    console.error("Error fetching hotels:", hotelsError);
  }

  // Get all room types to associate with hotels using service role
  const { roomTypes, error: roomTypesError } = await getAllPublicRoomTypes();

  if (roomTypesError) {
    console.error("Error fetching room types:", roomTypesError);
    // For room types errors, proceed with empty room types
    console.log("Proceeding with empty room types due to error:", roomTypesError);
  }

  // Group room types by hotel_id
  const roomTypesByHotel: Record<string, RoomType[]> = {};
  const roomTypesList = roomTypes || [];
  if (roomTypesList && roomTypesList.length > 0) {
    roomTypesList.forEach((roomType) => {
      if (!roomTypesByHotel[roomType.hotel_id]) {
        roomTypesByHotel[roomType.hotel_id] = [];
      }
      roomTypesByHotel[roomType.hotel_id].push(roomType);
    });
  }

  // Get units to display available rooms in hotels using service role
  const { units, error: unitsError } = await getAllPublicUnits();

  if (unitsError) {
    console.error("Error fetching units:", unitsError);
    // For unit errors, proceed with empty units
    console.log("Proceeding with empty units due to error:", unitsError);
  }

  // Group units by hotel_id
  const unitsByHotel: Record<string, Unit[]> = {};
  const unitsList = units || [];
  if (unitsList && unitsList.length > 0) {
    unitsList.forEach((unit) => {
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
      const roomType = roomTypesList?.find(rt => rt.id === firstUnit.room_type_id);
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
    <div className="min-h-screen bg-background">
      {/* Main Header */}
      <Header user={user} userProfile={userProfile} />

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
                        className="h-4 w-4 text-muted-foreground"
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
    </div>
  );
}

// Header component extracted for reusability
function Header({ user, userProfile }: { user: any, userProfile: any }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
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
            // User is logged in - show profile dropdown
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 border rounded-full px-1 py-1.5 text-sm hover:bg-accent transition-colors focus:outline-none"
                    aria-label="Profile menu"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.full_name || "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {userProfile?.full_name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/upgrade" className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-warning" />
                      <span>Upgrade to Pro</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/logout" className="flex items-center gap-2 text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            // User is not logged in - show auth buttons
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

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background">
            <nav className="mt-12 flex flex-col gap-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="font-serif text-2xl font-medium text-foreground">
                  {item.name}
                </Link>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                {user ? (
                  // User is logged in - show profile options
                  <>
                    <Button variant="outline" asChild className="rounded-lg bg-transparent border-amber-800/30">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>

                    {/* Profile Options in Mobile */}
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-amber-800/30">
                        <Link href="/profile">Profile</Link>
                      </Button>
                      <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-amber-800/30">
                        <Link href="/dashboard/upgrade">Upgrade to Pro</Link>
                      </Button>
                      <Button variant="outline" asChild className="justify-start rounded-lg bg-transparent border-red-700/30 text-red-600">
                        <Link href="/logout">Sign Out</Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  // User is not logged in - show auth buttons
                  <>
                    <Button variant="outline" asChild className="rounded-lg bg-transparent border-amber-800/30">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="rounded-lg bg-amber-800 hover:bg-amber-700">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}