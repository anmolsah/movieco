import { useState, useEffect } from 'react';
import TVService from '../services/tvService.js';
import AuthService from '../services/authService.js';

export const useTVShows = (region = 'US') => {
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [onTheAirTVShows, setOnTheAirTVShows] = useState([]);
  const [airingTodayTVShows, setAiringTodayTVShows] = useState([]);
  const [allTVShows, setAllTVShows] = useState([]);
  const [tvGenres, setTVGenres] = useState([]);
  const [featuredTVShow, setFeaturedTVShow] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);

  const [loading, setLoading] = useState({
    popular: true,
    topRated: true,
    onTheAir: true,
    airingToday: true,
    search: false
  });

  useEffect(() => {
    const loadTVData = async () => {
      try {
        // Get current user preferences
        const currentPrefs = AuthService.getUserPreferences();
        setUserPreferences(currentPrefs);

        const genresData = await TVService.getTVGenres();
        setTVGenres(genresData);


        const [popular, topRated, onTheAir, airingToday] = await Promise.all([
          TVService.getPopularTVWithProviders(1, region),
          TVService.getTopRatedTVWithProviders(1, region),
          TVService.getOnTheAirTVWithProviders(1, region),
          TVService.getAiringTodayTVWithProviders(1, region)
        ]);

        setPopularTVShows(popular.results || []);
        setTopRatedTVShows(topRated.results || []);
        setOnTheAirTVShows(onTheAir.results || []);
        setAiringTodayTVShows(airingToday.results || []);


        const combined = [
          ...(popular.results || []),
          ...(topRated.results || []),
          ...(onTheAir.results || []),
          ...(airingToday.results || [])
        ];


        const uniqueTVShows = combined.filter((show, index, self) =>
          index === self.findIndex(s => s.id === show.id)
        );
        setAllTVShows(uniqueTVShows);


        if (popular.results && popular.results.length > 0) {
          const featured = popular.results
            .sort((a, b) => b.vote_average - a.vote_average)[0];
          setFeaturedTVShow(featured);
        }


        setLoading({
          popular: false,
          topRated: false,
          onTheAir: false,
          airingToday: false,
          search: false
        });

      } catch (error) {
        setLoading({
          popular: false,
          topRated: false,
          onTheAir: false,
          airingToday: false,
          search: false
        });
      }
    };

    loadTVData();
  }, [region]);

  // Listen for auth state changes and preference updates
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(() => {
      const newPrefs = AuthService.getUserPreferences();

      // Check if adult content preference changed
      if (userPreferences && newPrefs.adultContent !== userPreferences.adultContent) {

        // Set loading states
        setLoading({
          popular: true,
          topRated: true,
          onTheAir: true,
          airingToday: true,
          search: false
        });

        // Refresh TV data
        const refreshTVShows = async () => {
          try {
            const [popular, topRated, onTheAir, airingToday] = await Promise.all([
              TVService.getPopularTVWithProviders(1, region),
              TVService.getTopRatedTVWithProviders(1, region),
              TVService.getOnTheAirTVWithProviders(1, region),
              TVService.getAiringTodayTVWithProviders(1, region)
            ]);

            setPopularTVShows(popular.results || []);
            setTopRatedTVShows(topRated.results || []);
            setOnTheAirTVShows(onTheAir.results || []);
            setAiringTodayTVShows(airingToday.results || []);

            const combined = [
              ...(popular.results || []),
              ...(topRated.results || []),
              ...(onTheAir.results || []),
              ...(airingToday.results || [])
            ];

            const uniqueTVShows = combined.filter((show, index, self) =>
              index === self.findIndex(s => s.id === show.id)
            );
            setAllTVShows(uniqueTVShows);

            if (popular.results && popular.results.length > 0) {
              const featured = popular.results
                .sort((a, b) => b.vote_average - a.vote_average)[0];
              setFeaturedTVShow(featured);
            }

            setLoading({
              popular: false,
              topRated: false,
              onTheAir: false,
              airingToday: false,
              search: false
            });
          } catch (error) {
            setLoading({
              popular: false,
              topRated: false,
              onTheAir: false,
              airingToday: false,
              search: false
            });
          }
        };

        refreshTVShows();
      }

      setUserPreferences(newPrefs);
    });

    return unsubscribe;
  }, [userPreferences, region]);

  const updateLoadingState = (key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  return {
    popularTVShows,
    topRatedTVShows,
    onTheAirTVShows,
    airingTodayTVShows,
    allTVShows,
    tvGenres,
    featuredTVShow,
    loading,
    updateLoadingState
  };
};