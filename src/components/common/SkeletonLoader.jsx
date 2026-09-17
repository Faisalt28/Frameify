import React from 'react';

export function SkeletonLoader({ count = 8 }) {
  // Buat array dengan variasi tinggi agar menyerupai masonry Pinterest
  const heights = [280, 420, 320, 380, 260, 450, 340, 300];

  return (
    <div className="masonry-grid">
      {Array.from({ length: count }).map((_, index) => {
        const height = heights[index % heights.length];
        return (
          <div key={index} className="skeleton-card">
            <div className="skeleton-shimmer" style={{ height: `${height}px` }} />
            <div style={{ padding: '0.85rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <div
                className="skeleton-shimmer"
                style={{ width: '28px', height: '28px', borderRadius: '50%' }}
              />
              <div
                className="skeleton-shimmer"
                style={{ width: '50%', height: '14px', borderRadius: '4px' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
