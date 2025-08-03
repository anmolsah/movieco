import { useState, useEffect } from 'react';
import TVService from '../services/tvService.js';

export const useTVShows = () => {
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [onTheAirTVShows, setOnTheAirTVShows] = useState([]);
  const [airingTodayTVShows, setAiringTodayTVShows] = useState([]);
  const [allTVShows, setAllTVShows] = useState([]);
  const [tvGenres, setTVGenres] = useState([]);
  const [featuredTVShow, setFeaturedTVShow] = useState(null);
  
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
        // Load TV genres
        const genresData = await TVService.getTVGenres();
        setTVGenres(genresData);

        // Load TV show categories
        const [popular, topRated, onTheAir, airingToday] = await Promise.all([
          TVService.getPopularTV(),
          TVService.getTopRatedTV(),
          TVService.getOnTheAirTV(),
          TVService.getAiringTodayTV()
        ]);

        setPopularTVShows(popular.results || []);
        setTopRatedTVShows(topRated.results || []);
        setOnTheAirTVShows(onTheAir.results || []);
        setAiringTodayTVShows(airingToday.results || []);

        // Combine all TV shows
        const combined = [
          ...(popular.results || []),
          ...(topRated.results || []),
          ...(onTheAir.results || []),
          ...(airingToday.results || [])
        ];
        
        // Remove duplicates based on TV show ID
        const uniqueTVShows = combined.filter((show, index, self) => 
          index === self.findIndex(s => s.id === show.id)
        );
        setAllTVShows(uniqueTVShows);

        // Set featured TV show (highest rated from popular)
        if (popular.results && popular.results.length > 0) {
          const featured = popular.results
            .sort((a, b) => b.vote_average - a.vote_average)[0];
          setFeaturedTVShow(featured);
        }

        // Update loading states
        setLoading({
          popular: false,
          topRated: false,
          onTheAir: false,
          airingToday: false,
          search: false
        });
        
      } catch (error) {
        console.error('Failed to load TV data:', error);
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
  }, []);

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