import React, { useEffect, useState } from "react";
import { Play, Star, Calendar, Info, Volume2, VolumeX } from "lucide-react";
import { getImageUrl } from "../config/api.js";

const HeroSection = ({ featuredMovie, onMovieClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [trailerLoaded, setTrailerLoaded] = useState(false);

  
  useEffect(() => {
    const fetchTrailer = async () => {
      if (!featuredMovie?.id) return;
      
      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${featuredMovie.id}/videos?api_key=${API_KEY}`
        );
        const data = await response.json();
        
      
        const trailer = data.results?.find(
          video => 
            video.type === 'Trailer' && 
            video.site === 'YouTube' && 
            video.key
        ) || data.results?.find(
          video => 
            video.type === 'Teaser' && 
            video.site === 'YouTube' && 
            video.key
        );
        
        if (trailer) {
          setTrailerKey(trailer.key);
          setTimeout(() => {
            setShowTrailer(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error fetching trailer:', error);
      }
    };

    if (featuredMovie) {
      setImageLoaded(false);
      setTrailerKey(null);
      setShowTrailer(false);
      setTrailerLoaded(false);
      fetchTrailer();
    }
  }, [featuredMovie]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };


  if (!featuredMovie) {
    return (
      <div className="relative h-[60vh] sm:h-[70vh] bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-700 rounded-full mx-auto mb-4"></div>
          <div className="h-6 sm:h-8 bg-slate-700 rounded w-56 sm:w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-72 sm:w-96 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] sm:h-[85vh] md:h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(featuredMovie.backdrop_path, "w1280")}
          alt={featuredMovie.title}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } ${showTrailer && trailerLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Trailer Video */}
      {trailerKey && showTrailer && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${trailerLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${trailerKey}&vq=hd1080`}
            title="Movie Trailer"
            className="w-full h-full object-cover"
            style={{
              width: '100vw',
              height: '56.25vw', 
              minHeight: '100vh',
              minWidth: '177.78vh', 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setTrailerLoaded(true)}
          />
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

      {/* Mute/Unmute Button */}
      {trailerKey && showTrailer && (
        <button
          onClick={toggleMute}
          className="absolute top-6 right-6 z-20 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-600/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-yellow-400 font-medium text-sm">
                {showTrailer && trailerKey ? 'Now Playing' : 'Featured Movie'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
              {featuredMovie.title}
            </h1>

            {/* Movie Info */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 text-slate-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">
                  {featuredMovie.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(featuredMovie.release_date).getFullYear()}
                </span>
              </div>
              <div className="bg-slate-700/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm font-medium">HD</span>
              </div>
              {trailerKey && (
                <div className="bg-red-600/50 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-medium">TRAILER</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-200 text-base sm:text-lg mb-8 leading-relaxed max-w-xl drop-shadow-lg">
              {featuredMovie.overview?.length > 200
                ? `${featuredMovie.overview.substring(0, 200)}...`
                : featuredMovie.overview}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={() => onMovieClick(featuredMovie)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
              >
                <Play className="w-5 h-5" />
                Watch Now
              </button>

              <button
                onClick={() => onMovieClick(featuredMovie)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <Info className="w-5 h-5" />
                More Info
              </button>

              {/* Toggle Trailer Button */}
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(!showTrailer)}
                  className="bg-red-600/20 backdrop-blur-sm hover:bg-red-600/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                >
                  {showTrailer ? 'Hide Trailer' : 'Show Trailer'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;