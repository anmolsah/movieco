import { useState, useEffect } from "react";
import AIService from "../services/aiService.js";
import AuthService from "../services/authService.js";

export const useAIRecommendations = (
  popularMovies,
  updateLoadingState,
  user,
  isAuthenticated
) => {
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    genres: [],
    minRating: 6.0,
    watchHistory: [],
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const prefs = AuthService.getUserPreferences();
      setUserPreferences((prev) => ({
        ...prev,
        genres: prefs.favoriteGenres || [],
        minRating: 6.0,
        adultContent: prefs.adultContent || false,
      }));
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (popularMovies.length > 0) {
      generateAIRecommendations(popularMovies);
    }
  }, [popularMovies, userPreferences]);

  const generateAIRecommendations = async (moviePool) => {
    updateLoadingState("ai", true);

    try {
      const recommendations = await AIService.getMovieRecommendations(
        userPreferences,
        moviePool
      );
      setAiRecommendations(recommendations);
    } catch (error) {
      setAiRecommendations(
        moviePool.sort((a, b) => b.vote_average - a.vote_average).slice(0, 10)
      );
    }

    updateLoadingState("ai", false);
  };

  return {
    aiRecommendations,
    userPreferences,
    setUserPreferences,
  };
};
