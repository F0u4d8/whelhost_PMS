import { NextRequest } from 'next/server';
import { getPublicUnits, PublicUnit } from '@/lib/public-units-service';

export const dynamic = 'force-dynamic'; // Ensure the API route is not cached

export async function GET(request: NextRequest) {
  try {
    const units = await getPublicUnits();
    return Response.json(units);
  } catch (error) {
    console.error('Error in public units API:', error);
    return Response.json({ error: 'Failed to fetch public units' }, { status: 500 });
  }
}