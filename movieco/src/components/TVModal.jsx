import React, { useEffect, useState } from "react";
import { X, Star, Calendar, Clock, Globe, Play, Users, Tv } from "lucide-react";
import { getImageUrl } from "../config/api.js";
import TVService from "../services/TVService.js";

const TVModal = ({ tvShow, onClose }) => {
  const [tvDetails, setTvDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVDetails = async () => {
      if (tvShow?.id) {
        setLoading(true);
        const details = await TVService.getTVDetails(tvShow.id);
        setTvDetails(details);
        setLoading(false);
      }
    };

    fetchTVDetails();
  }, [tvShow?.id]);

  if (!tvShow) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {tvDetails?.backdrop_path && (
            <div className="h-64 md:h-80 overflow-hidden rounded-t-2xl">
              <img
                src={getImageUrl(tvDetails.backdrop_path, "w1280")}
                alt={tvShow.name}
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
                src={getImageUrl(tvShow.poster_path, "w342")}
                alt={tvShow.name}
                className="w-48 h-72 object-cover rounded-xl shadow-2xl mx-auto md:mx-0"
              />
            </div>

            {/* TV Show Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {tvShow.name}
              </h1>

              {tvDetails?.tagline && (
                <p className="text-purple-400 italic mb-4">
                  {tvDetails.tagline}
                </p>
              )}

              {/* Rating and Basic Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">
                    {tvShow.vote_average?.toFixed(1)}/10
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(tvShow.first_air_date)}</span>
                </div>

                {tvDetails?.number_of_seasons && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Tv className="w-4 h-4" />
                    <span>{tvDetails.number_of_seasons} Season{tvDetails.number_of_seasons !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {tvDetails?.number_of_episodes && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Play className="w-4 h-4" />
                    <span>{tvDetails.number_of_episodes} Episodes</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {tvDetails?.genres && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tvDetails.genres.map((genre) => (
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
                <h3 className="text-xl font-semibold text-white mb-3">
                  Overview
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {tvShow.overview || "No overview available."}
                </p>
              </div>

              {/* Additional Details */}
              {!loading && tvDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {tvDetails.status && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Status</h4>
                      <p className="text-slate-400">{tvDetails.status}</p>
                    </div>
                  )}

                  {tvDetails.networks?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Network</h4>
                      <p className="text-slate-400">
                        {tvDetails.networks[0].name}
                      </p>
                    </div>
                  )}

                  {tvDetails.created_by?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Created By</h4>
                      <p className="text-slate-400">
                        {tvDetails.created_by.map(creator => creator.name).join(', ')}
                      </p>
                    </div>
                  )}

                  {tvDetails.spoken_languages?.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-1">Language</h4>
                      <p className="text-slate-400">
                        {tvDetails.spoken_languages[0].english_name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cast */}
              {tvDetails?.credits?.cast && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Cast
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tvDetails.credits.cast.slice(0, 8).map((actor) => (
                      <div
                        key={actor.id}
                        className="bg-slate-800 px-3 py-2 rounded-lg text-sm"
                      >
                        <div className="text-white font-medium">
                          {actor.name}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {actor.character}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trailer Button */}
              {tvDetails?.videos?.results?.length > 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const trailer = tvDetails.videos.results.find(
                        (video) =>
                          video.type === "Trailer" && video.site === "YouTube"
                      );
                      if (trailer) {
                        window.open(
                          `https://www.youtube.com/watch?v=${trailer.key}`,
                          "_blank"
                        );
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

export default TVModal;