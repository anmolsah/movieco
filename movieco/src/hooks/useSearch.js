import { useState } from "react";
import MovieService from "../services/movieService.js";

export const useSearch = (updateLoadingState) => {
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    updateLoadingState("search", true);

    try {
      const results = await MovieService.searchMovies(query);
      setSearchResults(results.results || []);
    } catch (error) {
      setSearchResults([]);
    }

    updateLoadingState("search", false);
  };

  const handleFilter = (filters) => {
    // Filter logic will be implemented here
  };

  return {
    searchResults,
    handleSearch,
    handleFilter,
  };
};
