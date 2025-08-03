import { TMDB_API_KEY, API_ENDPOINTS } from '../config/api.js';

class TVService {
  async fetchTVShows(endpoint, page = 1) {
    try {
      const response = await fetch(`${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch TV shows');
      return await response.json();
    } catch (error) {
      console.error('TV shows fetch error:', error);
      return { results: [], total_pages: 0 };
    }
  }

  async searchTVShows(query, page = 1) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.searchTv}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to search TV shows');
      return await response.json();
    } catch (error) {
      console.error('TV search error:', error);
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
    } catch (error) {
      console.error('TV details error:', error);
      return null;
    }
  }

  async getTVGenres() {
    try {
      const response = await fetch(`${API_ENDPOINTS.tvGenres}?api_key=${TMDB_API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch TV genres');
      const data = await response.json();
      return data.genres;
    } catch (error) {
      console.error('TV genres fetch error:', error);
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
}

export default new TVService();