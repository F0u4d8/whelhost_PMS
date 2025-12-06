import { createBrowserClient } from '@supabase/ssr';

// Function to create a Supabase browser client
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Function to upload multiple images to Supabase storage
export async function uploadMultipleImagesToStorage(
  files: File[],
  bucketName: string,
  folderPath: string = ''
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const supabase = createSupabaseBrowserClient();
  const uploadedUrls: string[] = [];
  const errors: string[] = [];

  // Ensure the folder path ends with a slash if it's not empty
  const folderPathWithSlash = folderPath ? `${folderPath}/` : '';

  for (const file of files) {
    // Sanitize the filename to remove special characters and spaces
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_') // Replace special characters with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, ''); // Remove leading and trailing underscores

    // Generate a unique filename with timestamp
    const fileName = `${folderPathWithSlash}${Date.now()}_${cleanFileName}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      errors.push(error.message);
    } else if (data) {
      // Get the public URL for the uploaded file
      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (publicData) {
        uploadedUrls.push(publicData.publicUrl);
      }
    }
  }

  return {
    success: errors.length === 0,
    urls: uploadedUrls,
    errors
  };
}

// Function to upload a single image to Supabase storage
export async function uploadSingleImageToStorage(
  file: File,
  bucketName: string,
  folderPath: string = '',
  customFileName?: string
): Promise<{ success: boolean; url: string | null; error: string | null }> {
  const supabase = createSupabaseBrowserClient();

  // Ensure the folder path ends with a slash if it's not empty
  const folderPathWithSlash = folderPath ? `${folderPath}/` : '';

  // Generate filename
  let fileName = customFileName
    ? `${folderPathWithSlash}${customFileName}`
    : `${folderPathWithSlash}${Date.now()}_${file.name}`;

  // Sanitize the filename if no custom filename was provided
  if (!customFileName) {
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_') // Replace special characters with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
      .replace(/^_+|_+$/g, ''); // Remove leading and trailing underscores

    fileName = `${folderPathWithSlash}${Date.now()}_${cleanFileName}`;
  }

  // Upload file to Supabase storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      url: null,
      error: error.message
    };
  }

  // Get the public URL for the uploaded file
  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  if (publicData) {
    return {
      success: true,
      url: publicData.publicUrl,
      error: null
    };
  } else {
    return {
      success: false,
      url: null,
      error: 'Could not generate public URL for uploaded file'
    };
  }
}

// Function to delete images from Supabase storage
export async function deleteImagesFromStorage(
  imageUrls: string[],
  bucketName: string
): Promise<{ success: boolean; errors: string[] }> {
  const supabase = createSupabaseBrowserClient();
  const errors: string[] = [];

  // Extract file paths from URLs
  const filePaths = imageUrls.map(url => {
    // Extract path from public URL (format: https://<domain>/<bucket>/public/<path>)
    const urlParts = url.split('/public/');
    if (urlParts.length > 1) {
      return urlParts[1];
    }
    return url;
  });

  for (const path of filePaths) {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      errors.push(error.message);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}