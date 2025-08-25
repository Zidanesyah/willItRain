import axios from 'axios';
import { env } from '../config/env.js';

export const owClient = axios.create({
  baseURL: env.OPENWEATHER_BASE_URL,
  timeout: 10000,
  params: { appid: env.OPENWEATHER_API_KEY }
});

// (Opsional) logging sederhana
owClient.interceptors.request.use((cfg) => {
  return cfg;
});
owClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalisasi error
    if (err.response) {
      err.message = `OpenWeather Error ${err.response.status}: ${JSON.stringify(err.response.data)}`;
    }
    return Promise.reject(err);
  }
);
