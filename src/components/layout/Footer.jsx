import React from 'react';
import { Camera } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '2.5rem 0',
      background: 'var(--bg-secondary)',
      marginTop: 'auto',
      textAlign: 'center',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Camera size={18} color="var(--accent-primary)" />
          <span>Frameify — Visual Landscape, Panorama & Art Hub</span>
        </div>
        <p>
          Foto beresolusi tinggi disediakan secara resmi oleh{' '}
          <a
            href="https://unsplash.com/?utm_source=react_pinterest_landscape&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Unsplash API
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
