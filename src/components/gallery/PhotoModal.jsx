import React, { useEffect } from 'react';
import { X, Heart, Download, ExternalLink, MapPin, Sparkles } from 'lucide-react';

export function PhotoModal({ photo, isOpen, onClose, isFavorite, onToggleFavorite }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !photo) return null;

  const authorName = photo.user?.name || 'Fotografer';
  const authorProfile = `${photo.user?.links?.html || 'https://unsplash.com'}?utm_source=frameify_app&utm_medium=referral`;
  const authorAvatar = photo.user?.profile_image?.medium || photo.user?.profile_image?.small;
  const fullImageUrl = photo.urls?.regular || photo.urls?.full;
  const downloadUrl = photo.links?.download || photo.urls?.full;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href={authorProfile}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'inherit' }}
            >
              {authorAvatar && (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{authorName}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lihat portofolio di Unsplash</p>
              </div>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className={`nav-btn ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(photo)}
            >
              <Heart size={16} fill={isFavorite ? '#fff' : 'none'} />
              <span>{isFavorite ? 'Tersimpan' : 'Simpan'}</span>
            </button>

            <button type="button" className="modal-close-btn" onClick={onClose} title="Tutup (Esc)">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Gambar Resolusi Tinggi */}
        <div className="modal-image-wrapper">
          <img
            src={fullImageUrl}
            alt={photo.alt_description || photo.description || 'Pemandangan Lanskap'}
            className="modal-img"
          />
        </div>

        {/* Footer Info & Download */}
        <div className="modal-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '65%' }}>
            {photo.description || photo.alt_description ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                {photo.description || photo.alt_description}
              </p>
            ) : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {photo.location?.title && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} color="var(--accent-teal)" />
                  {photo.location.title}
                </span>
              )}
              {photo.width && photo.height && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={14} />
                  {photo.width} × {photo.height} px
                </span>
              )}
            </div>
          </div>

          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="modal-download-btn"
          >
            <Download size={18} />
            <span>Unduh Resolusi Asli</span>
          </a>
        </div>
      </div>
    </div>
  );
}
