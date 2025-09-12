class UserStatsService {
  constructor() {
    this.storagePrefix = "userStats_";
  }

  getUserStats(userId) {
    if (!userId) return this.getDefaultStats();

    const stats = localStorage.getItem(`${this.storagePrefix}${userId}`);
    return stats ? JSON.parse(stats) : this.getDefaultStats();
  }

  getDefaultStats() {
    return {
      moviesWatched: 0,
      watchlistCount: 0,
      averageRating: 0,
      totalRatings: 0,
      ratingSum: 0,
      favoriteGenres: {},
      watchHistory: [],
      ratings: {},
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
  }

  updateStats(userId, updates) {
    if (!userId) return;

    const currentStats = this.getUserStats(userId);
    const updatedStats = {
      ...currentStats,
      ...updates,
      lastActive: new Date().toISOString(),
    };

    localStorage.setItem(
      `${this.storagePrefix}${userId}`,
      JSON.stringify(updatedStats)
    );
    return updatedStats;
  }

  addMovieToWatchHistory(userId, movie) {
    if (!userId) return;

    const stats = this.getUserStats(userId);
    const isAlreadyWatched = stats.watchHistory.some((m) => m.id === movie.id);

    if (!isAlreadyWatched) {
      stats.watchHistory.push({
        ...movie,
        watchedAt: new Date().toISOString(),
      });
      stats.moviesWatched = stats.watchHistory.length;


      if (movie.genre_ids) {
        movie.genre_ids.forEach((genreId) => {
          stats.favoriteGenres[genreId] =
            (stats.favoriteGenres[genreId] || 0) + 1;
        });
      }

      this.updateStats(userId, stats);
    }

    return stats;
  }

  updateWatchlistCount(userId, count) {
    if (!userId) return;

    return this.updateStats(userId, { watchlistCount: count });
  }

  addMovieRating(userId, movieId, rating) {
    if (!userId) return;

    const stats = this.getUserStats(userId);
    const oldRating = stats.ratings[movieId];

    if (oldRating) {

      stats.ratingSum = stats.ratingSum - oldRating + rating;
    } else {

      stats.ratingSum += rating;
      stats.totalRatings += 1;
    }

    stats.ratings[movieId] = rating;
    stats.averageRating =
      stats.totalRatings > 0 ? stats.ratingSum / stats.totalRatings : 0;

    return this.updateStats(userId, stats);
  }

  getTopGenres(userId, limit = 3) {
    const stats = this.getUserStats(userId);
    return Object.entries(stats.favoriteGenres)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([genreId, count]) => ({ genreId: parseInt(genreId), count }));
  }

  getRecentlyWatched(userId, limit = 5) {
    const stats = this.getUserStats(userId);
    return stats.watchHistory
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice(0, limit);
  }
}

export default new UserStatsService();
