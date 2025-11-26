import { TMDB_API_KEY, API_ENDPOINTS } from "../config/api.js";
import AuthService from "./authService.js";

class MovieService {
  async fetchMovies(endpoint, page = 1) {
    try {
      const userPreferences = AuthService.getUserPreferences();
      const includeAdult = userPreferences.adultContent || false;

      console.log('MovieService: Adult content setting:', includeAdult);
      console.log('MovieService: Full preferences:', userPreferences);

      const response = await fetch(
        `${endpoint}?api_key=${TMDB_API_KEY}&page=${page}&include_adult=${includeAdult}`
      );
      if (!response.ok) throw new Error("Failed to fetch movies");
      return await response.json();
    } catch (error) {
      console.error("Movie fetch error:", error);
      return { results: [], total_pages: 0 };
    }
  }

  async searchMovies(query, page = 1) {
    try {
      const userPreferences = AuthService.getUserPreferences();
      const includeAdult = userPreferences.adultContent || false;

      console.log('MovieService Search: Adult content setting:', includeAdult);

      const response = await fetch(
        `${API_ENDPOINTS.search
        }?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&page=${page}&include_adult=${includeAdult}`
      );
      if (!response.ok) throw new Error("Failed to search movies");
      return await response.json();
    } catch (error) {
      console.error("Movie search error:", error);
      return { results: [], total_pages: 0 };
    }
  }

  async getMovieDetails(movieId) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.movieDetails}/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
      );
      if (!response.ok) throw new Error("Failed to fetch movie details");
      return await response.json();
    } catch (error) {
      console.error("Movie details error:", error);
      return null;
    }
  }

  async getTvDetails(tvId) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.tvDetails}/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
      );
      if (!response.ok) throw new Error("Failed to fetch TV show details");
      return await response.json();
    } catch (error) {
      console.error("TV show details error:", error);
      return null;
    }
  }

  async getGenres() {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.genres}?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch genres");
      const data = await response.json();
      return data.genres;
    } catch (error) {
      console.error("Genres fetch error:", error);
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

  async getWatchProviders(id, mediaType = 'movie', region = 'US') {
    try {
      const endpoint = mediaType === 'tv' ? API_ENDPOINTS.tvWatchProviders : API_ENDPOINTS.movieWatchProviders;
      const response = await fetch(
        `${endpoint}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.results[region] || null;
    } catch (error) {
      console.error("Watch providers fetch error:", error);
      return null;
    }
  }

  async getMoviesWithProviders(endpoint, page = 1, region = 'US') {
    try {
      const moviesData = await this.fetchMovies(endpoint, page);
      if (!moviesData.results) return moviesData;


      const moviesWithProviders = await Promise.all(
        moviesData.results.slice(0, 10).map(async (movie) => {
          const providers = await this.getWatchProviders(movie.id, 'movie', region);
          return { ...movie, watchProviders: providers };
        })
      );


      const remainingMovies = moviesData.results.slice(10).map(movie => ({ ...movie, watchProviders: null }));

      return {
        ...moviesData,
        results: [...moviesWithProviders, ...remainingMovies]
      };
    } catch (error) {
      console.error("Movies with providers fetch error:", error);
      return { results: [], total_pages: 0 };
    }
  }

  async getTVShowsWithProviders(endpoint, page = 1, region = 'US') {
    try {
      const tvData = await this.fetchMovies(endpoint, page);
      if (!tvData.results) return tvData;


      const tvWithProviders = await Promise.all(
        tvData.results.slice(0, 10).map(async (tvShow) => {
          const providers = await this.getWatchProviders(tvShow.id, 'tv', region);
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


  async getNowPlayingWithProviders(page = 1, region = 'US') {
    return this.getMoviesWithProviders(API_ENDPOINTS.nowPlaying, page, region);
  }

  async getUpcomingWithProviders(page = 1, region = 'US') {
    return this.getMoviesWithProviders(API_ENDPOINTS.upcoming, page, region);
  }

  async getPopularWithProviders(page = 1, region = 'US') {
    return this.getMoviesWithProviders(API_ENDPOINTS.popular, page, region);
  }

  async getTopRatedWithProviders(page = 1, region = 'US') {
    return this.getMoviesWithProviders(API_ENDPOINTS.topRated, page, region);
  }

  async getTVPopularWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvPopular, page, region);
  }

  async getTVTopRatedWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvTopRated, page, region);
  }

  async getTVOnTheAirWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvOnTheAir, page, region);
  }

  async getTVAiringTodayWithProviders(page = 1, region = 'US') {
    return this.getTVShowsWithProviders(API_ENDPOINTS.tvAiringToday, page, region);
  }
}

export default new MovieService();
