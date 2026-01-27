"use client";

import { useState, useEffect, useCallback } from "react";
import { CldUploadWidget } from "next-cloudinary";
import {
  ImagePlus,
  X,
  Loader2,
  FolderOpen,
  Upload,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface LibraryImage {
  id: string;
  url: string;
  public_id: string | null;
  label: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  source?: "ads" | "newsletter";
}

interface PrintAdImagePickerProps {
  label: string;
  description?: string;
  imageUrl: string | null;
  onChange: (url: string | null) => void;
  optional?: boolean;
}

interface CloudinaryResult {
  info: {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
  };
}

type TabType = "upload" | "library";

export function PrintAdImagePicker({
  label,
  description,
  imageUrl,
  onChange,
  optional = false,
}: PrintAdImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("library");
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqicgqgmx";
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "newsletter_uploads";

  // Fetch library images when component mounts or tab changes
  useEffect(() => {
    if (activeTab === "library" && libraryImages.length === 0) {
      fetchLibraryImages();
    }
  }, [activeTab]);

  const fetchLibraryImages = async () => {
    setIsLoadingLibrary(true);
    setLibraryError(null);
    try {
      // Fetch from both ad and newsletter libraries
      const response = await fetch("/api/admin/ads/images?source=all&limit=50");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setLibraryImages(data.images || []);
    } catch (error) {
      console.error("Error fetching library images:", error);
      setLibraryError("Failed to load image library");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Save uploaded image to library
  const saveToLibrary = async (info: CloudinaryResult["info"]) => {
    try {
      await fetch("/api/admin/ads/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: info.secure_url,
          public_id: info.public_id,
          width: info.width,
          height: info.height,
        }),
      });
      // Refresh library
      fetchLibraryImages();
    } catch (error) {
      console.error("Error saving image to library:", error);
    }
  };

  const handleUploadSuccess = useCallback(
    (result: CloudinaryResult) => {
      const info = result.info;
      onChange(info.secure_url);
      saveToLibrary(info);
      setIsUploading(false);
    },
    [onChange]
  );

  const handleSelectFromLibrary = (image: LibraryImage) => {
    if (imageUrl === image.url) {
      // Deselect if already selected
      onChange(null);
    } else {
      onChange(image.url);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium"
          style={{ color: "var(--craigies-dark-olive)" }}
        >
          {label}
          {!optional && <span className="ml-1 text-red-500">*</span>}
        </label>
        {imageUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      {/* Selected image preview */}
      {imageUrl ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-green-500 bg-gray-100">
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute right-2 top-2 rounded-full bg-green-500 p-1">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "library"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              Image Library
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload New
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "upload" ? (
            <CldUploadWidget
              uploadPreset={uploadPreset}
              options={{
                maxFiles: 1,
                folder: "print-ads",
                resourceType: "image",
                clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                maxFileSize: 10000000,
                cropping: false,
              }}
              onSuccess={(result) =>
                handleUploadSuccess(result as CloudinaryResult)
              }
              onOpen={() => setIsUploading(true)}
              onClose={() => setIsUploading(false)}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={isUploading}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isUploading ? "Uploading..." : "Click to upload image"}
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG or WebP • Max 10MB
                  </span>
                </button>
              )}
            </CldUploadWidget>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
              {isLoadingLibrary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : libraryError ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-red-500">{libraryError}</p>
                  <button
                    type="button"
                    onClick={fetchLibraryImages}
                    className="mt-2 text-sm text-blue-500 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : libraryImages.length === 0 ? (
                <div className="py-8 text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">
                    No images in library
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className="mt-2 text-sm text-blue-500 hover:underline"
                  >
                    Upload your first image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {libraryImages.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => handleSelectFromLibrary(image)}
                      className={`relative aspect-square overflow-hidden rounded-md transition-all ${
                        imageUrl === image.url
                          ? "ring-2 ring-green-500 ring-offset-2"
                          : "hover:opacity-80"
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.label || "Library image"}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                      {imageUrl === image.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PrintAdImagePicker;
