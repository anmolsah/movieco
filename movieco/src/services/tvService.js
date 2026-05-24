import { TMDB_API_KEY, API_ENDPOINTS } from '../config/api.js';
import AuthService from './authService.js';

class TVService {
  constructor() {
    this.providersCache = {};
  }
  async fetchTVShows(endpoint, page = 1) {
    try {
      const userPreferences = AuthService.getUserPreferences();
      const includeAdult = userPreferences.adultContent || false;

      const response = await fetch(`${endpoint}?api_key=${TMDB_API_KEY}&page=${page}&include_adult=${includeAdult}`);
      if (!response.ok) throw new Error('Failed to fetch TV shows');
      return await response.json();
    } catch {
      return { results: [], total_pages: 0 };
    }
  }

  async searchTVShows(query, page = 1) {
    try {
      const userPreferences = AuthService.getUserPreferences();
      const includeAdult = userPreferences.adultContent || false;

      const response = await fetch(
        `${API_ENDPOINTS.searchTv}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=${includeAdult}`
      );
      if (!response.ok) throw new Error('Failed to search TV shows');
      return await response.json();
    } catch {
      return { results: [], total_pages: 0 };
    }
  }

  async getTVDetails(tvId) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.tvDetails}/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits,seasons`
      );
      if (!response.ok) throw new Error('Failed to fetch TV details');
      return await response.json();
    } catch {
      return null;
    }
  }

  async getTVGenres() {
    try {
      const response = await fetch(`${API_ENDPOINTS.tvGenres}?api_key=${TMDB_API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch TV genres');
      const data = await response.json();
      return data.genres;
    } catch {
      return [];
    }
  }

  async getPopularTV(page = 1) {
    return this.fetchTVShows(API_ENDPOINTS.tvPopular, page);
  }

  async getTopRatedTV(page = 1) {
    return this.fetchTVShows(API_ENDPOINTS.tvTopRated, page);
  }

  async getOnTheAirTV(page = 1) {
    return this.fetchTVShows(API_ENDPOINTS.tvOnTheAir, page);
  }

  async getAiringTodayTV(page = 1) {
    return this.fetchTVShows(API_ENDPOINTS.tvAiringToday, page);
  }

  async getWatchProviders(id, region = 'US') {
    try {
      const cacheKey = `tv_${id}_${region}`;
      if (this.providersCache[cacheKey]) {
        return this.providersCache[cacheKey];
      }

      const response = await fetch(
        `${API_ENDPOINTS.tvWatchProviders}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      const result = data.results[region] || null;
      this.providersCache[cacheKey] = result;
      return result;
    } catch {
      return null;
    }
  }

  async getTVShowsWithProviders(endpoint, page = 1, _region = 'US') {
    try {
      const tvData = await this.fetchTVShows(endpoint, page);
      if (!tvData.results) return tvData;

      // Lazy load watch providers on hover/modal
      const tvWithProviders = tvData.results.map(tvShow => ({
        ...tvShow,
        watchProviders: null
      }));

      return {
        ...tvData,
        results: tvWithProviders
      };
    } catch {
      return { results: [], total_pages: 0 };
    }
  }


  async getPopularTVWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvPopular, page, region);
  }

  async getTopRatedTVWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvTopRated, page, region);
  }

  async getOnTheAirTVWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvOnTheAir, page, region);
  }

  async getAiringTodayTVWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvAiringToday, page, region);
  }
}

export default new TVService();