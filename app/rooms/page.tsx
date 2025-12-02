import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  ArrowRight,
  Menu,
  Star,
  Award,
  Sparkles,
  User,
  Crown,
  LogOut
} from "lucide-react";
import { createServiceRoleClient } from "@/lib/hotels/public-hotels-service";

interface RoomType {
  id: string;
  name: string;
  description: string;
  base_price: number;
  rating: number;
  max_occupancy?: number;
  amenities?: string[];
  hotelId?: string;
  hotelName?: string;
  hotelDescription?: string;
  image_url?: string;
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Hotels", href: "/hotels" },
  { name: "Rooms", href: "/rooms" },
  { name: "Packages", href: "/dashboard/upgrade" },
  { name: "Support", href: "#support" },
];

export default async function AllRoomsPage() {
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

  // Get the hotel owned by the user
  const { data: hotel } = await supabase.from("hotels").select("id").eq("owner_id", user?.id).single();

  // Use service role client to bypass RLS and fetch all public units
  const serviceRoleClient = createServiceRoleClient();

  // Show all available rooms to all users (both with and without hotels)
  const { data: units, error } = await serviceRoleClient
    .from("units")
    .select(`
      id,
      name,
      notes,
      room_type_id,
      status,
      hotel_id
    `)
    .not("status", "eq", "maintenance");

  if (error) {
    console.error("Error fetching rooms:", error);
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} userProfile={userProfile} />
        <div className="min-h-screen flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Error loading rooms. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} userProfile={userProfile} />
        <div className="min-h-screen flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">No rooms available at the moment.</p>
        </div>
      </div>
    );
  }

  // Get unique room_type_ids
  const roomTypeIds = [...new Set(units.filter(unit => unit.room_type_id).map(unit => unit.room_type_id))];
  let roomTypes = [];
  if (roomTypeIds.length > 0) {
    const { data: fetchedRoomTypes, error: roomTypeError } = await serviceRoleClient
      .from("room_types")
      .select("*")
      .in("id", roomTypeIds);
    if (!roomTypeError && fetchedRoomTypes) {
      roomTypes = fetchedRoomTypes;
    }
  }

  // Get hotel names for room listings
  const hotelIds = [...new Set(units.map(unit => unit.hotel_id))];
  let hotels = [];
  if (hotelIds.length > 0) {
    const { data: fetchedHotels, error: hotelsError } = await serviceRoleClient
      .from("hotels")
      .select("id, name")
      .in("id", hotelIds);
    if (!hotelsError && fetchedHotels) {
      hotels = fetchedHotels;
    }
  }

  // Transform the data to match the RoomType interface
  const rooms = units.map(unit => {
    const roomType = roomTypes.find(rt => rt.id === unit.room_type_id);
    const hotel = hotels.find(h => h.id === unit.hotel_id);

    return {
      id: unit.id,
      name: unit.name,
      description: unit.notes || roomType?.description || '',
      base_price: roomType?.base_price || 0,
      rating: 5, // Default rating
      max_occupancy: roomType?.max_occupancy,
      amenities: roomType?.amenities || [],
      hotelId: unit.hotel_id,
      hotelName: hotel?.name || 'Unknown Hotel',
      image_url: "/placeholder-room.jpg",
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} userProfile={userProfile} />
      <div className="min-h-screen bg-background py-24"> {/* Increased top padding to account for fixed header */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Card className="mb-16 bg-gradient-to-br from-amber-50/50 to-amber-100/30 border-0">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-amber-100/80 text-amber-800 text-sm font-medium">
                <Star className="h-4 w-4 fill-current" />
                <span>Our Premium Accommodations</span>
              </div>
              <CardTitle className="font-serif text-4xl font-medium tracking-tight lg:text-5xl">
                Explore Our <span className="italic">Room Collection</span>
              </CardTitle>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground italic">
                Discover the perfect space for your stay from our complete collection
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="group cursor-pointer overflow-hidden rounded-xl border border-border/30 transition-all duration-300 hover:shadow-xl hover:border-amber-700/40"
              >
                <Link href={`/rooms/${room.id}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                    <img
                      src={room.image_url || "/placeholder-room.jpg"}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
                      {[...Array(room.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl font-medium italic">{room.name}</h3>
                      <span className="text-sm font-medium text-amber-700">
                        From SAR {room.base_price}/night
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {room.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {room.hotelName}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm">5.0 (247 reviews)</span>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg border-amber-800/30">
                        View Details
                      </Button>
                    </div>
                    {/* Display amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-muted rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            +{room.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          {rooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No rooms available at the moment.</p>
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