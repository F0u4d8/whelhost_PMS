'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicUnitsDisplayClient } from '@/components/public-units-display-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Star } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get('city') || '';
  const [selectedCity, setSelectedCity] = useState(city || '');
  const [searchDestination, setSearchDestination] = useState(city || '');

  // Update selected city when URL parameter changes
  useEffect(() => {
    if (city) {
      setSelectedCity(city);
      setSearchDestination(city);
    }
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDestination.trim()) {
      setSelectedCity(searchDestination);
    }
  };

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
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by city..."
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
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
              {selectedCity ? `Properties in ${selectedCity}` : 'Search Properties'}
            </h1>
            {selectedCity && (
              <p className="mt-4 text-lg text-muted-foreground">
                Discover the finest accommodations in {selectedCity}
              </p>
            )}
          </div>

          {selectedCity ? (
            <div>
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-medium">Properties in {selectedCity}</h2>
                <p className="text-muted-foreground">Showing units available in {selectedCity}</p>
              </div>
              
              <PublicUnitsDisplayClient city={selectedCity} />
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