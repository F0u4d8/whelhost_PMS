"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Users, Bed, Bath, Heart, HeartOff, Send } from "lucide-react";
import { useState } from "react";

// Define the interface for room data that comes from the server component
export interface RoomType {
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

interface RoomDetailsModalProps {
  room: RoomType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomDetailsModal({ room, open, onOpenChange }: RoomDetailsModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isContacting, setIsContacting] = useState(false);
  const [contactResult, setContactResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleContactOwner = async () => {
    if (!name || !email) {
      setContactResult({ success: false, message: "Please provide your name and email" });
      return;
    }

    setIsContacting(true);
    setContactResult(null);

    // For now, just simulate a successful request
    // In a real implementation, this would call your contact API
    setContactResult({ success: true, message: "Your request has been sent successfully!" });

    // Clear form after successful submission
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setIsContacting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{room.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Image */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={room.image_url || "/placeholder.svg"}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm"
              >
                {isFavorite ? (
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                ) : (
                  <HeartOff className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Image gallery */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={room.image_url || "/placeholder.svg"}
                    alt={`Room view ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Room Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">5.0 (247 reviews)</span>
            </div>

            <p className="text-lg text-muted-foreground">{room.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Max Occupancy</p>
                  <p className="font-medium">{room.max_occupancy || 2} guests</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium">{room.name || "Deluxe"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{room.hotelName || "City Center"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-medium">1</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities?.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                  >
                    {amenity}
                  </span>
                )) || <span className="text-sm text-muted-foreground">No amenities listed</span>}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">About the Property</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-medium text-lg">
                    {room.hotelName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{room.hotelName || "Luxury Hotel"}</p>
                  <p className="text-sm text-muted-foreground">Property Manager</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {room.hotelDescription || "A premium hotel for discerning guests. We provide exceptional service and amenities to ensure your stay is memorable."}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    placeholder="Your Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    placeholder="Your Phone (Optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full"
                  />
                  <Textarea
                    placeholder="Your message to the property owner..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleContactOwner}
                  disabled={isContacting}
                >
                  {isContacting ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Contact Property Owner
                    </>
                  )}
                </Button>

                {contactResult && (
                  <div className={`p-3 rounded-md text-sm ${
                    contactResult.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {contactResult.message}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-serif font-medium">{room.price}</span>
                  <span className="text-sm text-muted-foreground"> / night</span>
                </div>
                <Button size="lg">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}