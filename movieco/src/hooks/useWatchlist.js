import { useState, useEffect } from 'react';
import AuthService from '../services/authService.js';

export const useWatchlist = (user, isAuthenticated) => {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load user's watchlist
      const savedWatchlist = localStorage.getItem(`movieWatchlist_${user.id}`);
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } else {
      // Clear watchlist when user signs out
      setWatchlist([]);
    }
  }, [user, isAuthenticated]);

  const addToWatchlist = (movie) => {
    if (!isAuthenticated) {
      return false; // Indicate auth required
    }

    const isAlreadyInWatchlist = watchlist.some(w => w.id === movie.id);
    
    let newWatchlist;
    if (isAlreadyInWatchlist) {
      newWatchlist = watchlist.filter(w => w.id !== movie.id);
    } else {
      newWatchlist = [...watchlist, movie];
    }
    
    setWatchlist(newWatchlist);
    
    // Save watchlist with user ID to keep it separate per user
    const storageKey = user ? `movieWatchlist_${user.id}` : 'movieWatchlist';
    localStorage.setItem(storageKey, JSON.stringify(newWatchlist));

    return true; // Success
  };

  return {
    watchlist,
    addToWatchlist
  };
};