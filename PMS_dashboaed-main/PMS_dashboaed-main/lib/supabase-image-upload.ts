import { createClient } from "@/lib/supabase/client"

interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

interface UploadMultipleImagesResult {
  success: boolean
  urls: string[]
  errors: string[]
}

export async function uploadImageToStorage(file: File, bucketName: string = "rooms", filePath?: string): Promise<UploadImageResult> {
  const supabase = createClient()

  try {
    // Generate a unique file name if not provided
    const fileName = filePath || `${crypto.randomUUID()}-${file.name}`

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error("Error uploading image:", error)
      return { success: false, error: error.message }
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    if (!publicUrlData?.publicUrl) {
      return { success: false, error: "Could not generate public URL" }
    }

    return {
      success: true,
      url: publicUrlData.publicUrl
    }
  } catch (error) {
    console.error("Unexpected error uploading image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}

export async function uploadMultipleImagesToStorage(files: File[], bucketName: string = "rooms"): Promise<UploadMultipleImagesResult> {
  const urls: string[] = []
  const errors: string[] = []

  // Process uploads in parallel
  const uploadPromises = files.map(file => uploadImageToStorage(file, bucketName))
  const results = await Promise.all(uploadPromises)

  results.forEach(result => {
    if (result.success && result.url) {
      urls.push(result.url)
    } else if (result.error) {
      errors.push(result.error)
    }
  })

  return {
    success: urls.length > 0,
    urls,
    errors
  }
}

export async function deleteImageFromStorage(url: string, bucketName: string = "rooms"): Promise<boolean> {
  const supabase = createClient()

  try {
    // Extract file path from the public URL
    const publicUrlPattern = new RegExp(`https://[^/]+/storage/v1/object/public/${bucketName}/(.+)`)
    const match = url.match(publicUrlPattern)

    if (!match || !match[1]) {
      console.error("Could not extract file path from URL")
      return false
    }

    const filePath = match[1]

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      console.error("Error deleting image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error deleting image:", error)
    return false
  }
}