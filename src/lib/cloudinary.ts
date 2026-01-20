// Cloudinary configuration and helpers
// See: https://next-cloudinary.dev/

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

// Gallery photo type
export interface GalleryPhoto {
  id: string;
  publicId: string; // Cloudinary public ID
  alt: string;
  category?: string;
}

// Generate Cloudinary URL with transformations
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  } = {}
): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    // Return placeholder if Cloudinary not configured
    return `/api/placeholder/${options.width || 400}/${options.height || 300}`;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}/${publicId}`;
}

// Get thumbnail URL (400px wide)
export function getThumbnailUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, { width: 400, height: 300, crop: 'fill' });
}

// Get full size URL for lightbox (1200px wide)
export function getFullSizeUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, { width: 1200, crop: 'fit' });
}

// Get blur placeholder URL (tiny, low quality)
export function getBlurPlaceholderUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, { width: 20, quality: 30 });
}

// Your gallery photos from Cloudinary
// Update the 'alt' descriptions and 'category' to match your photos
export const galleryPhotos: GalleryPhoto[] = [
  { id: '1', publicId: 'IMG_3328-scaled_tkpsb8', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '2', publicId: '6e5ba4bf-9c64-4b31-bca4-3e1523a17737_zqglgr', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '3', publicId: '6114853b-707b-4c3e-be86-8d20e8c2dba2-scaled_of1aga', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '4', publicId: 'd12ad9e7-690c-4cb0-8761-efb841ffbade_jgrvaf', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '5', publicId: 'IMG_1176-scaled_pemded', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '6', publicId: '8133f034-a169-43c6-9038-0f46d3517cae_xz0a88', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '7', publicId: '043917ba-162f-4160-8072-97e389e93b92-2_aswr8s', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '8', publicId: '9a27d5e0-f273-4833-8022-13d8f768d058_mlspf0', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '9', publicId: 'ed7d91f4-e867-4028-9bdb-1bd660d79b7e_w613ht', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '10', publicId: 'IMG_8408_cktueb', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '11', publicId: 'IMG_8406_ejjgwy', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '12', publicId: 'b615ecfd-3de5-443d-a1b4-b35fa544a023_smgsbt', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '13', publicId: 'e943d70a-6f1e-4780-bc15-d2b0921fcf62_xrklgb', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '14', publicId: 'PHOTO-2025-07-29-18-26-06_ixlfl6', alt: 'Clubhouse activity', category: 'Activities' },
  { id: '15', publicId: '54c29f9e-752f-4cb1-ac2e-712e9206a2df_berynp', alt: 'Clubhouse activity', category: 'Activities' },
];

// Get photos by category
export function getPhotosByCategory(category: string): GalleryPhoto[] {
  return galleryPhotos.filter(photo => photo.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return [...new Set(galleryPhotos.map(photo => photo.category).filter(Boolean) as string[])];
}
