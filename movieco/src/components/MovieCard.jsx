import React, { useState } from "react";
import { Star, Calendar, Clock, Eye, Heart } from "lucide-react";
import { getImageUrl } from "../config/api.js";
import StreamingPlatforms from "./StreamingPlatforms.jsx";

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

    if (onAuthRequired && !onAuthRequired()) {
      return;
    }

    onAddToWatchlist(movie);
  };

  return (
    <div
      className="group relative bg-slate-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
      onClick={() => onMovieClick(movie)}
    >
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
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2" />
              <p className="text-xs sm:text-sm">No Image</p>
            </div>
          </div>
        )}

        {/* Mobile: Simple overlay on tap/hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Desktop: Detailed overlay */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMovieClick(movie);
              }}
              className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 mb-2"
            >
              View Details
            </button>
          </div>
        </div>

        {/* Rating Badge - Smaller on mobile */}
        <div className="absolute top-1 sm:top-3 left-1 sm:left-3 bg-black/70 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
          <Star
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${getRatingColor(
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

        {/* Watchlist Button - Smaller on mobile */}
        <button
          onClick={handleWatchlistClick}
          className={`absolute top-1 sm:top-3 right-1 sm:right-3 p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isInWatchlist
              ? "bg-red-500/80 text-white"
              : "bg-black/50 text-white hover:bg-red-500/80"
          }`}
          title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <Heart
            className={`w-3 h-3 sm:w-4 sm:h-4 ${
              isInWatchlist ? "fill-current" : ""
            }`}
          />
        </button>
      </div>

      {/* Movie Info - Minimal on mobile, detailed on desktop */}
      <div className="p-2 sm:p-4">
        {/* Mobile: Just title and rating */}
        <div className="sm:hidden">
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {formatDate(movie.release_date).split(",")[0]}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-white font-medium">
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop: Full details */}
        <div className="hidden sm:block">
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

          <StreamingPlatforms watchProviders={movie.watchProviders} />

          <div className="flex items-center justify-between mt-3">
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
              <span className="text-xs text-slate-400">
                ({movie.vote_count})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
