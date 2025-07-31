import React, { useState } from "react";
import { Star, Calendar, Clock, Eye, Heart } from "lucide-react";
import { getImageUrl } from "../config/api.js";

const MovieCard = ({
  movie,
  onMovieClick,
  onAddToWatchlist,
  isInWatchlist,
  onAuthRequired,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "text-green-400";
    if (rating >= 7) return "text-yellow-400";
    if (rating >= 6) return "text-orange-400";
    return "text-red-400";
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();

    // Check if user is authenticated before allowing wishlist action
    if (onAuthRequired && !onAuthRequired()) {
      return; // onAuthRequired will handle showing auth modal
    }

    onAddToWatchlist(movie);
  };

  return (
    <div className="group relative bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {!imageError ? (
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Overlay with rating */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => onMovieClick(movie)}
              className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 mb-2"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          <Star
            className={`w-3 h-3 ${getRatingColor(
              movie.vote_average
            )} fill-current`}
          />
          <span
            className={`text-xs font-medium ${getRatingColor(
              movie.vote_average
            )}`}
          >
            {movie.vote_average?.toFixed(1) || "N/A"}
          </span>
        </div>

        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isInWatchlist
              ? "bg-red-500/80 text-white"
              : "bg-black/50 text-white hover:bg-red-500/80"
          }`}
          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Heart className={`w-4 h-4 ${isInWatchlist ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors duration-200">
          {movie.title}
        </h3>

        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(movie.release_date)}</span>
        </div>

        <p className="text-slate-300 text-sm line-clamp-3 mb-3">
          {movie.overview || "No description available."}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-slate-400">
            <Eye className="w-4 h-4" />
            <span className="text-xs">
              {movie.popularity?.toFixed(0)} views
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-white font-medium">
              {movie.vote_average?.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">({movie.vote_count})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
