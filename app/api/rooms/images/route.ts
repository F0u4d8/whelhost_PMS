import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate form data
    const formData = await request.formData();
    const unitId = formData.get("unitId") as string;
    const images = formData.getAll("images") as File[];

    if (!unitId) {
      return Response.json({ error: "Unit ID is required" }, { status: 400 });
    }

    if (!images || images.length === 0) {
      return Response.json({ error: "At least one image is required" }, { status: 400 });
    }

    // Verify the user owns the hotel that contains this unit
    const { data: unit } = await supabase
      .from("units")
      .select("hotel_id")
      .eq("id", unitId)
      .single();

    if (!unit) {
      return Response.json({ error: "Unit not found" }, { status: 404 });
    }

    const { data: hotel } = await supabase
      .from("hotels")
      .select("id")
      .eq("id", unit.hotel_id)
      .eq("owner_id", user.id)
      .single();

    if (!hotel) {
      return Response.json({ error: "Unauthorized: You don't own this hotel" }, { status: 403 });
    }

    // Validate file types and sizes
    for (const image of images) {
      // Check file type
      if (!image.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
        return Response.json({ error: `Invalid file type for ${image.name}. Only JPEG, PNG, and WebP images are allowed.` }, { status: 400 });
      }

      // Check file size (limit to 5MB)
      if (image.size > 5 * 1024 * 1024) {
        return Response.json({ error: `File ${image.name} is too large. Maximum size is 5MB.` }, { status: 400 });
      }
    }

    // Create Supabase admin client for storage operations
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const uploadResults = [];

    // Upload each image to the 'rooms' bucket in a folder named after the unitId
    for (const image of images) {
      // Sanitize the filename to remove special characters that might cause issues with Supabase storage
      const sanitizedFileName = image.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscores
        .replace(/_{2,}/g, '_') // Replace multiple underscores with a single one
        .replace(/^_+|_+$/g, ''); // Remove leading or trailing underscores

      const fileName = `${unitId}/${Date.now()}-${sanitizedFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("rooms")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false // Don't overwrite existing files
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return Response.json({ error: `Failed to upload image: ${uploadError.message}` }, { status: 500 });
      }

      uploadResults.push({
        fileName,
        originalName: image.name,
      });
    }

    return Response.json({
      success: true,
      message: `Successfully uploaded ${uploadResults.length} image(s)`,
      files: uploadResults
    });

  } catch (error) {
    console.error("Error uploading room images:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}