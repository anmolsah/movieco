import React, { useState } from "react";
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
      setShowSearch(true);
      setActiveTab("search");
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
    if (activeTab === "home") {
      return (
        <div className="space-y-12">
          <HeroSection
            featuredMovie={featuredMovie}
            onMovieClick={setSelectedMovie}
          />

          <div className="container mx-auto px-6 max-w-7xl">
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
                  <button
                    onClick={() => setShowAIBot(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <Sparkles className="w-5 h-5" />
                    Try AI Discovery
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      AI Movie Discovery
                    </h3>
                    <p className="text-slate-300">
                      Tell me what you're in the mood for and I'll find the
                      perfect movies!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIBot(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Try AI Discovery
                </button>
              </div>
            </div> */}
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
          </div>
        </div>
      );
    }

    if (showSearch) {
      return (
        <div className="container mx-auto px-6 max-w-7xl py-8">
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

    // Show auth prompt for watchlist if not authenticated
    if (activeTab === "watchlist" && !isAuthenticated) {
      return (
        <div className="container mx-auto px-6 max-w-7xl py-16">
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
      <div className="container mx-auto px-6 max-w-7xl py-8">
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
          setShowSearch(true);
          setActiveTab("search");
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAIBot={() => setShowAIBot(true)}
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
