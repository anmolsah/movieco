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
      // Show a temporary message to inform user
      const message = document.createElement('div');
      message.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          z-index: 1000;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          animation: slideIn 0.3s ease-out;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
              <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
            </svg>
            Please login first to add movies to your wishlist
          </div>
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      document.body.appendChild(message);

      // Remove message after 3 seconds
      setTimeout(() => {
        if (message.parentNode) {
          message.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => {
            document.body.removeChild(message);
          }, 300);
        }
      }, 3000);

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
