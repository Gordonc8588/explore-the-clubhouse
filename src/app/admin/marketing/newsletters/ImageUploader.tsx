"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Loader2, Info, AlertCircle, FolderOpen, Upload, Check } from "lucide-react";
import Image from "next/image";
import type { NewsletterImage, StoredNewsletterImage } from "@/types/database";

interface ImageUploaderProps {
  images: NewsletterImage[];
  onChange: (images: NewsletterImage[]) => void;
  maxImages?: number;
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

export function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("upload");

  // Library state
  const [libraryImages, setLibraryImages] = useState<StoredNewsletterImage[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);

  // Use ref to accumulate uploads during a batch (avoids stale closure issues)
  const pendingUploadsRef = useRef<CloudinaryResult["info"][]>([]);
  const imagesRef = useRef(images);
  imagesRef.current = images; // Keep ref in sync

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqicgqgmx";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "newsletter_uploads";

  // Fetch library images when library tab is active
  useEffect(() => {
    if (activeTab === "library") {
      fetchLibraryImages();
    }
  }, [activeTab]);

  const fetchLibraryImages = async () => {
    setIsLoadingLibrary(true);
    setLibraryError(null);
    try {
      const response = await fetch("/api/admin/newsletters/images?limit=100");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setLibraryImages(data.images);
    } catch (error) {
      console.error("Error fetching library images:", error);
      setLibraryError("Failed to load image library");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Save image to library
  const saveToLibrary = async (info: CloudinaryResult["info"]) => {
    try {
      await fetch("/api/admin/newsletters/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: info.secure_url,
          public_id: info.public_id,
          width: info.width,
          height: info.height,
        }),
      });
    } catch (error) {
      console.error("Error saving image to library:", error);
    }
  };

  // Called for each successful upload - accumulate URLs
  const handleUploadSuccess = useCallback((result: CloudinaryResult) => {
    const info = result.info;
    // Add to pending if not already there or in existing images
    if (!pendingUploadsRef.current.some(p => p.secure_url === info.secure_url) &&
        !imagesRef.current.some((img) => img.url === info.secure_url)) {
      pendingUploadsRef.current.push(info);
      // Auto-save to library
      saveToLibrary(info);
    }
  }, []);

  // Called when widget closes - process all accumulated uploads
  const handleWidgetClose = useCallback(() => {
    setIsUploading(false);

    if (pendingUploadsRef.current.length > 0) {
      const currentImages = imagesRef.current;
      const newImages: NewsletterImage[] = pendingUploadsRef.current.map((info, index) => ({
        url: info.secure_url,
        label: `Image ${currentImages.length + index + 1}`,
        description: "",
      }));

      // Merge existing and new images
      onChange([...currentImages, ...newImages]);

      // Clear pending uploads
      pendingUploadsRef.current = [];
    }
  }, [onChange]);

  const handleSelectFromLibrary = (libraryImage: StoredNewsletterImage) => {
    // Check if already selected
    if (images.some((img) => img.url === libraryImage.url)) {
      // Deselect - remove from images
      const newImages = images.filter((img) => img.url !== libraryImage.url);
      const relabeled = newImages.map((img, i) => ({
        ...img,
        label: `Image ${i + 1}`,
      }));
      onChange(relabeled);
    } else if (images.length < maxImages) {
      // Select - add to images
      const newImage: NewsletterImage = {
        url: libraryImage.url,
        label: `Image ${images.length + 1}`,
        description: libraryImage.description || "",
      };
      onChange([...images, newImage]);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Relabel remaining images
    const relabeled = newImages.map((img, i) => ({
      ...img,
      label: `Image ${i + 1}`,
    }));
    onChange(relabeled);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], description };
    onChange(newImages);
  };

  const isImageSelected = (url: string) => images.some((img) => img.url === url);

  return (
    <div className="space-y-4">
      {/* Helper Tooltip */}
      <div
        className="flex items-start gap-2 rounded-lg px-3 py-2"
        style={{ backgroundColor: "rgba(122, 124, 74, 0.1)" }}
      >
        <Info
          className="mt-0.5 h-4 w-4 flex-shrink-0"
          style={{ color: "var(--craigies-olive)" }}
        />
        <p className="text-xs" style={{ color: "var(--craigies-dark-olive)" }}>
          Upload images first, then reference them in your AI prompt as "Image 1",
          "Image 2", etc. The AI will analyze each image and place them
          intelligently in your newsletter.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "upload"
              ? "border-current text-[var(--craigies-olive)]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Upload className="h-4 w-4" />
          Upload New
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "library"
              ? "border-current text-[var(--craigies-olive)]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          Image Library
        </button>
      </div>

      {/* Upload Tab Content */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          {/* Upload Error Message */}
          {uploadError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs">{uploadError}</p>
            </div>
          )}

          {/* Upload Button */}
          {images.length < maxImages && (
            <CldUploadWidget
              uploadPreset={uploadPreset}
              options={{
                cloudName: cloudName,
                maxFiles: maxImages - images.length,
                resourceType: "image",
                folder: "newsletters",
                cropping: false,
                showAdvancedOptions: false,
                sources: ["local", "url"],
                multiple: true,
                styles: {
                  palette: {
                    window: "#FFFFFF",
                    windowBorder: "#7A7C4A",
                    tabIcon: "#7A7C4A",
                    menuIcons: "#5A5C3A",
                    textDark: "#3D3D3D",
                    textLight: "#FFFFFF",
                    link: "#D4843E",
                    action: "#D4843E",
                    inactiveTabIcon: "#9CA3AF",
                    error: "#EF4444",
                    inProgress: "#D4843E",
                    complete: "#22C55E",
                    sourceBg: "#F5F4ED",
                  },
                },
              }}
              onOpen={() => {
                setIsUploading(true);
                setUploadError(null);
                pendingUploadsRef.current = []; // Reset pending uploads
              }}
              onClose={handleWidgetClose}
              onError={(error) => {
                console.error("Cloudinary upload error:", error);
                setUploadError(
                  typeof error === "string"
                    ? error
                    : "Failed to upload image. Please check the Cloudinary configuration."
                );
              }}
              onSuccess={(result) => {
                handleUploadSuccess(result as CloudinaryResult);
                setUploadError(null);
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={isUploading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-6 transition-colors hover:border-solid disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    borderColor: "var(--craigies-olive)",
                    backgroundColor: "rgba(122, 124, 74, 0.05)",
                  }}
                >
                  {isUploading ? (
                    <>
                      <Loader2
                        className="h-6 w-6 animate-spin"
                        style={{ color: "var(--craigies-olive)" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <ImagePlus
                        className="h-6 w-6"
                        style={{ color: "var(--craigies-olive)" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--craigies-dark-olive)" }}
                      >
                        {images.length === 0
                          ? "Click to Upload Images"
                          : `Add More Images (${maxImages - images.length} remaining)`}
                      </span>
                    </>
                  )}
                </button>
              )}
            </CldUploadWidget>
          )}

          {/* Help text */}
          <p className="text-xs" style={{ color: "#6B7280" }}>
            Recommended size: 1200x675px (16:9 ratio). Max {maxImages} images.
            Images are automatically saved to your library.
          </p>
        </div>
      )}

      {/* Library Tab Content */}
      {activeTab === "library" && (
        <div className="space-y-4">
          {isLoadingLibrary ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Loading library...</span>
            </div>
          ) : libraryError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs">{libraryError}</p>
            </div>
          ) : libraryImages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No images in your library yet</p>
              <p className="text-xs text-gray-400">
                Upload images to start building your collection
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Click to select images ({images.length}/{maxImages} selected)
              </p>
              <div className="grid grid-cols-4 gap-3">
                {libraryImages.map((libImg) => {
                  const selected = isImageSelected(libImg.url);
                  const canSelect = images.length < maxImages || selected;
                  return (
                    <button
                      key={libImg.id}
                      type="button"
                      onClick={() => canSelect && handleSelectFromLibrary(libImg)}
                      disabled={!canSelect}
                      className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                        selected
                          ? "border-[var(--craigies-olive)] ring-2 ring-[var(--craigies-olive)] ring-offset-2"
                          : canSelect
                          ? "border-gray-200 hover:border-gray-300"
                          : "cursor-not-allowed border-gray-100 opacity-50"
                      }`}
                    >
                      <Image
                        src={libImg.url}
                        alt={libImg.label || "Library image"}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                      {selected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--craigies-olive)]/20">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--craigies-olive)]">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      {libImg.label && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                          <p className="truncate text-xs text-white">{libImg.label}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Selected Images (shown in both tabs) */}
      {images.length > 0 && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium" style={{ color: "var(--craigies-dark-olive)" }}>
            Selected Images ({images.length})
          </h4>
          {images.map((image, index) => (
            <div
              key={image.url}
              className="group relative flex gap-4 rounded-lg border border-gray-200 p-3"
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <div className="h-20 w-32 overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={image.url}
                    alt={image.label}
                    width={128}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Label Badge */}
                <span
                  className="absolute -left-2 -top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: "var(--craigies-olive)" }}
                >
                  {image.label}
                </span>
              </div>

              {/* Description Input */}
              <div className="flex flex-1 flex-col">
                <label
                  htmlFor={`image-desc-${index}`}
                  className="mb-1 text-xs font-medium"
                  style={{ color: "var(--craigies-dark-olive)" }}
                >
                  Description (optional)
                </label>
                <input
                  id={`image-desc-${index}`}
                  type="text"
                  value={image.description || ""}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                  placeholder="e.g., Children feeding lambs, sunny day activity..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ color: "var(--craigies-dark-olive)" }}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Helps AI understand context for better placement
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
