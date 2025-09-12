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

  async getWatchProviders(id, region = 'US') {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.tvWatchProviders}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.results[region] || null;
    } catch (error) {
      console.error("TV watch providers fetch error:", error);
      return null;
    }
  }

  async getTVShowsWithProviders(endpoint, page = 1, region = 'US') {
    try {
      const tvData = await this.fetchTVShows(endpoint, page);
      if (!tvData.results) return tvData;


      const tvWithProviders = await Promise.all(
        tvData.results.slice(0, 10).map(async (tvShow) => {
          const providers = await this.getWatchProviders(tvShow.id, region);
          return { ...tvShow, watchProviders: providers };
        })
      );


      const remainingTVShows = tvData.results.slice(10).map(tvShow => ({ ...tvShow, watchProviders: null }));

      return {
        ...tvData,
        results: [...tvWithProviders, ...remainingTVShows]
      };
    } catch (error) {
      console.error("TV shows with providers fetch error:", error);
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