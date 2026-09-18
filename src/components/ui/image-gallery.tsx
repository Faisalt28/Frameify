'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'framer-motion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { GalleryContext } from '@/components/ui/shared-element-gallery';

// Tipe data item gambar
export interface ImageItem {
  id: string;
  src: string;
  alt?: string;
  ratio?: number;
  placeholder?: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryProps {
  images?: ImageItem[];
  onImageClick?: (image: ImageItem) => void;
  className?: string;
}

// Koleksi gambar default (Unsplash stock HD) dengan rasio deterministik
const DEFAULT_STOCK_IMAGES: ImageItem[] = [
  { id: 'stock-1', src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', alt: 'Mountain Lake Sunrise', ratio: 16 / 9 },
  { id: 'stock-2', src: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80', alt: 'Tuscany Rolling Hills', ratio: 4 / 3 },
  { id: 'stock-3', src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80', alt: 'Concept Digital Art', ratio: 1 },
  { id: 'stock-4', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', alt: 'Nordic Mountains Fjord', ratio: 16 / 9 },
  { id: 'stock-5', src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80', alt: 'Aurora Borealis Green Sky', ratio: 4 / 3 },
  { id: 'stock-6', src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', alt: 'Golden Hour Sunset Ocean', ratio: 16 / 9 },
  { id: 'stock-7', src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80', alt: 'Misty Pine Forest', ratio: 3 / 4 },
  { id: 'stock-8', src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80', alt: 'Enchanted Autumn Path', ratio: 4 / 3 },
  { id: 'stock-9', src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80', alt: 'Yosemite Wilderness River', ratio: 16 / 9 },
  { id: 'stock-10', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80', alt: 'Milky Way Mountain Night', ratio: 4 / 3 },
  { id: 'stock-11', src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', alt: 'Panoramic Green Canyon', ratio: 16 / 9 },
  { id: 'stock-12', src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80', alt: 'Serene Meadow Sunset', ratio: 1 },
];

/**
 * Menghitung aspect ratio deterministik berdasarkan ID
 * Menghindari Math.random() agar gambar tidak refresh/berkedip saat scroll
 */
function getDeterministicRatio(id: string, customRatio?: number, width?: number, height?: number): number {
  if (customRatio && !isNaN(customRatio)) return customRatio;
  if (width && height && height > 0) return width / height;

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const ratios = [16 / 9, 4 / 3, 1.25, 3 / 2, 1.4];
  const index = Math.abs(hash) % ratios.length;
  return ratios[index];
}

export function ImageGallery({ images, onImageClick, className }: ImageGalleryProps) {
  const displayImages = images && images.length > 0 ? images : DEFAULT_STOCK_IMAGES;
  const galleryContext = React.useContext(GalleryContext);

  const handleImageClick = (image: ImageItem) => {
    if (onImageClick) {
      onImageClick(image);
    } else if (galleryContext?.setSelectedImage) {
      galleryContext.setSelectedImage(image);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/*
        Layout Masonry Responsif:
        - Mobile: 2 kolom (columns-2 gap-2.5)
        - Tablet: 3 kolom (md:columns-3 gap-4)
        - Desktop: 4 - 6 kolom (lg:columns-4 xl:columns-5 2xl:columns-6 gap-4)
        Menggunakan CSS columns agar gambar yang sudah dimuat TIDAK direfresh saat scroll/load more
      */}
      <div className="columns-2 gap-2.5 sm:columns-2 sm:gap-4 md:columns-3 md:gap-4 lg:columns-4 xl:columns-5 2xl:columns-6 w-full">
        {displayImages.map((image) => {
          const ratio = getDeterministicRatio(image.id, image.ratio, image.width, image.height);
          return (
            <div key={image.id} className="break-inside-avoid mb-2.5 sm:mb-4">
              <AnimatedImage
                alt={image.alt || 'FRAMEIFY Photo'}
                src={image.src}
                ratio={ratio}
                placeholder={image.placeholder}
                onClick={() => handleImageClick(image)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface AnimatedImageProps {
  alt: string;
  src: string;
  className?: string;
  placeholder?: string;
  ratio: number;
  onClick?: () => void;
}

/**
 * AnimatedImage memoized:
 * - Tidak akan re-render atau refresh jika props tidak berubah
 * - Menggunakan once: true pada useInView
 * - Menjaga status isLoading agar gambar tetap tampil mulus saat item baru di-append
 */
export const AnimatedImage = memo(function AnimatedImage({
  alt,
  src,
  ratio,
  placeholder,
  className,
  onClick,
}: AnimatedImageProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '200px' });
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const imgSrc = hasError && placeholder ? placeholder : src;

  const handleError = () => {
    if (placeholder) {
      setHasError(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative size-full rounded-xl overflow-hidden cursor-zoom-in border border-border/40 bg-card/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.015] active:scale-[0.985]",
        className
      )}
    >
      <AspectRatio
        ref={ref}
        ratio={ratio}
        className="relative size-full bg-muted/30 overflow-hidden"
      >
        <img
          alt={alt}
          src={imgSrc}
          className={cn(
            'size-full rounded-xl object-cover opacity-0 transition-opacity duration-700 ease-out',
            {
              'opacity-100': isInView && !isLoading,
            },
          )}
          onLoad={() => setIsLoading(false)}
          loading="lazy"
          decoding="async"
          onError={handleError}
        />

        {/* Shimmer skeleton saat memuat */}
        {isLoading && (
          <div className="absolute inset-0 bg-muted/40 animate-pulse pointer-events-none" />
        )}

        {/* Overlay hover halus untuk estetika mewah */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none rounded-xl" />
      </AspectRatio>
    </div>
  );
});
