import { PublicUnitsDisplayServer } from '@/components/public-units-display-server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';

// Server component for the main page
export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const city = searchParams.city ? String(searchParams.city) : '';
  
  // Server-side search form submission handler
  async function handleSearch(formData: FormData) {
    'use server';
    const destination = formData.get('destination') as string;
    if (destination) {
      // Note: For actual redirect, we'd need to use a server action or redirect
      // For now, this is just to show the handler
      console.log('Searching for:', destination);
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-medium tracking-tight">WhelHost</span>
          </Link>

          {/* Search Form */}
          <form action={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="destination"
                placeholder="Search by city..."
                defaultValue={city}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background"
              />
              <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <div>
            <Button variant="outline" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl font-medium tracking-tight lg:text-5xl">
              {city ? `Properties in ${city}` : 'Search Properties'}
            </h1>
            {city && (
              <p className="mt-4 text-lg text-muted-foreground">
                Discover the finest accommodations in {city}
              </p>
            )}
          </div>

          {city ? (
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-medium">Properties in {city}</h2>
                <p className="text-muted-foreground">Showing units available in {city}</p>
              </div>

              <PublicUnitsDisplayServer city={city} />
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium">No city selected</h3>
              <p className="text-muted-foreground mt-2">Please search for a city to see available properties</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}