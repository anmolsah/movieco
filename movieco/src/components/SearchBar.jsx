import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const SearchBar = ({ onSearch, onFilter, genres = [] }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleFilterChange = () => {
    onFilter({
      genres: selectedGenres,
      minRating,
      sortBy
    });
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setMinRating(0);
    setSortBy('popularity.desc');
    onFilter({
      genres: [],
      minRating: 0,
      sortBy: 'popularity.desc'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-16 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors duration-200 ${
              showFilters ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-white font-medium mb-3">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-white font-medium mb-3">Minimum Rating</h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="flex-1 bg-slate-700 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <span className="text-white font-medium min-w-[3rem]">
                {minRating.toFixed(1)}+
              </span>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h4 className="text-white font-medium mb-3">Sort By</h4>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="release_date.desc">Newest First</option>
              <option value="release_date.asc">Oldest First</option>
              <option value="title.asc">Title A-Z</option>
            </select>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={handleFilterChange}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;