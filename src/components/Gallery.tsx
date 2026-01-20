"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import {
  GalleryPhoto,
  getThumbnailUrl,
  getFullSizeUrl,
  getCategories,
  CLOUDINARY_CLOUD_NAME,
} from "@/lib/cloudinary";
import { Filter } from "lucide-react";

interface GalleryProps {
  photos: GalleryPhoto[];
}

export function Gallery({ photos }: GalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getCategories();
  const filteredPhotos = selectedCategory
    ? photos.filter((photo) => photo.category === selectedCategory)
    : photos;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // If Cloudinary is not configured, show placeholder gallery
  const isConfigured = !!CLOUDINARY_CLOUD_NAME;

  return (
    <>
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <Filter className="h-5 w-5 text-stone" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-forest text-white"
                : "bg-cloud text-stone hover:bg-sage/30"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 font-body text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-forest text-white"
                  : "bg-cloud text-stone hover:bg-sage/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-sage/20 shadow-[var(--shadow-md)] transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
          >
            {isConfigured ? (
              <Image
                src={getThumbnailUrl(photo.publicId)}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              // Placeholder when Cloudinary not configured
              <div className="flex h-full flex-col items-center justify-center p-4">
                <div className="h-16 w-16 rounded-full bg-sage/40" />
                <p className="mt-3 font-body text-sm text-stone">{photo.category}</p>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-forest/90 via-forest/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="font-display text-lg font-semibold text-white">
                {photo.alt}
              </p>
              {photo.category && (
                <p className="mt-1 font-body text-sm text-sage">{photo.category}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <div className="py-12 text-center">
          <p className="font-body text-lg text-stone">
            No photos in this category yet.
          </p>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={filteredPhotos.map((photo) => ({
          src: isConfigured ? getFullSizeUrl(photo.publicId) : "/placeholder.jpg",
          alt: photo.alt,
          title: photo.alt,
        }))}
        plugins={[Zoom, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 3,
        }}
        thumbnails={{
          position: "bottom",
          width: 100,
          height: 75,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
      />

      {/* Setup Instructions (only shown when not configured) */}
      {!isConfigured && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-sage bg-sage/10 p-6 text-center">
          <h3 className="font-display text-lg font-semibold text-bark">
            Cloudinary Not Configured
          </h3>
          <p className="mt-2 font-body text-stone">
            Add your Cloudinary cloud name to <code className="rounded bg-cloud px-2 py-1">.env.local</code>:
          </p>
          <pre className="mt-3 rounded-lg bg-bark p-4 text-left text-sm text-white overflow-x-auto">
            NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
          </pre>
        </div>
      )}
    </>
  );
}
