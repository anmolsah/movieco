import React, { useEffect, useState } from 'react';
import { Play, Star, Calendar, Info } from 'lucide-react';
import { getImageUrl } from '../config/api.js';

const HeroSection = ({ featuredMovie, onMovieClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (featuredMovie) {
      setImageLoaded(false);
    }
  }, [featuredMovie]);

  if (!featuredMovie) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-96 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getImageUrl(featuredMovie.backdrop_path, 'w1280')}
          alt={featuredMovie.title}
          className={`w-full h-full object-cover transition-all duration-1000 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-2xl">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-purple-600/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-yellow-400 font-medium">Featured Movie</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {featuredMovie.title}
            </h1>

            {/* Movie Info */}
            <div className="flex items-center gap-6 mb-6 text-slate-300">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{featuredMovie.vote_average?.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(featuredMovie.release_date).getFullYear()}</span>
              </div>
              
              <div className="bg-slate-700/50 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-sm font-medium">HD</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-200 text-lg mb-8 leading-relaxed max-w-xl">
              {featuredMovie.overview?.length > 200 
                ? `${featuredMovie.overview.substring(0, 200)}...` 
                : featuredMovie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onMovieClick(featuredMovie)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </button>
              
              <button
                onClick={() => onMovieClick(featuredMovie)}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 transition-all duration-200 border border-white/20 hover:border-white/40"
              >
                <Info className="w-5 h-5" />
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;