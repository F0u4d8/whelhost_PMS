import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';
import { getPublicUnits, PublicUnit } from '@/lib/public-units-service';

interface PublicUnitsDisplayArServerProps {
  city?: string; // Optional filter by city
}

export async function PublicUnitsDisplayArServer({ city }: PublicUnitsDisplayArServerProps) {
  let units: PublicUnit[] = [];
  let error: string | null = null;

  try {
    let allUnits = await getPublicUnits();
    
    // If city is specified, filter units by that city
    if (city) {
      allUnits = allUnits.filter(unit => 
        unit.hotelLocation.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Limit to 6 units for display (as originally planned)
    units = allUnits.slice(0, 6);
  } catch (err) {
    console.error('Error fetching public units:', err);
    error = 'فشل تحميل الوحدات';
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
        <p>لا توجد وحدات متاحة حالياً.</p>
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

  // Status translation function
  const getStatusText = (status: string) => {
    switch(status) {
      case 'vacant':
        return 'متاح';
      case 'occupied':
        return 'محجوز';
      case 'out-of-service':
        return 'تحت الصيانة';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1); // Fallback
    }
  };

  // Status badge color function
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'vacant':
        return 'bg-green-600 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-600 hover:bg-red-600';
      case 'out-of-service':
        return 'bg-yellow-600 hover:bg-yellow-600';
      default:
        return 'bg-gray-600 hover:bg-gray-600';
    }
  };

  // Format the unit type for display
  const formatUnitType = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'suite': return 'جناح';
      case 'room': return 'غرفة';
      case 'studio': return 'ستوديو';
      case 'apartment': return 'شقة';
      default: return type || 'وحدة';
    }
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
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">لا توجد صورة</span>
              </div>
            )}
            <Badge className={`absolute top-4 right-4 ${getStatusColor(unit.status)}`} variant="secondary">
              {getStatusText(unit.status)}
            </Badge>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-xl font-medium">{unit.name}</h3>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {renderStars(unit.rating)}
                  </div>
                  <span className="ml-2 text-muted-foreground">{unit.rating.toFixed(1)}</span>
                </div>
              </div>
              <span className="text-lg font-bold text-foreground">
                {unit.pricePerNight} <span className="text-sm text-muted-foreground">ر.س/الليلة</span>
              </span>
            </div>

            <div className="flex items-center mt-2">
              <MapPin className="h-4 w-4 text-muted-foreground ml-1" />
              <span className="text-sm text-muted-foreground">{unit.hotelLocation}</span>
            </div>

            <div className="flex items-center mt-3">
              <span className="text-xs text-muted-foreground">الدور: {unit.floor}</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatUnitType(unit.type)}</span>
            </div>

            {unit.imageUrls && unit.imageUrls.length > 1 && (
              <div className="flex gap-2 mt-3">
                {unit.imageUrls.slice(1, 4).map((imgUrl, idx) => (
                  <div key={idx} className="w-10 h-10 rounded-md overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={`${unit.name} مصغّرة ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {unit.imageUrls.length > 4 && (
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs">+{unit.imageUrls.length - 4}</span>
                  </div>
                )}
              </div>
            )}

            <Button className="w-full mt-6 border-amber-800/30" variant="outline">
              عرض التفاصيل
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}