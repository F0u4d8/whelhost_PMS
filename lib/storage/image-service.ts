import { createClient } from "@supabase/supabase-js";

// Function to get a signed URL for an image in Supabase Storage
export async function getPublicImageUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600 // URL expires in 1 hour by default
): Promise<string> {
  try {
    // Create a Supabase client with the service role key to generate signed URLs
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error(`Error getting signed URL for ${bucket}/${filePath}:`, error);
      return `/placeholder-${bucket}.jpg`; // Return a placeholder if there's an error
    }

    return data.signedUrl;
  } catch (error) {
    console.error(`Unexpected error getting signed URL for ${bucket}/${filePath}:`, error);
    return `/placeholder-${bucket}.jpg`; // Return a placeholder in case of error
  }
}

// Function to list all images in a bucket folder
export async function listImages(bucket: string, folderPath: string = ''): Promise<string[]> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`Error listing images in ${bucket}/${folderPath}:`, error);
      return [];
    }

    return data.map(file => file.name);
  } catch (error) {
    console.error(`Unexpected error listing images in ${bucket}/${folderPath}:`, error);
    return [];
  }
}

// Function to get room image URLs by room ID
export async function getRoomImages(roomId: string): Promise<string[]> {
  try {
    // Assuming room images are stored in the 'rooms' bucket with folder structure like 'roomId/image.jpg'
    const roomImages = await listImages('rooms', roomId);
    const imageUrls: string[] = [];

    for (const imageName of roomImages) {
      const imageUrl = await getPublicImageUrl('rooms', `${roomId}/${imageName}`);
      imageUrls.push(imageUrl);
    }

    return imageUrls;
  } catch (error) {
    console.error(`Error getting images for room ${roomId}:`, error);
    return [];
  }
}

// Function to get hotel image URLs by hotel ID
export async function getHotelImages(hotelId: string): Promise<string[]> {
  try {
    // Assuming hotel images are stored in the 'hotels' bucket with folder structure like 'hotelId/image.jpg'
    const hotelImages = await listImages('hotels', hotelId);
    const imageUrls: string[] = [];

    for (const imageName of hotelImages) {
      const imageUrl = await getPublicImageUrl('hotels', `${hotelId}/${imageName}`);
      imageUrls.push(imageUrl);
    }

    return imageUrls;
  } catch (error) {
    console.error(`Error getting images for hotel ${hotelId}:`, error);
    return [];
  }
}