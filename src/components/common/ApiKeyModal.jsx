import React, { useState, useEffect } from 'react';
import { KeyRound, Check, X, ShieldCheck, ExternalLink } from 'lucide-react';
import { getActiveAccessKey, saveActiveAccessKey } from '../../services/apiClient';

export function ApiKeyModal({ isOpen, onClose, onKeySaved }) {
  const [keyInput, setKeyInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeyInput(getActiveAccessKey() || '');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveActiveAccessKey(keyInput);
    setStatusMessage('Key berhasil disimpan!');
    setTimeout(() => {
      onKeySaved();
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
            <KeyRound size={20} color="var(--accent-primary)" />
            <span>Pengaturan Unsplash API Key</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Untuk memuat ribuan gambar beresolusi tinggi langsung dari Unsplash, masukkan <strong>Access Key</strong> Anda di bawah ini:
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Unsplash Access Key
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Contoh: pYv-Vv6... atau masukkan key Anda"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Tersimpan aman di browser Anda (localStorage) atau dapat diatur di file <code>.env</code>.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a
              href="https://unsplash.com/developers"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--accent-teal)', textDecoration: 'none' }}
            >
              <span>Daftar Unsplash Developer</span>
              <ExternalLink size={14} />
            </a>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="nav-btn"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="nav-btn active"
              >
                {statusMessage ? <Check size={16} /> : null}
                <span>{statusMessage || 'Simpan Key'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
