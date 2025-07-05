// Utility functions for handling media operations

export interface MediaFile {
  id: string;
  file_path: string;
  name: string;
  url?: string; // Signed URL
}

export async function getSignedUrls(
  filePaths: string[]
): Promise<{ filePath: string; url: string | null; error?: string }[]> {
  try {
    // Get signed URLs for each file path individually
    const signedUrlPromises = filePaths.map(async (filePath) => {
      try {
        const response = await fetch(
          `/api/media/signed-url?path=${encodeURIComponent(filePath)}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.warn(`File not found: ${filePath}`);
            return {
              filePath,
              url: null,
              error: "File not found",
            };
          }
          throw new Error(
            `Failed to get signed URL for ${filePath}: ${response.statusText}`
          );
        }

        const result = await response.json();
        return {
          filePath,
          url: result.url,
        };
      } catch (error) {
        console.error(`Error getting signed URL for ${filePath}:`, error);
        return {
          filePath,
          url: null,
          error: "Failed to get signed URL",
        };
      }
    });

    const results = await Promise.all(signedUrlPromises);
    return results;
  } catch (error) {
    console.error("Error getting signed URLs:", error);
    return filePaths.map((filePath) => ({
      filePath,
      url: null,
      error: "Failed to get signed URL",
    }));
  }
}

export async function uploadMediaFile(
  file: File,
  restaurantId: string,
  userId: string
): Promise<MediaFile | null> {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Upload to Supabase via API
    const response = await fetch("/api/media/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64,
        restaurantId,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        id: result.file.id,
        file_path: result.file.file_path,
        name: file.name,
      };
    }

    return null;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}
