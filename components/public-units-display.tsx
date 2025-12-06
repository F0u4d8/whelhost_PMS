'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Wifi, Car, Coffee, Utensils, Mountain } from 'lucide-react';
import { getPublicUnits, PublicUnit } from '@/lib/public-units-service';

interface PublicUnitsDisplayProps {
  city?: string; // Optional filter by city
}

export function PublicUnitsDisplay({ city }: PublicUnitsDisplayProps) {
  const [units, setUnits] = useState<PublicUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        let allUnits = await getPublicUnits();
        
        // If city is specified, filter units by that city
        if (city) {
          allUnits = allUnits.filter(unit => 
            unit.hotelLocation.toLowerCase().includes(city.toLowerCase())
          );
        }
        
        // Limit to 6 units for display (as originally planned)
        setUnits(allUnits.slice(0, 6));
      } catch (err) {
        console.error('Error fetching public units:', err);
        setError('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [city]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-amber-800 hover:bg-amber-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No units available at the moment.</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {units.map((unit) => (
        <Card
          key={unit.id}
          className="border border-border/40 p-6 transition-all duration-300 hover:border-amber-700/50 rounded-xl bg-background"
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg relative">
            {unit.imageUrls && unit.imageUrls.length > 0 ? (
              <img
                src={unit.imageUrls[0]} // Use the first image as the main image
                alt={unit.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback image if the primary image doesn't load
                  (e.target as HTMLImageElement).src = '/placeholder-room.jpg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            {unit.status === 'vacant' && (
              <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-600" variant="secondary">
                Available
              </Badge>
            )}
            {unit.status === 'occupied' && (
              <Badge className="absolute top-4 right-4 bg-red-600 hover:bg-red-600" variant="secondary">
                Booked
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-xl font-medium">{unit.name}</h3>
                <div className="flex items-center mt-1">
                  {renderStars(unit.rating)}
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                SAR {unit.pricePerNight} <span className="text-sm text-muted-foreground">/night</span>
              </span>
            </div>

            <div className="flex items-center mt-2">
              <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
              <span className="text-sm text-muted-foreground">{unit.hotelLocation}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {unit.amenities?.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100/80 text-amber-800 rounded-md"
                >
                  {amenity}
                </span>
              ))}
              {unit.amenities && unit.amenities.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{unit.amenities.length - 3} more
                </span>
              )}
            </div>

            {unit.imageUrls && unit.imageUrls.length > 1 && (
              <div className="flex gap-2 mt-3">
                {unit.imageUrls.slice(1, 4).map((imgUrl, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-md overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`${unit.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback image if the primary image doesn't load
                        (e.target as HTMLImageElement).src = '/placeholder-room.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full mt-6 border-amber-800/30" variant="outline">
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}