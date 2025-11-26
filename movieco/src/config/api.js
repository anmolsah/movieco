//TMDB API
export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// OpenRouter AI API Configuration
export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free"; // Free model, can be changed

export const API_ENDPOINTS = {
  nowPlaying: `${TMDB_BASE_URL}/movie/now_playing`,
  upcoming: `${TMDB_BASE_URL}/movie/upcoming`,
  popular: `${TMDB_BASE_URL}/movie/popular`,
  topRated: `${TMDB_BASE_URL}/movie/top_rated`,
  search: `${TMDB_BASE_URL}/search/movie`,
  movieDetails: `${TMDB_BASE_URL}/movie`,
  genres: `${TMDB_BASE_URL}/genre/movie/list`,
  movieWatchProviders: `${TMDB_BASE_URL}/movie`,
  tvPopular: `${TMDB_BASE_URL}/tv/popular`,
  tvTopRated: `${TMDB_BASE_URL}/tv/top_rated`,
  tvOnTheAir: `${TMDB_BASE_URL}/tv/on_the_air`,
  tvAiringToday: `${TMDB_BASE_URL}/tv/airing_today`,
  searchTv: `${TMDB_BASE_URL}/search/tv`,
  tvDetails: `${TMDB_BASE_URL}/tv`,
  tvGenres: `${TMDB_BASE_URL}/genre/tv/list`,
  tvWatchProviders: `${TMDB_BASE_URL}/tv`,
};

export const getImageUrl = (path, size = "w500") => {
  if (!path) return "/api/placeholder/300/450";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
