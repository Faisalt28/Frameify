import { useState, useEffect, useCallback, useRef } from 'react';
import { photoService } from '../services/photoService';
import { getFilteredPool, CURATED_POOL } from '../constants/photoPool';

export function usePhotos({ query = '', orientation = 'landscape', categoryId = '', random = false } = {}) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  // Simpan parameter aktif dalam ref untuk mencegah race condition saat loadMore
  const paramsRef = useRef({ query, orientation, categoryId, random });
  useEffect(() => {
    paramsRef.current = { query, orientation, categoryId, random };
  }, [query, orientation, categoryId, random]);

  // Fungsi utilitas untuk mengambil batch dari pool lokal jika API limit/offline
  const getLocalBatch = useCallback((q, catId, targetPage, batchSize = 24) => {
    const fullPool = getFilteredPool(q, catId);
    if (!fullPool || fullPool.length === 0) return [];

    const startIndex = ((targetPage - 1) * batchSize) % fullPool.length;
    const batch = [];
    for (let i = 0; i < Math.min(batchSize, fullPool.length); i++) {
      const original = fullPool[(startIndex + i) % fullPool.length];
      batch.push({
        ...original,
        id: `${original.id}-p${targetPage}-${i}`,
      });
    }
    return batch;
  }, []);

  // 1. Initial Load saat filter/query berubah
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    const loadData = async () => {
      try {
        let items = [];
        if (random) {
          // Ambil batch maksimal (30) agar tampilan awal penuh dan kaya di layar lebar
          items = await photoService.getRandomPhotos({
            count: 30,
            orientation,
            query: query || 'landscape panoramic scenery nature art',
          });
        } else {
          const searchData = await photoService.searchPhotos({
            query: query || categoryId || 'landscape panoramic nature',
            orientation,
            page: 1,
            perPage: 24,
          });
          items = searchData.results || [];
          if (searchData.total_pages && 1 >= searchData.total_pages) {
            setHasMore(false);
          }
        }

        if (!ignore && Array.isArray(items) && items.length > 0) {
          // Hilangkan duplikat ID dari response API
          const seen = new Set();
          const uniqueItems = items.filter((p) => {
            const id = String(p.id);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          setPhotos(uniqueItems);
        } else if (!ignore) {
          // Fallback ke pool lokal jika hasil API kosong
          const pool = getFilteredPool(query, categoryId);
          setPhotos(pool.slice(0, 24));
          if (pool.length <= 24) {
            // Jika data pool sedikit, tetap biarkan hasMore agar bisa cycle
            setHasMore(true);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          // Fallback cerdas ke curated pool
          if (random) {
            const shuffled = [...CURATED_POOL].sort(() => Math.random() - 0.5);
            setPhotos(shuffled.slice(0, 24));
          } else {
            const pool = getFilteredPool(query, categoryId);
            setPhotos(pool.slice(0, 24));
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [query, orientation, categoryId, random]);

  // 2. Load More (Infinite Scroll) saat user scroll ke bawah
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const { query: curQuery, orientation: curOrientation, categoryId: curCatId, random: curRandom } = paramsRef.current;
    const nextPage = page + 1;

    try {
      let newItems = [];
      if (curRandom) {
        newItems = await photoService.getRandomPhotos({
          count: 24,
          orientation: curOrientation,
          query: curQuery || 'landscape panoramic scenery nature art',
        });
      } else {
        const searchData = await photoService.searchPhotos({
          query: curQuery || curCatId || 'landscape panoramic nature',
          orientation: curOrientation,
          page: nextPage,
          perPage: 24,
        });
        newItems = searchData.results || [];
        if (searchData.total_pages && nextPage >= searchData.total_pages) {
          setHasMore(false);
        }
      }

      if (Array.isArray(newItems) && newItems.length > 0) {
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const uniqueItems = newItems.filter((p) => !existingIds.has(String(p.id)));

          // Jika ada item yang duplikat ID-nya di random API, berikan suffix unik
          const safeItems = uniqueItems.length > 0
            ? uniqueItems
            : newItems.map((p, idx) => ({ ...p, id: `${p.id}-p${nextPage}-${idx}` }));

          return [...prev, ...safeItems];
        });
        setPage(nextPage);
      } else {
        // API tidak menghasilkan item tambahan, gunakan batch pool lokal
        const fallbackBatch = getLocalBatch(curQuery, curCatId, nextPage, 20);
        if (fallbackBatch.length > 0) {
          setPhotos((prev) => [...prev, ...fallbackBatch]);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      }
    } catch (_err) {
      // Jika terjadi error API (rate limit / offline), load dari pool lokal
      const fallbackBatch = getLocalBatch(curQuery, curCatId, nextPage, 20);
      if (fallbackBatch.length > 0) {
        setPhotos((prev) => [...prev, ...fallbackBatch]);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, getLocalBatch]);

  return {
    photos,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  };
}
