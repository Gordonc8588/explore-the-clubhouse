"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface CloudinaryResult {
  info: {
    secure_url: string;
    public_id: string;
  };
}

export function ImageUploader({ images, onChange, maxImages = 3 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (result: CloudinaryResult) => {
    const url = result.info.secure_url;
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((url, index) => (
            <div key={url} className="group relative">
              <div className="aspect-[16/9] overflow-hidden rounded-lg border border-gray-200">
                <Image
                  src={url}
                  alt={`Newsletter image ${index + 1}`}
                  width={400}
                  height={225}
                  className="h-full w-full object-cover"
                />
              </div>
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

      {/* Upload Button */}
      {images.length < maxImages && (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "newsletter_uploads"}
          options={{
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
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
          onSuccess={(result) => {
            handleUpload(result as CloudinaryResult);
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition-colors hover:border-solid disabled:cursor-not-allowed disabled:opacity-50"
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
                      ? "Add Images"
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
      </p>
    </div>
  );
}
