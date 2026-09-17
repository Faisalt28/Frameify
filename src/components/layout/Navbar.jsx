import React from 'react';
import { Compass, Heart, KeyRound, Sparkles, Sun, Moon } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';

export function Navbar({
  searchTerm,
  onSearchChange,
  onSearchClear,
  activeTab,
  onTabChange,
  favoritesCount,
  onOpenApiKeyModal,
  hasApiKey,
  theme,
  onToggleTheme,
}) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo / Brand */}
          <a
            href="#"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('explore');
              onSearchClear();
            }}
          >
            <div className="brand-icon-wrapper">
              <Compass size={22} />
            </div>
            <span>Frameify</span>
          </a>

          {/* Search Bar */}
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            onClear={onSearchClear}
            placeholder="Cari lanskap, panorama, seni di Frameify..."
          />

          {/* Action Buttons */}
          <div className="nav-actions">
            <button
              type="button"
              className={`nav-btn ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => onTabChange('explore')}
            >
              <Sparkles size={16} />
              <span>Jelajah</span>
            </button>

            <button
              type="button"
              className={`nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => onTabChange('favorites')}
            >
              <Heart size={16} fill={activeTab === 'favorites' ? '#fff' : 'none'} />
              <span>Favorit</span>
              {favoritesCount > 0 && <span className="nav-badge">{favoritesCount}</span>}
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              className="nav-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Putih)' : 'Ganti ke Mode Gelap (Hitam)'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun size={17} color="#f59e0b" />
              ) : (
                <Moon size={17} color="#3b82f6" />
              )}
            </button>

            {/* API Key Status */}
            <button
              type="button"
              className="nav-btn"
              onClick={onOpenApiKeyModal}
              title={hasApiKey ? 'API Key terkonfigurasi' : 'Atur API Key Unsplash'}
              style={{
                borderColor: hasApiKey ? 'rgba(16, 185, 129, 0.4)' : 'rgba(230, 0, 35, 0.4)',
              }}
            >
              <KeyRound size={16} color={hasApiKey ? '#10b981' : '#ff5252'} />
              <span style={{ fontSize: '0.8rem' }}>{hasApiKey ? 'Key Aktif' : 'Atur Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
