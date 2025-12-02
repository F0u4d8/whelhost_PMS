import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRoomImages } from '@/lib/storage/image-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    
    if (!roomId) {
      return Response.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    const images = await getRoomImages(roomId);
    
    return Response.json({ images });
  } catch (error) {
    console.error('Error getting room images:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}