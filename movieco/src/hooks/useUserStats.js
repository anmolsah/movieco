import { useState, useEffect } from 'react';
import UserStatsService from '../services/userStatsService.js';

export const useUserStats = (user, watchlist) => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const stats = UserStatsService.getUserStats(user.id);
      setUserStats(stats);
      setLoading(false);
    } else {
      setUserStats(null);
      setLoading(false);
    }
  }, [user]);

  // Update watchlist count when watchlist changes
  useEffect(() => {
    if (user && userStats) {
      const updatedStats = UserStatsService.updateWatchlistCount(user.id, watchlist.length);
      setUserStats(updatedStats);
    }
  }, [user, watchlist.length, userStats]);

  const addMovieToWatchHistory = (movie) => {
    if (user) {
      const updatedStats = UserStatsService.addMovieToWatchHistory(user.id, movie);
      setUserStats(updatedStats);
    }
  };

  const rateMovie = (movieId, rating) => {
    if (user) {
      const updatedStats = UserStatsService.addMovieRating(user.id, movieId, rating);
      setUserStats(updatedStats);
      return updatedStats;
    }
  };

  const getTopGenres = (limit = 3) => {
    if (user) {
      return UserStatsService.getTopGenres(user.id, limit);
    }
    return [];
  };

  const getRecentlyWatched = (limit = 5) => {
    if (user) {
      return UserStatsService.getRecentlyWatched(user.id, limit);
    }
    return [];
  };

  return {
    userStats,
    loading,
    addMovieToWatchHistory,
    rateMovie,
    getTopGenres,
    getRecentlyWatched
  };
};