import { apiClient, getActiveAccessKey } from './apiClient';

export const photoService = {
  // Ambil foto acak (random) lanskap & panorama dari Unsplash API
  getRandomPhotos: async ({ count = 30, orientation = 'landscape', query = 'landscape panoramic nature art' } = {}) => {
    const key = getActiveAccessKey();
    if (!key) {
      throw new Error('Access Key Unsplash belum dikonfigurasi.');
    }

    const params = {
      count,
      orientation: orientation !== 'all' ? orientation : 'landscape',
      query,
    };

    const response = await apiClient.get('/photos/random', { params });
    return Array.isArray(response.data) ? response.data : [response.data];
  },

  // Cari gambar berdasarkan query dan orientasi dari Unsplash API
  searchPhotos: async ({ query = 'landscape', page = 1, perPage = 24, orientation = 'landscape', orderBy = 'relevant' } = {}) => {
    const key = getActiveAccessKey();
    if (!key) {
      throw new Error('Access Key Unsplash belum dikonfigurasi.');
    }

    const params = {
      query,
      page,
      per_page: perPage,
      order_by: orderBy,
    };

    if (orientation && orientation !== 'all') {
      params.orientation = orientation;
    }

    const response = await apiClient.get('/search/photos', { params });

    return {
      results: response.data.results,
      total: response.data.total,
      total_pages: response.data.total_pages,
    };
  },
};
