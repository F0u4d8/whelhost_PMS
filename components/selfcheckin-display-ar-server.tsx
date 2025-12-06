import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Shield, MapPin } from 'lucide-react';
import { getPublicUnits, PublicUnit } from '@/lib/public-units-service';

interface SelfCheckInDisplayArServerProps {
  city?: string; // Optional filter by city
}

export async function SelfCheckInDisplayArServer({ city }: SelfCheckInDisplayArServerProps) {
  let units: PublicUnit[] = [];
  let error: string | null = null;

  try {
    let allUnits = await getPublicUnits();
    
    // Filter to units that support self-check-in or have similar features
    allUnits = allUnits.filter(unit => 
      // We'll consider units that are generally available as supporting self-check-in
      unit.status === 'vacant'
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
    console.error('Error fetching self-check-in units:', err);
    error = 'فشل تحميل وحدات الدخول الذاتي';
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <p className="text-sm mt-2">الرجاء تحديث الصفحة أو المحاولة لاحقاً.</p>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <p>لا توجد وحدات دخول ذاتي متاحة حالياً.</p>
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

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {units.map((unit) => (
        <div
          key={unit.id}
          className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/5">
              <div className="aspect-square w-full h-full">
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
              </div>
            </div>

            <div className="p-6 md:w-3/5 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 text-amber-800 text-xs font-medium rounded-full mb-3">
                  <Shield className="h-3 w-3" />
                  <span>دخول ذاتي</span>
                </div>
                <h3 className="font-serif text-xl font-medium">{unit.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{unit.description || 'تجربة إقامة مريحة مع نظام دخول ذكي'}</p>
                
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {renderStars(unit.rating)}
                  </div>
                  <span className="mx-2 text-muted-foreground">•</span>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground ml-1" />
                    <span className="text-sm text-muted-foreground">{unit.hotelLocation}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-foreground">
                    {unit.pricePerNight} <span className="text-sm text-muted-foreground">ر.س</span>
                  </span>
                  <span className="text-sm text-muted-foreground"> /الليلة</span>
                </div>
                <Button className="bg-amber-800 hover:bg-amber-700">احجز الآن</Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}