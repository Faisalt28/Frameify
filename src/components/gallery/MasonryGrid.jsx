import React from 'react';
import { PhotoCard } from './PhotoCard';
import { ImageOff } from 'lucide-react';

export function MasonryGrid({ photos, isFavoriteFn, onToggleFavorite, onOpenDetail }) {
  if (!photos || photos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
        <ImageOff size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Tidak ada gambar ditemukan
        </h3>
        <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
          Coba gunakan kata kunci lain seperti "panoramic mountains", "fjord", atau klik kategori di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="masonry-grid animate-fade-in">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          isFavorite={isFavoriteFn(photo.id)}
          onToggleFavorite={onToggleFavorite}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  );
}
