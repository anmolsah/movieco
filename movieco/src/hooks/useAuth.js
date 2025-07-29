import { useState, useEffect } from "react";
import AuthService from "../services/authService.js";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check initial auth state
    setUser(AuthService.getCurrentUser());
    setIsAuthenticated(AuthService.isUserAuthenticated());

    // Listen for auth state changes
    const unsubscribe = AuthService.onAuthStateChanged(
      (user, authenticated) => {
        setUser(user);
        setIsAuthenticated(authenticated);
      }
    );

    return unsubscribe;
  }, []);

  const checkAuthForWatchlist = () => {
    if (!isAuthenticated) {
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    checkAuthForWatchlist,
  };
};
