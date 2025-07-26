import { TMDB_API_KEY, API_ENDPOINTS } from '../config/api.js';

class MovieService {
  async fetchMovies(endpoint, page = 1) {
    try {
      const response = await fetch(`${endpoint}?api_key=${TMDB_API_KEY}&page=${page}`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      return await response.json();
    } catch (error) {
      console.error('Movie fetch error:', error);
      return { results: [], total_pages: 0 };
    }
  }

  async searchMovies(query, page = 1) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.search}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
      );
      if (!response.ok) throw new Error('Failed to search movies');
      return await response.json();
    } catch (error) {
      console.error('Movie search error:', error);
      return { results: [], total_pages: 0 };
    }
  }

  async getMovieDetails(movieId) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.movieDetails}/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
      );
      if (!response.ok) throw new Error('Failed to fetch movie details');
      return await response.json();
    } catch (error) {
      console.error('Movie details error:', error);
      return null;
    }
  }

  async getGenres() {
    try {
      const response = await fetch(`${API_ENDPOINTS.genres}?api_key=${TMDB_API_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data = await response.json();
      return data.genres;
    } catch (error) {
      console.error('Genres fetch error:', error);
      return [];
    }
  }

  async getNowPlaying(page = 1) {
    return this.fetchMovies(API_ENDPOINTS.nowPlaying, page);
  }

  async getUpcoming(page = 1) {
    return this.fetchMovies(API_ENDPOINTS.upcoming, page);
  }

  async getPopular(page = 1) {
    return this.fetchMovies(API_ENDPOINTS.popular, page);
  }

  async getTopRated(page = 1) {
    return this.fetchMovies(API_ENDPOINTS.topRated, page);
  }
}

export default new MovieService();