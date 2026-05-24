import React, { useState, useEffect } from "react";
import WatchlistService from "./services/watchlistService.js";
import MovieService from "./services/movieService.js";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Trophy,
  Heart,
  Search,
  Bot,
} from "lucide-react";

// Components
import Navigation from "./components/Navigation.jsx";
import HeroSection from "./components/HeroSection.jsx";
import MovieSection from "./components/MovieSection.jsx";
import TVSection from "./components/TVSection.jsx";
import MovieModal from "./components/MovieModal.jsx";
import SearchBar from "./components/SearchBar.jsx";
import Footer from "./components/Footer.jsx";
import AuthModal from "./components/AuthModal.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import AIMovieBot from "./components/AIMovieBot.jsx";

// Custom Hooks
import { useAuth } from "./hooks/useAuth.js";
import { useMovies } from "./hooks/useMovies.js";
import { useWatchlist } from "./hooks/useWatchlist.js";
import { useSearch } from "./hooks/useSearch.js";
import { useAIRecommendations } from "./hooks/useAIRecommendations.js";
import { useUserStats } from "./hooks/useUserStats.js";
import { useTVShows } from "./hooks/useTVShows.js";

// Utils
import { getCurrentMovies, getSectionConfig } from "./utils/movieUtils.js";

function App() {
  // UI State
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAIBot, setShowAIBot] = useState(false);

  // Shared Watchlist State
  const [sharedUserId, setSharedUserId] = useState(null);
  const [sharedWatchlist, setSharedWatchlist] = useState([]);
  const [sharedUserName, setSharedUserName] = useState("");
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedError, setSharedError] = useState(null);

  // Check URL for shared watchlist on mount
  useEffect(() => {
    const getSharedUserIdFromUrl = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      if (searchParams.has("watchlist")) {
        return searchParams.get("watchlist");
      }
      
      const pathMatch = path.match(/\/watchlist\/([^/]+)/);
      if (pathMatch) {
        return pathMatch[1];
      }
      
      const hashMatch = hash.match(/#\/watchlist\/([^/]+)/) || hash.match(/#watchlist=([^/]+)/);
      if (hashMatch) {
        return hashMatch[1];
      }
      
      return null;
    };

    const targetUserId = getSharedUserIdFromUrl();
    if (targetUserId) {
      setSharedUserId(targetUserId);
      setActiveTab("shared-watchlist");
    }
  }, []);

  // Fetch shared watchlist details
  useEffect(() => {
    if (activeTab === "shared-watchlist" && sharedUserId) {
      const loadSharedWatchlist = async () => {
        setSharedLoading(true);
        setSharedError(null);
        try {
          const searchParams = new URLSearchParams(window.location.search);
          const nameParam = searchParams.get("name");
          const movieIdsStr = searchParams.get("movies");
          
          if (nameParam) {
            setSharedUserName(decodeURIComponent(nameParam));
          } else {
            setSharedUserName("User");
          }
          
          if (movieIdsStr) {
            const ids = movieIdsStr.split(",").map(Number).filter(Boolean);
            if (ids.length > 0) {
              const movieDetails = await Promise.all(
                ids.map(async (id) => {
                  try {
                    return await MovieService.getMovieDetails(id);
                  } catch (e) {
                    return null;
                  }
                })
              );
              setSharedWatchlist(movieDetails.filter(Boolean));
            } else {
              setSharedWatchlist([]);
            }
          } else {
            // Fallback to database check in case they open a raw database path
            const shareStatus = await WatchlistService.getWatchlistShareStatus(sharedUserId);
            if (!shareStatus.isShared) {
              setSharedError("This user's watchlist is private or does not exist.");
              setSharedLoading(false);
              return;
            }
            
            setSharedUserName(shareStatus.userName || "User");
            const movies = await WatchlistService.getUserWatchlist(sharedUserId);
            setSharedWatchlist(movies);
          }
        } catch (err) {
          setSharedError("Failed to load shared watchlist. Please try again.");
        } finally {
          setSharedLoading(false);
        }
      };
      
      loadSharedWatchlist();
    }
  }, [activeTab, sharedUserId]);

  // Custom Hooks
  const { user, isAuthenticated, checkAuthForWatchlist } = useAuth();
  const {
    nowPlayingMovies,
    upcomingMovies,
    popularMovies,
    topRatedMovies,
    allMovies,
    genres,
    featuredMovie,
    loading,
    updateLoadingState,
  } = useMovies();

  const { watchlist, addToWatchlist } = useWatchlist(user, isAuthenticated);
  const { searchResults, handleSearch, handleFilter } =
    useSearch(updateLoadingState);
  const { aiRecommendations } = useAIRecommendations(
    popularMovies,
    updateLoadingState,
    user,
    isAuthenticated
  );
  const { addMovieToWatchHistory } = useUserStats(user, watchlist);

  // TV Shows Hook
  const {
    popularTVShows,
    topRatedTVShows,
    onTheAirTVShows,
    airingTodayTVShows,
    allTVShows,
    tvGenres,
    featuredTVShow,
    loading: tvLoading,
    updateLoadingState: updateTVLoadingState,
  } = useTVShows();

  // Event Handlers
  const handleWatchlistAction = (movie) => {
    if (!checkAuthForWatchlist()) {
      setShowAuthModal(true);
      return;
    }
    addToWatchlist(movie);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    // Track movie view in watch history
    if (isAuthenticated && user) {
      addMovieToWatchHistory(movie);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === "search") {
      if (isAuthenticated) {
        setShowSearch(true);
        setActiveTab("search");
      } else {
        setShowAuthModal(true);
      }
    } else {
      setShowSearch(false);
      setActiveTab(tab);
    }
  };

  // Icon mapping for sections
  const iconMap = {
    TrendingUp,
    Calendar,
    Trophy,
    Heart,
  };

  const renderContent = () => {
    if (activeTab === "shared-watchlist") {
      return (
        <div className="container mx-auto px-3 sm:px-6 max-w-7xl py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-700 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-purple-600/20 text-purple-400 text-xs px-2.5 py-1 rounded-full border border-purple-500/20 font-semibold tracking-wider uppercase">
                  Shared Watchlist
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {sharedUserName ? `${sharedUserName}'s Movie Picks` : "Watchlist Picks"}
              </h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Discover the movies handpicked by {sharedUserName || "your friend"}.
              </p>
            </div>
            <button
              onClick={() => {
                setSharedUserId(null);
                setSharedUserName("");
                setSharedWatchlist([]);
                setSharedError(null);
                setActiveTab("home");
                window.history.pushState({}, "", "/");
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 self-start md:self-auto"
            >
              ← Back to Home
            </button>
          </div>

          {/* Content Loading / Error / Empty States */}
          {sharedLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Loading shared watchlist...</p>
            </div>
          ) : sharedError ? (
            <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-slate-700/50 max-w-xl mx-auto p-6">
              <h3 className="text-xl font-semibold text-red-400 mb-3">Unable to Load Watchlist</h3>
              <p className="text-slate-400 mb-6">{sharedError}</p>
              <button
                onClick={() => {
                  setSharedUserId(null);
                  setSharedUserName("");
                  setSharedWatchlist([]);
                  setSharedError(null);
                  setActiveTab("home");
                  window.history.pushState({}, "", "/");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
              >
                Go to Home
              </button>
            </div>
          ) : sharedWatchlist.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/10 rounded-2xl border border-slate-700/30">
              <p className="text-slate-400 text-lg mb-4">This watchlist is currently empty.</p>
              <p className="text-slate-500 text-sm">Add some movies to your own watchlist to share them!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {sharedWatchlist.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onMovieClick={handleMovieClick}
                  onAddToWatchlist={handleWatchlistAction}
                  isInWatchlist={watchlist.some((w) => w.id === movie.id)}
                  onAuthRequired={checkAuthForWatchlist}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "home") {
      return (
        <div className="space-y-12">
          <HeroSection
            featuredMovie={featuredMovie}
            onMovieClick={setSelectedMovie}
          />

          <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
            {/* AI Bot CTA */}/
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left Side: Bot Icon + Text */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full self-start sm:self-auto">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      AI Movie Discovery
                    </h3>
                    <p className="text-slate-300 text-sm sm:text-base">
                      Tell me what you're in the mood for and I'll find the
                      perfect movies!
                    </p>
                  </div>
                </div>

                {/* Right Side: CTA Button */}
                <div className="self-start md:self-auto">
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowAIBot(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Sparkles className="w-5 h-5" />
                      Try AI Discovery
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Sparkles className="w-5 h-5" />
                      Sign In to Use AI Discovery
                    </button>
                  )}
                </div>
              </div>
            </div>
            <MovieSection
              title="AI Recommended For You"
              movies={aiRecommendations}
              loading={loading.ai}
              onMovieClick={handleMovieClick}
              onAddToWatchlist={handleWatchlistAction}
              watchlist={watchlist}
              icon={Sparkles}
              onAuthRequired={checkAuthForWatchlist}
            />
            <MovieSection
              title="Now Playing"
              movies={nowPlayingMovies.slice(0, 10)}
              loading={loading.nowPlaying}
              onMovieClick={handleMovieClick}
              onAddToWatchlist={handleWatchlistAction}
              watchlist={watchlist}
              icon={TrendingUp}
              onAuthRequired={checkAuthForWatchlist}
            />
            <MovieSection
              title="Coming Soon"
              movies={upcomingMovies.slice(0, 10)}
              loading={loading.upcoming}
              onMovieClick={handleMovieClick}
              onAddToWatchlist={handleWatchlistAction}
              watchlist={watchlist}
              icon={Calendar}
              onAuthRequired={checkAuthForWatchlist}
            />
            <MovieSection
              title="Top Rated"
              movies={topRatedMovies.slice(0, 10)}
              loading={loading.topRated}
              onMovieClick={handleMovieClick}
              onAddToWatchlist={handleWatchlistAction}
              watchlist={watchlist}
              icon={Trophy}
              onAuthRequired={checkAuthForWatchlist}
            />
            <TVSection
              title="Popular TV Shows"
              tvShows={popularTVShows.slice(0, 10)}
              loading={tvLoading.popular}
              onTVClick={handleMovieClick}
              onAddToWatchlist={handleWatchlistAction}
              watchlist={watchlist}
              icon={TrendingUp}
              onAuthRequired={checkAuthForWatchlist}
            />
          </div>
        </div>
      );
    }

    if (showSearch) {
      return (
        <div className="container mx-auto px-3 sm:px-6 max-w-7xl py-8">
          <SearchBar
            onSearch={handleSearch}
            onFilter={handleFilter}
            genres={genres}
          />

          <MovieSection
            title="Search Results"
            movies={searchResults}
            loading={loading.search}
            onMovieClick={setSelectedMovie}
            onAddToWatchlist={handleWatchlistAction}
            watchlist={watchlist}
            icon={Search}
            onAuthRequired={checkAuthForWatchlist}
          />
        </div>
      );
    }

    // TV Shows tab
    if (activeTab === "tv-shows") {
      return (
        <div className="container mx-auto px-3 sm:px-6 max-w-7xl py-8 space-y-12">
          <TVSection
            title="Popular TV Shows"
            tvShows={popularTVShows}
            loading={tvLoading.popular}
            onTVClick={handleMovieClick}
            onAddToWatchlist={handleWatchlistAction}
            watchlist={watchlist}
            icon={TrendingUp}
            onAuthRequired={checkAuthForWatchlist}
          />

          <TVSection
            title="Top Rated TV Shows"
            tvShows={topRatedTVShows}
            loading={tvLoading.topRated}
            onTVClick={handleMovieClick}
            onAddToWatchlist={handleWatchlistAction}
            watchlist={watchlist}
            icon={Trophy}
            onAuthRequired={checkAuthForWatchlist}
          />

          <TVSection
            title="On The Air"
            tvShows={onTheAirTVShows}
            loading={tvLoading.onTheAir}
            onTVClick={handleMovieClick}
            onAddToWatchlist={handleWatchlistAction}
            watchlist={watchlist}
            icon={Calendar}
            onAuthRequired={checkAuthForWatchlist}
          />

          <TVSection
            title="Airing Today"
            tvShows={airingTodayTVShows}
            loading={tvLoading.airingToday}
            onTVClick={handleMovieClick}
            onAddToWatchlist={handleWatchlistAction}
            watchlist={watchlist}
            icon={Calendar}
            onAuthRequired={checkAuthForWatchlist}
          />
        </div>
      );
    }

    // Show auth prompt for watchlist if not authenticated
    if (activeTab === "watchlist" && !isAuthenticated) {
      return (
        <div className="container mx-auto px-3 sm:px-6 max-w-7xl py-16">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <h1 class="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text text-center py-6 bg-black">
                MOVIECO
              </h1>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Sign In to View Your Watchlist
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Create an account to save your favorite movies and get
              personalized recommendations.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      );
    }

    const movieData = {
      nowPlayingMovies,
      upcomingMovies,
      popularMovies,
      topRatedMovies,
      watchlist,
      searchResults,
      loading,
    };

    const { movies, loading: currentLoading } = getCurrentMovies(
      activeTab,
      movieData
    );
    const { title, icon } = getSectionConfig(activeTab);
    const IconComponent = iconMap[icon];

    return (
      <div className="container mx-auto px-3 sm:px-6 max-w-7xl py-8">
        <MovieSection
          title={title}
          movies={movies}
          loading={currentLoading}
          onMovieClick={handleMovieClick}
          onAddToWatchlist={handleWatchlistAction}
          watchlist={watchlist}
          icon={IconComponent}
          onAuthRequired={checkAuthForWatchlist}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        watchlistCount={watchlist.length}
        onOpenSearch={() => {
          if (isAuthenticated) {
            setShowSearch(true);
            setActiveTab("search");
          } else {
            setShowAuthModal(true);
          }
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAIBot={() => {
          if (isAuthenticated) {
            setShowAIBot(true);
          } else {
            setShowAuthModal(true);
          }
        }}
      />

      {renderContent()}

      <Footer />

      {/* Modals */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        watchlist={watchlist}
        onWatchlistUpdate={() => {
          // Refresh watchlist after updates
          window.location.reload(); // Simple refresh, could be improved
        }}
      />

      <AIMovieBot
        isOpen={showAIBot}
        onClose={() => setShowAIBot(false)}
        moviePool={allMovies}
        onMovieClick={handleMovieClick}
        onAddToWatchlist={handleWatchlistAction}
        watchlist={watchlist}
        onAuthRequired={checkAuthForWatchlist}
      />
    </div>
  );
}

export default App;
