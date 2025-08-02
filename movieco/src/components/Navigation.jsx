import logo from "../assets/logo5.png";
import React, { useState, useEffect } from "react";
import { Film, Search, Heart, User, Menu, X, LogIn, Bot } from "lucide-react";
import AuthService from "../services/authService.js";

const Navigation = ({
  activeTab,
  onTabChange,
  watchlistCount = 0,
  onOpenSearch,
  onOpenProfile,
  onOpenAuth,
  onOpenAIBot,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navItems = [
    { id: "home", label: "Home", icon: Film },
    { id: "now-playing", label: "Now Playing", icon: null },
    { id: "upcoming", label: "Upcoming", icon: null },
    { id: "popular", label: "Popular", icon: null },
    { id: "top-rated", label: "Top Rated", icon: null },
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      onOpenProfile();
    } else {
      onOpenAuth();
    }
    setMobileMenuOpen(false);
  };

  const handleAIBotClick = () => {
    if (isAuthenticated) {
      onOpenAIBot();
    } else {
      onOpenAuth();
    }

    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onTabChange("home")}
            className="cursor-pointer"
          >
            <img className="w-60 h-48" src="./logo5.png" />
          </button>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* AI Bot Button */}
            <button
              onClick={handleAIBotClick}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200 relative group"
              title="AI Movie Discovery"
            >
              <Bot className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </button>

            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleTabClick("watchlist")}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              <Heart className="w-5 h-5" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {watchlistCount > 9 ? "9+" : watchlistCount}
                </span>
              )}
            </button>

            {/* Profile/Auth Button */}
            <button
              onClick={handleProfileClick}
              className="cursor-pointer flex items-center gap-2 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              {isAuthenticated && user ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-6 h-6 rounded-full border border-slate-600"
                />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              {isAuthenticated && user && (
                <span className="hidden lg:block text-sm font-medium text-white">
                  {user.name?.split(" ")[0]}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "text-purple-400 bg-purple-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </button>
              ))}

              {/* Mobile AI Bot */}
              <button
                onClick={handleAIBotClick}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
              >
                <Bot className="w-4 h-4" />
                AI Movie Discovery
              </button>

              <button
                onClick={() => handleTabClick("watchlist")}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
              >
                <Heart className="w-4 h-4" />
                My Watchlist ({watchlistCount})
              </button>

              {/* Mobile Profile/Auth */}
              <button
                onClick={handleProfileClick}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
              >
                {isAuthenticated && user ? (
                  <>
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-4 h-4 rounded-full border border-slate-600"
                    />
                    Profile ({user.name?.split(" ")[0]})
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
