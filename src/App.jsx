import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ImageStreamHero } from './components/ui/image-stream-hero';
import { Gallery, GalleryGrid, GalleryImage } from './components/ui/shared-element-gallery';
import { usePhotos } from './hooks/usePhotos';
import { useDebounce } from './hooks/useDebounce';
import { CATEGORIES } from './constants/categories';
import { Sun, Moon, Search, X, SlidersHorizontal, Check, Compass } from 'lucide-react';

export default function App() {
  // Mode tampilan: 'landing' (3D Hero) atau 'homepage' (Katalog Full Screen)
  // Menyimpan posisi halaman di localStorage dan URL hash agar tidak reset saat refresh
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#gallery') {
      return 'homepage';
    }
    return localStorage.getItem('frameify_view') || 'landing';
  });

  useEffect(() => {
    localStorage.setItem('frameify_view', view);
    if (view === 'homepage') {
      window.location.hash = 'gallery';
    } else {
      if (window.location.hash === '#gallery') {
        history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [view]);

  // Tema: 'dark' (Hitam pekat) atau 'light' (Putih murni)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('frameify_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('frameify_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State Search & Kategori untuk Homepage
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  // Default filter: 'all' (Semua Gambar tanpa filter & tanpa limit)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Tutup dropdown filter jika user klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    }
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  // Hook foto untuk Homepage Gallery
  const { photos: galleryPhotos, loading: galleryLoading } = usePhotos({
    query: debouncedSearch,
    categoryId: selectedCategory?.id || 'all',
    random: selectedCategory?.id === 'all' && !debouncedSearch,
  });

  // Hook foto untuk Landing Page (selalu acak)
  const { photos: landingPhotos } = usePhotos({
    random: true,
  });

  // Format gambar untuk 3D Hero
  const landingStreamImages = landingPhotos && landingPhotos.length > 0
    ? landingPhotos.map((p) => ({
        src: p.urls?.regular || p.urls?.small,
        alt: p.alt_description || p.description || 'FRAMEIFY',
      }))
    : [];

  // Format gambar untuk Shared Element Gallery Homepage
  const homepageImages = useMemo(() => {
    return (galleryPhotos || []).map((p) => ({
      id: String(p.id),
      src: p.urls?.regular || p.urls?.small,
      alt: p.alt_description || p.description || 'FRAMEIFY Photography',
    }));
  }, [galleryPhotos]);

  // Pindah ke homepage
  const handleStart = () => {
    setView('homepage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* =========================================================================
          VIEW 1: LANDING PAGE (3D ImageStreamHero dengan tombol Start)
          ========================================================================= */}
      {view === 'landing' ? (
        <div className="relative w-screen h-screen overflow-hidden">
          {/* Tombol Pengganti Tema Minimalis di Pojok Kanan Atas */}
          <button
            type="button"
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-30 p-2.5 rounded-full border border-border bg-card/60 backdrop-blur-md text-foreground shadow-md hover:scale-110 transition-all cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-blue-500" />
            )}
          </button>

          {/* 3D Image Stream Hero */}
          <ImageStreamHero
            images={landingStreamImages}
            className="w-full h-full border-none bg-background"
          >
            <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center pointer-events-auto">
              {/* Judul Bersih Full Kapital "FRAMEIFY" */}
              <div className="px-6">
                <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                  FRAMEIFY
                </h1>
              </div>

              {/* Area Bawah: Tombol Start & Deskripsi */}
              <div className="flex flex-col items-center gap-5 px-6 max-w-md">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-10 py-3.5 rounded-full font-semibold text-sm sm:text-base tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-xl bg-black text-white hover:bg-neutral-800 border border-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white"
                >
                  Start
                </button>

                {/* Deskripsi Aplikasi dalam Bahasa Inggris */}
                <p className="text-balance text-sm text-muted-foreground">
                  An immersive visual gallery bringing breathtaking landscapes, wide panoramas, and contemporary art into a fluid 3D perspective corridor.
                </p>
              </div>
            </div>
          </ImageStreamHero>
        </div>
      ) : (
        /* =========================================================================
           VIEW 2: HOMEPAGE FULL SCREEN (Search bar dengan icon filter terintegrasi di dalam)
           ========================================================================= */
        <div className="w-full min-h-screen flex flex-col">
          {/* Header Sticky Full Screen */}
          <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/85 border-b border-border transition-colors">
            <div className="w-full px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
              {/* Brand Logo FRAMEIFY (Klik untuk ke Landing Page) */}
              <button
                type="button"
                onClick={() => setView('landing')}
                className="flex items-center gap-2.5 text-foreground font-black text-xl tracking-tight select-none hover:opacity-80 transition-opacity cursor-pointer"
                title="Kembali ke Landing Page"
              >
                <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
                  <Compass size={18} />
                </div>
                <span className="tracking-tighter">FRAMEIFY</span>
              </button>

              {/* Search Bar dengan Ikon Filter di Dalamnya */}
              <div className="flex-1 max-w-xl relative" ref={filterRef}>
                <div className="flex items-center gap-2.5 bg-card border border-border rounded-full px-4 py-2 text-foreground shadow-sm focus-within:ring-2 focus-within:ring-foreground/20 transition-all">
                  <Search size={18} className="text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      selectedCategory.id !== 'all'
                        ? `Cari di ${selectedCategory.label}...`
                        : 'Search all photos...'
                    }
                    className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                  />

                  {/* Tombol Clear Search */}
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors"
                      title="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}

                  {/* Pembatas Tipis */}
                  <div className="h-4 w-[1px] bg-border mx-0.5 flex-shrink-0" />

                  {/* Ikon Filter di Dalam Search Bar */}
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`p-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                      selectedCategory.id !== 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black px-2.5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title="Filter Kategori"
                    aria-label="Filter"
                  >
                    <SlidersHorizontal size={16} />
                    {selectedCategory.id !== 'all' && (
                      <span className="text-[11px] font-semibold max-w-[85px] truncate hidden sm:inline">
                        {selectedCategory.label.replace(/^[^\w\s]+/, '').trim()}
                      </span>
                    )}
                  </button>
                </div>

                {/* Dropdown Menu Filter */}
                {isFilterOpen && (
                  <div className="absolute top-full mt-2.5 right-0 w-72 bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 mb-1">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Filter Kategori
                      </span>
                      {selectedCategory.id !== 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(CATEGORIES[0]);
                            setIsFilterOpen(false);
                          }}
                          className="text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                      {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory.id === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsFilterOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            <span>{cat.label}</span>
                            {isSelected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-full border border-border bg-card text-foreground shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun size={17} className="text-amber-400" />
                  ) : (
                    <Moon size={17} className="text-blue-500" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Konten Galeri Full Screen */}
          <main className="flex-1 w-full px-3 sm:px-5 md:px-6 lg:px-8 py-6">
            {galleryLoading && homepageImages.length === 0 ? (
              <div className="py-32 text-center text-muted-foreground text-sm">
                Memuat galeri foto...
              </div>
            ) : homepageImages.length === 0 ? (
              <div className="py-32 text-center text-muted-foreground text-sm">
                Tidak ada foto yang cocok dengan "{searchTerm}".
              </div>
            ) : (
              <Gallery>
                <GalleryGrid className="w-full">
                  {homepageImages.map((image) => (
                    <GalleryImage
                      key={image.id}
                      id={image.id}
                      src={image.src}
                      alt={image.alt}
                    />
                  ))}
                </GalleryGrid>
              </Gallery>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
