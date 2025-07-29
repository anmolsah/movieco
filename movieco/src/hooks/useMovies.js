import { useState, useEffect } from "react";
import MovieService from "../services/movieService.js";

export const useMovies = () => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);

  const [loading, setLoading] = useState({
    nowPlaying: true,
    upcoming: true,
    popular: true,
    topRated: true,
    search: false,
    ai: false,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load genres
        const genresData = await MovieService.getGenres();
        setGenres(genresData);

        // Load movie categories
        const [nowPlaying, upcoming, popular, topRated] = await Promise.all([
          MovieService.getNowPlaying(),
          MovieService.getUpcoming(),
          MovieService.getPopular(),
          MovieService.getTopRated(),
        ]);

        setNowPlayingMovies(nowPlaying.results || []);
        setUpcomingMovies(upcoming.results || []);
        setPopularMovies(popular.results || []);
        setTopRatedMovies(topRated.results || []);

        // Combine all movies for AI bot
        const combined = [
          ...(nowPlaying.results || []),
          ...(upcoming.results || []),
          ...(popular.results || []),
          ...(topRated.results || []),
        ];

        // Remove duplicates based on movie ID
        const uniqueMovies = combined.filter(
          (movie, index, self) =>
            index === self.findIndex((m) => m.id === movie.id)
        );
        setAllMovies(uniqueMovies);

        // Set featured movie (highest rated from popular)
        if (popular.results && popular.results.length > 0) {
          const featured = popular.results.sort(
            (a, b) => b.vote_average - a.vote_average
          )[0];
          setFeaturedMovie(featured);
        }

        // Update loading states
        setLoading({
          nowPlaying: false,
          upcoming: false,
          popular: false,
          topRated: false,
          search: false,
          ai: false,
        });
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setLoading({
          nowPlaying: false,
          upcoming: false,
          popular: false,
          topRated: false,
          search: false,
          ai: false,
        });
      }
    };

    loadInitialData();
  }, []);

  const updateLoadingState = (key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  return {
    nowPlayingMovies,
    upcomingMovies,
    popularMovies,
    topRatedMovies,
    allMovies,
    genres,
    featuredMovie,
    loading,
    updateLoadingState,
  };
};
