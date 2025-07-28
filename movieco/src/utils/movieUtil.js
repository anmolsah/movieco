export const getCurrentMovies = (activeTab, {
  nowPlayingMovies,
  upcomingMovies,
  popularMovies,
  topRatedMovies,
  watchlist,
  searchResults,
  loading
}) => {
  switch (activeTab) {
    case 'now-playing':
      return { movies: nowPlayingMovies, loading: loading.nowPlaying };
    case 'upcoming':
      return { movies: upcomingMovies, loading: loading.upcoming };
    case 'popular':
      return { movies: popularMovies, loading: loading.popular };
    case 'top-rated':
      return { movies: topRatedMovies, loading: loading.topRated };
    case 'watchlist':
      return { movies: watchlist, loading: false };
    case 'search':
      return { movies: searchResults, loading: loading.search };
    default:
      return { movies: [], loading: false };
  }
};

export const getSectionConfig = (activeTab) => {
  const sectionTitles = {
    'now-playing': 'Now Playing',
    'upcoming': 'Upcoming Movies',
    'popular': 'Popular Movies',
    'top-rated': 'Top Rated Movies',
    'watchlist': 'My Watchlist'
  };

  const sectionIcons = {
    'now-playing': 'TrendingUp',
    'upcoming': 'Calendar',
    'popular': 'TrendingUp',
    'top-rated': 'Trophy',
    'watchlist': 'Heart'
  };

  return {
    title: sectionTitles[activeTab],
    icon: sectionIcons[activeTab]
  };
};