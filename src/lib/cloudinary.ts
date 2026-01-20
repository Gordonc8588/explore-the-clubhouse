// Cloudinary configuration and helpers
// See: https://next-cloudinary.dev/

export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

// Gallery photo type
export interface GalleryPhoto {
  id: string;
  publicId: string; // Cloudinary public ID (e.g., "gallery/photo1")
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

// Example gallery photos - replace with your actual Cloudinary public IDs
export const galleryPhotos: GalleryPhoto[] = [
  // Farm Animals
  { id: '1', publicId: 'gallery/goats', alt: 'Children meeting the goats', category: 'Farm Animals' },
  { id: '2', publicId: 'gallery/bunnies', alt: 'Bunny cuddles', category: 'Farm Animals' },
  { id: '3', publicId: 'gallery/chickens', alt: 'Feeding the chickens', category: 'Farm Animals' },
  { id: '4', publicId: 'gallery/eggs', alt: 'Egg collecting', category: 'Farm Animals' },
  { id: '5', publicId: 'gallery/pigs', alt: 'Meeting the pigs', category: 'Farm Animals' },
  { id: '6', publicId: 'gallery/lambs', alt: 'Spring lambs', category: 'Farm Animals' },

  // Outdoor Activities
  { id: '7', publicId: 'gallery/den-building', alt: 'Den building in the woods', category: 'Outdoor Activities' },
  { id: '8', publicId: 'gallery/campfire', alt: 'Campfire stories', category: 'Outdoor Activities' },
  { id: '9', publicId: 'gallery/hay-bales', alt: 'Hay bale fun', category: 'Outdoor Activities' },
  { id: '10', publicId: 'gallery/outdoor-games', alt: 'Outdoor games', category: 'Outdoor Activities' },
  { id: '11', publicId: 'gallery/nature-walk', alt: 'Nature walk exploration', category: 'Outdoor Activities' },
  { id: '12', publicId: 'gallery/pond-dipping', alt: 'Pond dipping', category: 'Outdoor Activities' },

  // Creative Activities
  { id: '13', publicId: 'gallery/nature-crafts', alt: 'Nature crafts', category: 'Creative Activities' },
  { id: '14', publicId: 'gallery/painting', alt: 'Outdoor painting', category: 'Creative Activities' },
  { id: '15', publicId: 'gallery/flower-pressing', alt: 'Flower pressing', category: 'Creative Activities' },
  { id: '16', publicId: 'gallery/mud-kitchen', alt: 'Mud kitchen play', category: 'Creative Activities' },

  // Add more photos as needed...
];

// Get photos by category
export function getPhotosByCategory(category: string): GalleryPhoto[] {
  return galleryPhotos.filter(photo => photo.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  return [...new Set(galleryPhotos.map(photo => photo.category).filter(Boolean) as string[])];
}
