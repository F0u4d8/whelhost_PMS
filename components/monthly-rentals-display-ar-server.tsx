import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Heart } from 'lucide-react';
import { getPublicUnits, PublicUnit } from '@/lib/public-units-service';

interface MonthlyRentalsDisplayArServerProps {
  city?: string; // Optional filter by city
}

export async function MonthlyRentalsDisplayArServer({ city }: MonthlyRentalsDisplayArServerProps) {
  let units: PublicUnit[] = [];
  let error: string | null = null;

  try {
    let allUnits = await getPublicUnits();
    
    // Filter to units that are suitable for monthly rentals (longer stays)
    allUnits = allUnits.filter(unit => 
      unit.pricePerNight <= 2000 // Affordable for monthly stays (this is just an arbitrary filter)
    );
    
    // If city is specified, filter units by that city
    if (city) {
      allUnits = allUnits.filter(unit => 
        unit.hotelLocation.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Limit to 3 units for display (as originally planned for this section)
    units = allUnits.slice(0, 3);
  } catch (err) {
    console.error('Error fetching monthly rental units:', err);
    error = 'فشل تحميل وحدات الإيجار الشهري';
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <p className="text-sm mt-2">الرجاء تحديث الصفحة أو المحاولة لاحداً.</p>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <p>لا توجد وحدات للإيجار الشهري متاحة حالياً.</p>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
        />
      );
    }
    return stars;
  };

  // Calculate approximate monthly price (assuming 30 days)
  const calculateMonthlyPrice = (pricePerNight: number) => {
    return pricePerNight * 30;
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {units.map((unit) => (
        <div
          key={unit.id}
          className="border border-border/40 p-6 transition-all duration-300 hover:border-amber-700/50 rounded-xl bg-background"
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted rounded-lg relative">
            {unit.imageUrls && unit.imageUrls.length > 0 ? (
              <img
                src={unit.imageUrls[0]}
                alt={unit.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">لا توجد صورة</span>
              </div>
            )}
            <button className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-start">
              <h3 className="font-serif text-xl font-medium">{unit.name}</h3>
              <span className="text-lg font-bold text-foreground">
                {calculateMonthlyPrice(unit.pricePerNight)} <span className="text-sm text-muted-foreground">ر.س/الشهر</span>
              </span>
            </div>

            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground ml-1" />
              <span className="text-sm text-muted-foreground">{unit.hotelLocation}</span>
            </div>

            <div className="flex items-center mt-2">
              {renderStars(unit.rating)}
            </div>

            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
              {unit.description || 'تجربة إقامة مريحة للإقامة الطويلة.'}
            </p>

            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">الدور: {unit.floor}</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{unit.type}</span>
            </div>

            <Button className="w-full mt-6 bg-amber-800 hover:bg-amber-700">
              عرض التفاصيل
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}