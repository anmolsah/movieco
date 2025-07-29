import { useState, useEffect, useCallback } from "react";
import WatchlistService from "../services/watchlistService.js";

export const useWatchlist = (user, isAuthenticated) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load watchlist from Supabase when user logs in
  const loadWatchlist = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setWatchlist([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const watchlistData = await WatchlistService.getUserWatchlist(user.id);
      setWatchlist(watchlistData);

      // Migrate local watchlist if exists
      const localWatchlistKey = `movieWatchlist_${user.id}`;
      const localWatchlist = localStorage.getItem(localWatchlistKey);

      if (localWatchlist) {
        const parsedLocal = JSON.parse(localWatchlist);
        if (parsedLocal.length > 0) {
          await WatchlistService.syncLocalWatchlist(user.id, parsedLocal);
          // Reload after sync
          const updatedWatchlist = await WatchlistService.getUserWatchlist(
            user.id
          );
          setWatchlist(updatedWatchlist);
          // Clear local storage after successful sync
          localStorage.removeItem(localWatchlistKey);
        }
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      setError("Failed to load watchlist");

      // Fallback to localStorage
      const localWatchlistKey = `movieWatchlist_${user.id}`;
      const localWatchlist = localStorage.getItem(localWatchlistKey);
      if (localWatchlist) {
        setWatchlist(JSON.parse(localWatchlist));
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const addToWatchlist = async (movie) => {
    if (!isAuthenticated) {
      return false; // Indicate auth required
    }

    setError(null);
    const isAlreadyInWatchlist = watchlist.some((w) => w.id === movie.id);

    try {
      if (isAlreadyInWatchlist) {
        // Remove from watchlist
        await WatchlistService.removeFromWatchlist(user.id, movie.id);
        setWatchlist((prev) => prev.filter((w) => w.id !== movie.id));
      } else {
        // Add to watchlist
        const addedMovie = await WatchlistService.addToWatchlist(
          user.id,
          movie
        );
        setWatchlist((prev) => [addedMovie, ...prev]);
      }

      return true; // Success
    } catch (error) {
      console.error("Watchlist operation failed:", error);
      setError(error.message || "Failed to update watchlist");

      // Fallback to localStorage for offline functionality
      let newWatchlist;
      if (isAlreadyInWatchlist) {
        newWatchlist = watchlist.filter((w) => w.id !== movie.id);
      } else {
        newWatchlist = [...watchlist, movie];
      }

      setWatchlist(newWatchlist);
      const storageKey = user ? `movieWatchlist_${user.id}` : "movieWatchlist";
      localStorage.setItem(storageKey, JSON.stringify(newWatchlist));

      return true; // Still return success for UX
    }
  };

  const clearWatchlist = async () => {
    if (!isAuthenticated || !user?.id) return false;

    try {
      await WatchlistService.clearWatchlist(user.id);
      setWatchlist([]);
      return true;
    } catch (error) {
      console.error("Failed to clear watchlist:", error);
      setError("Failed to clear watchlist");
      return false;
    }
  };

  const refreshWatchlist = () => {
    loadWatchlist();
  };

  return {
    watchlist,
    addToWatchlist,
    clearWatchlist,
    refreshWatchlist,
    loading,
    error,
  };
};
