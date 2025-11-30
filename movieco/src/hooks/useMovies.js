import { useState, useEffect } from "react";
import MovieService from "../services/movieService.js";
import AuthService from "../services/authService.js";

export const useMovies = (region = 'US') => {
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

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
        // Get current user preferences
        const currentPrefs = AuthService.getUserPreferences();
        setUserPreferences(currentPrefs);

        const genresData = await MovieService.getGenres();
        setGenres(genresData);


        const [nowPlaying, upcoming, popular, topRated] = await Promise.all([
          MovieService.getNowPlayingWithProviders(1, region),
          MovieService.getUpcomingWithProviders(1, region),
          MovieService.getPopularWithProviders(1, region),
          MovieService.getTopRatedWithProviders(1, region),
        ]);

        setNowPlayingMovies(nowPlaying.results || []);
        setUpcomingMovies(upcoming.results || []);
        setPopularMovies(popular.results || []);
        setTopRatedMovies(topRated.results || []);


        const combined = [
          ...(nowPlaying.results || []),
          ...(upcoming.results || []),
          ...(popular.results || []),
          ...(topRated.results || []),
        ];


        const uniqueMovies = combined.filter(
          (movie, index, self) =>
            index === self.findIndex((m) => m.id === movie.id)
        );
        setAllMovies(uniqueMovies);


        if (popular.results && popular.results.length > 0) {
          const featured = popular.results.sort(
            (a, b) => b.vote_average - a.vote_average
          )[0];
          setFeaturedMovie(featured);
        }


        setLoading({
          nowPlaying: false,
          upcoming: false,
          popular: false,
          topRated: false,
          search: false,
          ai: false,
        });
      } catch (error) {
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
  }, [region]);

  // Listen for auth state changes and preference updates
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(() => {
      const newPrefs = AuthService.getUserPreferences();

      // Check if adult content preference changed
      if (userPreferences && newPrefs.adultContent !== userPreferences.adultContent) {

        // Set loading states
        setLoading({
          nowPlaying: true,
          upcoming: true,
          popular: true,
          topRated: true,
          search: false,
          ai: false,
        });

        // Refresh movie data
        const refreshMovies = async () => {
          try {
            const [nowPlaying, upcoming, popular, topRated] = await Promise.all([
              MovieService.getNowPlayingWithProviders(1, region),
              MovieService.getUpcomingWithProviders(1, region),
              MovieService.getPopularWithProviders(1, region),
              MovieService.getTopRatedWithProviders(1, region),
            ]);

            setNowPlayingMovies(nowPlaying.results || []);
            setUpcomingMovies(upcoming.results || []);
            setPopularMovies(popular.results || []);
            setTopRatedMovies(topRated.results || []);

            const combined = [
              ...(nowPlaying.results || []),
              ...(upcoming.results || []),
              ...(popular.results || []),
              ...(topRated.results || []),
            ];

            const uniqueMovies = combined.filter(
              (movie, index, self) =>
                index === self.findIndex((m) => m.id === movie.id)
            );
            setAllMovies(uniqueMovies);

            if (popular.results && popular.results.length > 0) {
              const featured = popular.results.sort(
                (a, b) => b.vote_average - a.vote_average
              )[0];
              setFeaturedMovie(featured);
            }

            setLoading({
              nowPlaying: false,
              upcoming: false,
              popular: false,
              topRated: false,
              search: false,
              ai: false,
            });
          } catch (error) {
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

        refreshMovies();
      }

      setUserPreferences(newPrefs);
    });

    return unsubscribe;
  }, [userPreferences, region]);

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
