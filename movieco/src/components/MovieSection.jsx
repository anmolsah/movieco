import React from "react";
import MovieCard from "./MovieCard.jsx";

const MovieSection = ({
  title,
  movies,
  loading,
  onMovieClick,
  onAddToWatchlist,
  watchlist = [],
  icon: Icon,
  onAuthRequired,
}) => {
  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          {Icon && <Icon className="w-6 h-6 text-purple-400" />}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-4 md:gap-6">
          {[...Array(14)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-slate-800 aspect-[2/3] rounded-lg sm:rounded-xl mb-2 sm:mb-4"></div>
              <div className="space-y-1 sm:space-y-2 px-1 sm:px-0">
                <div className="h-3 sm:h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-2 sm:h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        {Icon && <Icon className="w-6 h-6 text-purple-400" />}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="h-px bg-gradient-to-r from-purple-500/50 to-transparent flex-1 ml-4"></div>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No movies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieClick={onMovieClick}
              onAddToWatchlist={onAddToWatchlist}
              isInWatchlist={watchlist.some((w) => w.id === movie.id)}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default MovieSection;
