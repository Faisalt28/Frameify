import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ImageStreamHero } from './components/ui/image-stream-hero';
import { Gallery } from './components/ui/shared-element-gallery';
import { ImageGallery } from './components/ui/image-gallery';
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
  const {
    photos: galleryPhotos,
    loading: galleryLoading,
    loadingMore: galleryLoadingMore,
    hasMore: galleryHasMore,
    loadMore: galleryLoadMore,
  } = usePhotos({
    query: debouncedSearch,
    categoryId: selectedCategory?.id || 'all',
    random: selectedCategory?.id === 'all' && !debouncedSearch,
  });

  // Target sentinel untuk infinite scroll
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (view !== 'homepage') return;

    const currentTarget = loadMoreRef.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && galleryHasMore && !galleryLoadingMore && !galleryLoading) {
          galleryLoadMore();
        }
      },
      {
        rootMargin: '450px', // Fetch 450px sebelum mentok ke bawah untuk pengalaman mulus
        threshold: 0.05,
      }
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [view, galleryHasMore, galleryLoadingMore, galleryLoading, galleryLoadMore]);

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
      width: p.width,
      height: p.height,
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
        <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden">
          {/* Tombol Pengganti Tema Minimalis di Pojok Kanan Atas */}
          <button
            type="button"
            onClick={toggleTheme}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 p-2.5 rounded-full border border-border bg-card/70 backdrop-blur-md text-foreground shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
            <div className="relative z-10 flex h-full flex-col items-center justify-between py-8 sm:py-12 px-4 text-center pointer-events-auto">
              {/* Judul Bersih Full Kapital "FRAMEIFY" */}
              <div className="px-4 pt-2">
                <h1 className="text-balance text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                  FRAMEIFY
                </h1>
              </div>

              {/* Area Bawah: Tombol Start & Deskripsi */}
              <div className="flex flex-col items-center gap-3.5 sm:gap-5 px-4 max-w-md pb-4 sm:pb-2">
                <button
                  type="button"
                  onClick={handleStart}
                  className="px-9 py-3 sm:px-10 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-xl bg-black text-white hover:bg-neutral-800 border border-black dark:bg-white dark:text-black dark:hover:bg-neutral-100 dark:border-white"
                >
                  Start
                </button>

                {/* Deskripsi Aplikasi dalam Bahasa Inggris */}
                <p className="text-balance text-xs sm:text-sm text-muted-foreground leading-relaxed px-2">
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
        <div className="w-full min-h-[100dvh] flex flex-col">
          {/* Header Sticky Full Screen */}
          <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/85 border-b border-border transition-colors">
            <div className="w-full px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
              {/* Brand Logo FRAMEIFY (Klik untuk ke Landing Page) */}
              <button
                type="button"
                onClick={() => setView('landing')}
                className="flex items-center gap-2 text-foreground font-black text-lg sm:text-xl tracking-tight select-none hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                title="Kembali ke Landing Page"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
                  <Compass size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <span className="tracking-tighter hidden min-[400px]:inline">FRAMEIFY</span>
              </button>

              {/* Search Bar dengan Ikon Filter di Dalamnya */}
              <div className="flex-1 max-w-xl relative min-w-0" ref={filterRef}>
                <div className="flex items-center gap-1.5 sm:gap-2.5 bg-card border border-border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-foreground shadow-sm focus-within:ring-2 focus-within:ring-foreground/20 transition-all">
                  <Search size={16} className="text-muted-foreground flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      selectedCategory.id !== 'all'
                        ? `${selectedCategory.label.replace(/^[^\w\s]+/, '').trim()}...`
                        : 'Search photos...'
                    }
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-foreground placeholder:text-muted-foreground min-w-0"
                  />

                  {/* Tombol Clear Search */}
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full transition-colors flex-shrink-0"
                      title="Clear search"
                    >
                      <X size={14} />
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
                        ? 'bg-black text-white dark:bg-white dark:text-black px-2'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title="Filter Kategori"
                    aria-label="Filter"
                  >
                    <SlidersHorizontal size={15} />
                    {selectedCategory.id !== 'all' && (
                      <span className="text-[11px] font-semibold max-w-[85px] truncate hidden md:inline">
                        {selectedCategory.label.replace(/^[^\w\s]+/, '').trim()}
                      </span>
                    )}
                  </button>
                </div>

                {/* Dropdown Menu Filter (Responsive width dan tidak pernah terpotong di tepi layar) */}
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 w-[min(18rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] bg-card/95 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl p-2 z-50 animate-fade-in">
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

                    <div className="space-y-1 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
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
                            <span className="truncate pr-2">{cat.label}</span>
                            {isSelected && <Check size={14} className="flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <div className="flex items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 sm:p-2.5 rounded-full border border-border bg-card text-foreground shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun size={16} className="text-amber-400 sm:w-[17px] sm:h-[17px]" />
                  ) : (
                    <Moon size={16} className="text-blue-500 sm:w-[17px] sm:h-[17px]" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Konten Galeri Full Screen */}
          <main className="flex-1 w-full px-2.5 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
            {galleryLoading && homepageImages.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center gap-3.5 text-muted-foreground text-sm">
                <div className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                <p>Memuat galeri foto...</p>
              </div>
            ) : homepageImages.length === 0 ? (
              <div className="py-32 text-center text-muted-foreground text-sm">
                Tidak ada foto yang cocok dengan "{searchTerm}".
              </div>
            ) : (
              <>
                <Gallery>
                  <ImageGallery images={homepageImages} />
                </Gallery>

                {/* Sentinel Infinite Scroll Target */}
                <div
                  ref={loadMoreRef}
                  className="w-full py-8 flex flex-col items-center justify-center min-h-[90px]"
                >
                  {galleryLoadingMore && (
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-md text-foreground text-xs sm:text-sm font-medium">
                      <div className="w-4 h-4 border-2 border-foreground/40 border-t-foreground rounded-full animate-spin flex-shrink-0" />
                      <span>Memuat lebih banyak gambar...</span>
                    </div>
                  )}
                  {!galleryHasMore && homepageImages.length > 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground/75 tracking-wider font-medium">
                      ✨ Semua foto telah ditampilkan
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
