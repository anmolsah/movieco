import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Settings,
  Heart,
  Star,
  Bell,
  Shield,
  Edit2,
  Save,
  Camera,
  TrendingUp,
  Calendar,
  Award,
  Menu,
} from "lucide-react";
import AuthService from "../services/authService.js";
import { useUserStats } from "../hooks/useUserStats.js";
import MovieService from "../services/movieService.js";
import WatchlistService from "../services/watchlistService.js";

const ProfileModal = ({
  isOpen,
  onClose,
  watchlist = [],
  onWatchlistUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({});
  const [genres, setGenres] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    userStats,
    addMovieToWatchHistory,
    rateMovie,
    getTopGenres,
    getRecentlyWatched,
  } = useUserStats(user, watchlist);

  useEffect(() => {
    if (isOpen) {
      const currentUser = AuthService.getCurrentUser();
      const userPrefs = AuthService.getUserPreferences();
      setUser(currentUser);
      setPreferences(userPrefs);
      setEditData({
        name: currentUser?.name || "",
        bio: currentUser?.user_metadata?.bio || "",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const loadGenres = async () => {
      const genresData = await MovieService.getGenres();
      setGenres(genresData);
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadRecentlyAdded = async () => {
      if (user?.id) {
        const recent = await WatchlistService.getRecentlyAdded(user.id, 5);
        setRecentlyAdded(recent);
      }
    };

    if (isOpen && user?.id) {
      loadRecentlyAdded();
    }
  }, [isOpen, user?.id, watchlist.length]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await AuthService.updateProfile(editData);
      setUser({ ...user, ...editData });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    console.log("ProfileModal: Preference change:", key, value);
    const updatedPrefs = { ...preferences, [key]: value };
    setPreferences(updatedPrefs);
    await AuthService.updateUserPreferences(updatedPrefs);
    console.log("ProfileModal: Updated preferences:", updatedPrefs);
  };

  const handleSignOut = async () => {
    await AuthService.signOut();
    onClose();
  };

  const handleClearWatchlist = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire watchlist? This action cannot be undone."
      )
    ) {
      try {
        await WatchlistService.clearWatchlist(user.id);
        if (onWatchlistUpdate) {
          onWatchlistUpdate();
        }
      } catch (error) {
        console.error("Failed to clear watchlist:", error);
      }
    }
  };

  const getGenreName = (genreId) => {
    const genre = genres.find((g) => g.id === genreId);
    return genre ? genre.name : "Unknown";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen || !user) return null;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="text-center">
        <div className="relative inline-block">
          <img
            src={user.picture}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-purple-500/20"
          />
          <button className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 p-2 rounded-full transition-colors duration-200">
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        {editMode ? (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Your name"
            />
            <textarea
              value={editData.bio}
              onChange={(e) =>
                setEditData({ ...editData, bio: e.target.value })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
              rows="3"
              placeholder="Tell us about yourself..."
            />
          </div>
        ) : (
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-white">{user.name}</h3>
            <p className="text-slate-400 mt-1">
              {user.bio || "Movie enthusiast"}
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Profile Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">
            {userStats?.moviesWatched || 0}
          </div>
          <div className="text-sm text-slate-400">Movies Watched</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {userStats?.watchlistCount || 0}
          </div>
          <div className="text-sm text-slate-400">Watchlist</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {userStats?.averageRating
              ? userStats.averageRating.toFixed(1)
              : "0.0"}
          </div>
          <div className="text-sm text-slate-400">Avg Rating</div>
        </div>
      </div>

      {/* Top Genres */}
      {userStats && getTopGenres().length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">
            Your Favorite Genres
          </h4>
          <div className="flex flex-wrap gap-2">
            {getTopGenres().map(({ genreId, count }) => (
              <div
                key={genreId}
                className="bg-purple-600/20 border border-purple-500/30 px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <span className="text-purple-300 font-medium">
                  {getGenreName(genreId)}
                </span>
                <span className="text-purple-400 text-sm">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Watched */}
      {userStats && getRecentlyWatched().length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Recently Watched</h4>
          <div className="space-y-2">
            {getRecentlyWatched().map((movie) => (
              <div
                key={movie.id}
                className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-12 h-18 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{movie.title}</div>
                  <div className="text-slate-400 text-sm">
                    Watched on {formatDate(movie.watchedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Added to Watchlist */}
      {recentlyAdded.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">
            Recently Added to Watchlist
          </h4>
          <div className="space-y-2">
            {recentlyAdded.map((movie) => (
              <div
                key={movie.id}
                className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-12 h-18 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{movie.title}</div>
                  <div className="text-slate-400 text-sm">
                    Added on {formatDate(movie.added_at)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Info */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">
          Account Information
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Email</span>
            <span className="text-white">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Member since</span>
            <span className="text-white">
              {formatDate(userStats?.joinDate || user.created_at)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last active</span>
            <span className="text-white">
              {formatDate(userStats?.lastActive || new Date().toISOString())}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Account status</span>
            <span className="text-green-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {user.email_confirmed_at ? "Verified" : "Unverified"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {editMode ? (
          <>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Watchlist Management */}
      {watchlist.length > 0 && (
        <div className="pt-4 border-t border-slate-700">
          <button
            onClick={handleClearWatchlist}
            className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Clear Entire Watchlist ({watchlist.length} movies)
          </button>
        </div>
      )}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-white">Movie Preferences</h4>

      {/* Favorite Genres */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Favorite Genres{" "}
          {userStats && getTopGenres().length > 0 && (
            <span className="text-purple-400 text-xs">
              (Based on your watch history)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {genres.slice(0, 12).map((genre) => (
            <button
              key={genre.id}
              onClick={() => {
                const current = preferences.favoriteGenres || [];
                const updated = current.includes(genre.id)
                  ? current.filter((g) => g !== genre.id)
                  : [...current, genre.id];
                handlePreferenceChange("favoriteGenres", updated);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                preferences.favoriteGenres?.includes(genre.id)
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Preferred Language
        </label>
        <select
          value={preferences.preferredLanguage}
          onChange={(e) =>
            handlePreferenceChange("preferredLanguage", e.target.value)
          }
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
        </select>
      </div>

      {/* Adult Content */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-300 font-medium">Adult Content</div>
          <div className="text-sm text-slate-400">
            Include mature content in recommendations
          </div>
        </div>
        <button
          onClick={() =>
            handlePreferenceChange("adultContent", !preferences.adultContent)
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            preferences.adultContent ? "bg-purple-600" : "bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              preferences.adultContent ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-white">
        Notification Settings
      </h4>

      {Object.entries(preferences.notifications || {}).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <div className="text-slate-300 font-medium capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div className="text-sm text-slate-400">
              {key === "newReleases" && "Get notified about new movie releases"}
              {key === "recommendations" &&
                "Receive AI-powered movie recommendations"}
              {key === "watchlistUpdates" &&
                "Updates about movies in your watchlist"}
            </div>
          </div>
          <button
            onClick={() =>
              handlePreferenceChange("notifications", {
                ...preferences.notifications,
                [key]: !value,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              value ? "bg-purple-600" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-white">Privacy Settings</h4>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-300 font-medium">Profile Visibility</div>
          <div className="text-sm text-slate-400">
            Control who can see your profile
          </div>
        </div>
        <select
          value={preferences.privacy?.profileVisibility || "private"}
          onChange={(e) =>
            handlePreferenceChange("privacy", {
              ...preferences.privacy,
              profileVisibility: e.target.value,
            })
          }
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          <option value="public">Public</option>
          <option value="friends">Friends Only</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-300 font-medium">Share Watchlist</div>
          <div className="text-sm text-slate-400">
            Allow others to see your watchlist
          </div>
        </div>
        <button
          onClick={() =>
            handlePreferenceChange("privacy", {
              ...preferences.privacy,
              shareWatchlist: !preferences.privacy?.shareWatchlist,
            })
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            preferences.privacy?.shareWatchlist
              ? "bg-purple-600"
              : "bg-slate-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              preferences.privacy?.shareWatchlist
                ? "translate-x-6"
                : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Sign Out Button */}
      <div className="pt-6 border-t border-slate-700">
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Profile Settings</h2>
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden text-slate-400 hover:text-white transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 min-h-0">
          {/* Sidebar - Mobile */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-slate-800/50 p-4 border-b border-slate-700">
              <nav className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Sidebar - Desktop */}
          <div className="hidden sm:block w-48 bg-slate-800/50 p-4 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "preferences" && renderPreferencesTab()}
            {activeTab === "notifications" && renderNotificationsTab()}
            {activeTab === "privacy" && renderPrivacyTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
