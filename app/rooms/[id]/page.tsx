import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Users, Bed, Bath, Mail, Phone, Send, Heart, MessageCircle } from "lucide-react";
import { contactRoomOwner } from "@/lib/rooms/room-contact-service";
import type { Unit, Profile } from "@/lib/types";
import { DirectConversation } from "@/components/rooms/direct-conversation";

interface RoomDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailsPage({ params }: RoomDetailsPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the room details
  const { data: unit, error } = await supabase
    .from("units")
    .select(`
      *,
      room_type:room_types(name, description, base_price, max_occupancy, amenities),
      hotel:hotels!inner(name, description, owner_id, address, city, country)
    `)
    .eq("id", id)
    .single();

  if (error || !unit) {
    redirect("/404");
  }

  // Fetch the owner profile to display owner information
  const { data: ownerProfile, error: ownerError } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url")
    .eq("id", unit.hotel.owner_id)
    .single();

  if (ownerError) {
    console.error("Error fetching owner profile:", ownerError);
  }

  // Get current user (if any)
  let currentUser = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user.id)
        .single();
      currentUser = profile;
    }
  } catch (error) {
    console.log("No authenticated user or error fetching profile:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl font-medium">
                {unit.name} - {unit.room_type?.name}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {unit.hotel.name} • {unit.hotel.city || "Location not specified"}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Room Images */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src="/placeholder.svg"
                    alt={unit.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle>About this room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <p className="text-muted-foreground">
                    {unit.room_type?.description || "No description available for this room."}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Max Occupancy</p>
                        <p className="font-medium">{unit.room_type?.max_occupancy || 2} guests</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Floor</p>
                        <p className="font-medium">{unit.floor || 1}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{unit.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{unit.room_type?.name || "Standard"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {unit.room_type?.amenities && Array.isArray(unit.room_type.amenities) && unit.room_type.amenities.length > 0 ? (
                        unit.room_type.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                          >
                            {amenity}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No amenities listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle>About the Property</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-medium text-lg">
                      {unit.hotel.name?.charAt(0) || "H"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{unit.hotel.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {unit.hotel.description}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">4.8 (128 reviews)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Book this room</span>
                  <span className="font-serif text-xl font-medium">
                    {unit.room_type?.base_price ? `${unit.room_type.base_price} SAR` : 'Price unavailable'} / night
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base price</span>
                    <span>{unit.room_type?.base_price ? `${unit.room_type.base_price} SAR` : 'TBD'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span>15 SAR</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Total (1 night)</span>
                    <span>{unit.room_type?.base_price ? `${unit.room_type.base_price + 15} SAR` : 'TBD'}</span>
                  </div>
                </div>
                <Button className="w-full mt-6">
                  Request to Book
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  You won't be charged yet
                </p>
              </CardContent>
            </Card>

            {/* Direct Messaging Card - Shown only if user is logged in */}
            {currentUser && ownerProfile ? (
              <DirectConversation
                roomId={unit.id}
                hotelId={unit.hotel_id}
                currentUserId={currentUser.id}
                ownerProfile={ownerProfile as Profile}
              />
            ) : (
              // Show the contact form if user is not logged in
              <ContactOwnerCard roomId={unit.id} hotelId={unit.hotel_id} ownerProfile={ownerProfile} />
            )}

            {/* Show contact form as fallback for non-logged in users */}
            {!currentUser && (
              <div className="mt-4">
                <ContactOwnerCard roomId={unit.id} hotelId={unit.hotel_id} ownerProfile={ownerProfile} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ContactOwnerCardProps {
  roomId: string;
  hotelId: string;
  ownerProfile: any; // Type should be Profile from your types
}

function ContactOwnerCard({ roomId, hotelId, ownerProfile }: ContactOwnerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Contact Property Owner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-sm font-medium">
                {ownerProfile?.full_name?.charAt(0) || ownerProfile?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <p className="font-medium">
                {ownerProfile?.full_name || "Property Owner"}
              </p>
              <p className="text-xs text-muted-foreground">
                {ownerProfile?.email || "Email not available"}
              </p>
            </div>
          </div>

          <form
            action={async (formData: FormData) => {
              'use server';

              const name = formData.get('name') as string;
              const email = formData.get('email') as string;
              const phone = formData.get('phone') as string;
              const message = formData.get('message') as string;

              const contactData = {
                hotelId,
                roomId,
                senderName: name,
                senderEmail: email,
                senderPhone: phone,
                message: message,
              };

              const result = await contactRoomOwner(contactData);
              console.log(result); // In a real app, you would handle the result appropriately
            }}
            className="space-y-4"
          >
            <Input
              name="name"
              placeholder="Your name"
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Your email"
              required
            />
            <Input
              name="phone"
              type="tel"
              placeholder="Your phone (optional)"
            />
            <Textarea
              name="message"
              placeholder="Your message to the owner..."
              rows={4}
              required
            />
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}