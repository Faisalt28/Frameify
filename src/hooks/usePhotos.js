import { useState, useEffect } from 'react';
import { photoService } from '../services/photoService';
import { getFilteredPool, CURATED_POOL } from '../constants/photoPool';

export function usePhotos({ query = '', orientation = 'landscape', categoryId = '', random = false } = {}) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        let items = [];
        if (random) {
          items = await photoService.getRandomPhotos({
            count: 20,
            orientation,
            query: query || 'landscape panoramic scenery',
          });
        } else {
          const searchData = await photoService.searchPhotos({
            query: query || categoryId || 'landscape panoramic nature',
            orientation,
            page: 1,
            perPage: 24,
          });
          items = searchData.results || [];
        }

        if (!ignore && Array.isArray(items) && items.length > 0) {
          setPhotos(items);
        } else if (!ignore) {
          // Fallback ke pool jika respons API kosong
          setPhotos(getFilteredPool(query, categoryId));
        }
      } catch (err) {
        // Fallback cerdas ke curated pool yang cocok dengan query/filter
        if (!ignore) {
          if (random) {
            const shuffled = [...CURATED_POOL].sort(() => Math.random() - 0.5);
            setPhotos(shuffled.slice(0, 18));
          } else {
            setPhotos(getFilteredPool(query, categoryId));
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

  return {
    photos,
    loading,
    error,
  };
}
