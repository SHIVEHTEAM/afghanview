import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ImageUploadProps {
  onImageUploaded: (
    imageUrl: string,
    imageData: { width: number; height: number }
  ) => void;
  currentImageUrl?: string;
  restaurantId: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImageUrl,
  restaurantId,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Get image dimensions
      const dimensions = await getImageDimensions(file);

      // Validate dimensions (recommended: 1920x1080 or similar aspect ratio)
      const aspectRatio = dimensions.width / dimensions.height;
      if (aspectRatio < 1.5 || aspectRatio > 2.2) {
        setError(
          "Image should have a landscape aspect ratio (recommended: 16:9 or 2:1)"
        );
        setIsUploading(false);
        return;
      }

      if (dimensions.width < 1200 || dimensions.height < 600) {
        setError("Image should be at least 1200x600 pixels for best quality");
        setIsUploading(false);
        return;
      }

      // Upload to Supabase Storage
      const fileName = `${restaurantId}/${Date.now()}-${file.name}`;

      console.log("Uploading to bucket: slideshow-media");
      console.log("File name:", fileName);

      const { data, error: uploadError } = await supabase.storage
        .from("slideshow-media")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);

        // Provide specific error messages for common issues
        if (
          uploadError.message.includes("bucket") ||
          uploadError.message.includes("not found")
        ) {
          throw new Error(
            "Storage bucket not found. Please run the storage setup script first."
          );
        } else if (
          uploadError.message.includes("policy") ||
          uploadError.message.includes("permission")
        ) {
          throw new Error(
            "Storage permissions not configured. Please set up storage policies in Supabase dashboard."
          );
        } else if (uploadError.message.includes("authenticated")) {
          throw new Error(
            "Authentication required. Please sign in to upload images."
          );
        } else {
          throw uploadError;
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("slideshow-media")
        .getPublicUrl(fileName);

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      console.log("Upload successful, public URL:", urlData.publicUrl);

      // Store image metadata in database
      try {
        const { data: mediaFile, error: dbError } = await supabase
          .from("media_files")
          .insert({
            filename: fileName,
            original_filename: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            width: dimensions.width,
            height: dimensions.height,
            business_id: restaurantId,
            uploaded_by: null, // Will be set by RLS policy
            media_type: "image",
            is_public: false,
          })
          .select()
          .single();

        if (dbError) {
          console.warn("Failed to store image metadata in database:", dbError);
          // Don't fail the upload if metadata storage fails
        }
      } catch (dbError) {
        console.warn("Failed to store image metadata in database:", dbError);
        // Don't fail the upload if metadata storage fails
      }

      setUploadProgress(100);
      onImageUploaded(urlData.publicUrl, dimensions);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getImageDimensions = (
    file: File
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageUploaded("", { width: 0, height: 0 });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${
            isUploading
              ? "border-blue-300 bg-blue-50"
              : previewUrl
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-purple-600 hover:bg-gray-50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-afghan-green"></div>
            </div>
            <p className="text-sm text-gray-600">
              Uploading... {uploadProgress}%
            </p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-2">
            <div className="relative w-32 h-20 mx-auto">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full p-1 hover:bg-pink-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-purple-600">
              Image uploaded successfully
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-600">
              Click to upload image or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Recommended: 1920x1080 (16:9), max 10MB
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {error.includes("Storage bucket") && (
                <div className="mt-2 text-xs text-red-600">
                  <p>To fix this, run:</p>
                  <code className="bg-pink-100 px-2 py-1 rounded">
                    node scripts/setup-storage.js
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          Image Requirements:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Landscape orientation (16:9 or 2:1 aspect ratio)</li>
          <li>• Minimum size: 1200x600 pixels</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
