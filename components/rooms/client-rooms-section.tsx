"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { RoomDetailsModal, RoomType } from "./room-details-modal";

export function ClientRoomsSection({ rooms }: { rooms: RoomType[] }) {
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [roomImages, setRoomImages] = useState<Record<string, string>>({});

  const handleRoomClick = (room: RoomType) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  // Fetch room images after component mounts
  useEffect(() => {
    const fetchRoomImages = async () => {
      const newImages: Record<string, string> = {};

      for (const room of rooms) {
        try {
          const response = await fetch(`/api/public/room-images?roomId=${room.id}`);
          const data = await response.json();

          if (data.images && data.images.length > 0) {
            newImages[room.id] = data.images[0]; // Use first image
          } else {
            newImages[room.id] = "/placeholder-room.jpg";
          }
        } catch (error) {
          console.error(`Error fetching images for room ${room.id}:`, error);
          newImages[room.id] = "/placeholder-room.jpg";
        }
      }

      setRoomImages(newImages);
    };

    if (rooms.length > 0) {
      fetchRoomImages();
    }
  }, [rooms]);

  if (!rooms || rooms.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="group cursor-pointer overflow-hidden rounded-xl border border-border/30 transition-all duration-300 hover:shadow-xl hover:border-amber-700/40"
            onClick={() => handleRoomClick(room)}
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted relative">
              <img
                src={roomImages[room.id] || room.image_url || "/placeholder.svg"}
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
                <span className="text-sm font-medium text-amber-700">{room.price}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm">5.0 (247 reviews)</span>
                </div>
                <Button size="sm" variant="outline" className="rounded-lg border-amber-800/30">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedRoom && (
        <RoomDetailsModal
          room={{...selectedRoom, image_url: roomImages[selectedRoom.id] || selectedRoom.image_url}}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  );
}