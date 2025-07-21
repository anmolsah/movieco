import { HUGGING_FACE_API_URL, HUGGING_FACE_TOKEN } from '../config/api.js';

class AIService {
  constructor() {
    this.model = 'sentence-transformers/all-MiniLM-L6-v2';
  }

  async getMovieRecommendations(userPreferences, movieList) {
    try {
      // Simulate AI recommendations based on user preferences
      // In a real app, you'd send preferences to Hugging Face API
      const genres = userPreferences.genres || [];
      const ratingThreshold = userPreferences.minRating || 6.0;
      
      const recommendations = movieList
        .filter(movie => {
          // Filter by genres if specified
          if (genres.length > 0) {
            const movieGenres = movie.genre_ids || [];
            const hasPreferredGenre = genres.some(genreId => movieGenres.includes(genreId));
            if (!hasPreferredGenre) return false;
          }
          
          // Filter by rating
          return movie.vote_average >= ratingThreshold;
        })
        .sort((a, b) => {
          // Sort by popularity and rating
          const scoreA = (a.popularity * 0.3) + (a.vote_average * 0.7);
          const scoreB = (b.popularity * 0.3) + (b.vote_average * 0.7);
          return scoreB - scoreA;
        })
        .slice(0, 10);

      return recommendations;
    } catch (error) {
      console.error('AI recommendation error:', error);
      return movieList.slice(0, 10); // Fallback to top movies
    }
  }

  async analyzeMoviePreferences(watchHistory, ratings) {
    // Analyze user's movie watching patterns
    const genrePreferences = {};
    const ratingSum = ratings.reduce((sum, rating) => sum + rating, 0);
    const avgRating = ratingSum / ratings.length || 7.0;

    // Count genre preferences from watch history
    watchHistory.forEach(movie => {
      if (movie.genre_ids) {
        movie.genre_ids.forEach(genreId => {
          genrePreferences[genreId] = (genrePreferences[genreId] || 0) + 1;
        });
      }
    });

    // Get top 3 preferred genres
    const topGenres = Object.entries(genrePreferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genreId]) => parseInt(genreId));

    return {
      preferredGenres: topGenres,
      averageRating: avgRating,
      totalWatched: watchHistory.length
    };
  }

  generateMovieInsights(movie) {
    const insights = [];
    
    if (movie.vote_average >= 8.0) {
      insights.push("🏆 Critically acclaimed masterpiece");
    } else if (movie.vote_average >= 7.0) {
      insights.push("⭐ Highly rated by audiences");
    }
    
    if (movie.popularity > 100) {
      insights.push("🔥 Trending now");
    }
    
    if (movie.release_date) {
      const releaseYear = new Date(movie.release_date).getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (releaseYear === currentYear) {
        insights.push("🆕 Latest release");
      } else if (currentYear - releaseYear > 20) {
        insights.push("📽️ Classic cinema");
      }
    }
    
    return insights;
  }
}

export default new AIService();