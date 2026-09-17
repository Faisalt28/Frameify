import React from 'react';
import { Heart, Maximize2, Download } from 'lucide-react';

export function PhotoCard({ photo, isFavorite, onToggleFavorite, onOpenDetail }) {
  // Format rasio aspek untuk mencegah layout shift
  const imageUrl = photo.urls?.small || photo.urls?.regular;
  const authorName = photo.user?.name || 'Fotografer';
  const authorAvatar = photo.user?.profile_image?.medium || photo.user?.profile_image?.small;
  const authorProfile = `${photo.user?.links?.html || 'https://unsplash.com'}?utm_source=frameify_app&utm_medium=referral`;
  const likesCount = photo.likes || 0;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(photo);
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    const downloadUrl = photo.links?.download || photo.urls?.full;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="pin-card"
      onClick={() => onOpenDetail(photo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpenDetail(photo);
      }}
    >
      <div className="pin-img-wrapper" style={{ backgroundColor: photo.color || 'var(--bg-card)' }}>
        <img
          src={imageUrl}
          alt={photo.alt_description || photo.description || 'Pemandangan Lanskap'}
          loading="lazy"
          className="pin-img"
        />

        {/* Overlay saat kursor diarahkan */}
        <div className="pin-overlay">
          {/* Action buttons atas */}
          <div className="pin-top-actions">
            <button
              type="button"
              className={`pin-btn-action ${isFavorite ? 'is-saved' : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              aria-label="Favorit"
            >
              <Heart
                size={18}
                fill={isFavorite ? '#fff' : 'none'}
                color={isFavorite ? '#fff' : 'currentColor'}
              />
            </button>

            <button
              type="button"
              className="pin-btn-action"
              onClick={handleDownloadClick}
              title="Unduh foto asli"
              aria-label="Unduh"
            >
              <Download size={17} />
            </button>
          </div>

          {/* Info fotografer bawah */}
          <div className="pin-bottom-info">
            <a
              href={authorProfile}
              target="_blank"
              rel="noreferrer"
              className="pin-author"
              onClick={(e) => e.stopPropagation()}
            >
              {authorAvatar && (
                <img src={authorAvatar} alt={authorName} className="pin-avatar" />
              )}
              <span className="pin-author-name">{authorName}</span>
            </a>

            <div className="pin-stats">
              <Heart size={12} fill="currentColor" />
              <span>{likesCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
