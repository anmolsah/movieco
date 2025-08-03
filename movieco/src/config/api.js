//TMDB API
export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Gemini AI API Configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

export const API_ENDPOINTS = {
  nowPlaying: `${TMDB_BASE_URL}/movie/now_playing`,
  upcoming: `${TMDB_BASE_URL}/movie/upcoming`,
  popular: `${TMDB_BASE_URL}/movie/popular`,
  topRated: `${TMDB_BASE_URL}/movie/top_rated`,
  search: `${TMDB_BASE_URL}/search/movie`,
  movieDetails: `${TMDB_BASE_URL}/movie`,
  genres: `${TMDB_BASE_URL}/genre/movie/list`,
   // TV Shows endpoints
  tvPopular: `${TMDB_BASE_URL}/tv/popular`,
  tvTopRated: `${TMDB_BASE_URL}/tv/top_rated`,
  tvOnTheAir: `${TMDB_BASE_URL}/tv/on_the_air`,
  tvAiringToday: `${TMDB_BASE_URL}/tv/airing_today`,
  searchTv: `${TMDB_BASE_URL}/search/tv`,
  tvDetails: `${TMDB_BASE_URL}/tv`,
  tvGenres: `${TMDB_BASE_URL}/genre/tv/list`,
};

export const getImageUrl = (path, size = "w500") => {
  if (!path) return "/api/placeholder/300/450";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
