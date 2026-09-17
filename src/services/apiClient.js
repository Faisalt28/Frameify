import axios from 'axios';

// Dapatkan Access Key dari .env atau dari localStorage (jika user input langsung lewat UI)
export const getActiveAccessKey = () => {
  return import.meta.env.VITE_UNSPLASH_ACCESS_KEY || localStorage.getItem('unsplash_access_key') || '';
};

export const saveActiveAccessKey = (key) => {
  if (key) {
    localStorage.setItem('unsplash_access_key', key.trim());
  } else {
    localStorage.removeItem('unsplash_access_key');
  }
};

export const apiClient = axios.create({
  baseURL: 'https://api.unsplash.com',
  timeout: 10000,
});

// Interceptor untuk menambahkan Authorization header dinamis di setiap request
apiClient.interceptors.request.use((config) => {
  const key = getActiveAccessKey();
  if (key) {
    config.headers.Authorization = `Client-ID ${key}`;
  }
  return config;
});
