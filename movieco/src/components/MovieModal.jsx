import React, { useEffect, useState } from 'react';
import { X, Star, Calendar, Clock, Globe, Play, Users } from 'lucide-react';
import { getImageUrl } from '../config/api.js';
import MovieService from '../services/movieService.js';

const MovieModal = ({ movie, onClose }) => {
  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (movie?.id) {
        setLoading(true);
        const details = await MovieService.getMovieDetails(movie.id);
        setMovieDetails(details);
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movie?.id]);

  if (!movie) return null;

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {movieDetails?.backdrop_path && (
            <div className="h-64 md:h-80 overflow-hidden rounded-t-2xl">
              <img
                src={getImageUrl(movieDetails.backdrop_path, 'w1280')}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(movie.poster_path, 'w342')}
                alt={movie.title}
                className="w-48 h-72 object-cover rounded-xl shadow-2xl mx-auto md:mx-0"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {movie.title}
              </h1>
              
              {movieDetails?.tagline && (
                <p className="text-purple-400 italic mb-4">{movieDetails.tagline}</p>
              )}

              {/* Rating and Basic Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">
                    {movie.vote_average?.toFixed(1)}/10
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>
                
                {movieDetails?.runtime && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(movieDetails.runtime)}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {movieDetails?.genres && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movieDetails.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                <p className="text-slate-300 leading-relaxed">
                  {movie.overview || 'No overview available.'}
                </p>
              </div>

              {/* Additional Details */}
              {!loading && movieDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {movieDetails.budget > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Budget</h4>
                      <p className="text-slate-400">{formatCurrency(movieDetails.budget)}</p>
                    </div>
                  )}
                  
                  {movieDetails.revenue > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Revenue</h4>
                      <p className="text-slate-400">{formatCurrency(movieDetails.revenue)}</p>
                    </div>
                  )}
                  
                  {movieDetails.production_companies?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Production</h4>
                      <p className="text-slate-400">
                        {movieDetails.production_companies[0].name}
                      </p>
                    </div>
                  )}
                  
                  {movieDetails.spoken_languages?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Language</h4>
                      <p className="text-slate-400">
                        {movieDetails.spoken_languages[0].english_name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cast */}
              {movieDetails?.credits?.cast && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Cast</h3>
                  <div className="flex flex-wrap gap-2">
                    {movieDetails.credits.cast.slice(0, 8).map((actor) => (
                      <div
                        key={actor.id}
                        className="bg-slate-800 px-3 py-2 rounded-lg text-sm"
                      >
                        <div className="text-white font-medium">{actor.name}</div>
                        <div className="text-slate-400 text-xs">{actor.character}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trailer Button */}
              {movieDetails?.videos?.results?.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const trailer = movieDetails.videos.results.find(
                        video => video.type === 'Trailer' && video.site === 'YouTube'
                      );
                      if (trailer) {
                        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <Play className="w-5 h-5" />
                    Watch Trailer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;