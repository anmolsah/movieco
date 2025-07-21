class AIMovieBot {
  constructor() {
    this.huggingFaceToken = import.meta.env.VITE_HUGGINGFACE_TOKEN;
    this.baseUrl = "https://api-inference.huggingface.co/models";

    // Genre mapping for better understanding
    this.genreMap = {
      action: 28,
      adventure: 12,
      animation: 16,
      comedy: 35,
      crime: 80,
      documentary: 99,
      drama: 18,
      family: 10751,
      fantasy: 14,
      history: 36,
      horror: 27,
      music: 10402,
      mystery: 9648,
      romance: 10749,
      "science fiction": 878,
      "sci-fi": 878,
      thriller: 53,
      war: 10752,
      western: 37,
      "tv movie": 10770,
    };

    // Mood to genre mapping
    this.moodToGenres = {
      happy: [35, 10751, 16], // Comedy, Family, Animation
      sad: [18, 10749], // Drama, Romance
      excited: [28, 12, 53], // Action, Adventure, Thriller
      scared: [27, 53], // Horror, Thriller
      romantic: [10749, 35], // Romance, Comedy
      adventurous: [12, 14, 878], // Adventure, Fantasy, Sci-Fi
      nostalgic: [36, 18], // History, Drama
      funny: [35, 16], // Comedy, Animation
      intense: [53, 80, 27], // Thriller, Crime, Horror
      relaxed: [10751, 99], // Family, Documentary
      inspiring: [18, 36, 10751], // Drama, History, Family
      mysterious: [9648, 53, 80], // Mystery, Thriller, Crime
    };

    // Country codes mapping
    this.countryMap = {
      usa: "US",
      america: "US",
      "united states": "US",
      uk: "GB",
      britain: "GB",
      england: "GB",
      "united kingdom": "GB",
      france: "FR",
      germany: "DE",
      italy: "IT",
      spain: "ES",
      japan: "JP",
      korea: "KR",
      "south korea": "KR",
      china: "CN",
      india: "IN",
      bollywood: "IN",
      russia: "RU",
      canada: "CA",
      australia: "AU",
      brazil: "BR",
      mexico: "MX",
      argentina: "AR",
    };

    // Time period keywords
    this.timePeriods = {
      recent: {
        from: new Date().getFullYear() - 2,
        to: new Date().getFullYear(),
      },
      new: { from: new Date().getFullYear() - 1, to: new Date().getFullYear() },
      classic: { from: 1950, to: 1990 },
      old: { from: 1900, to: 1980 },
      "90s": { from: 1990, to: 1999 },
      "2000s": { from: 2000, to: 2009 },
      "2010s": { from: 2010, to: 2019 },
      "2020s": { from: 2020, to: new Date().getFullYear() },
    };
  }

  async analyzeUserInput(input) {
    try {
      const analysis = {
        genres: [],
        moods: [],
        countries: [],
        timePeriod: null,
        rating: null,
        keywords: [],
        originalInput: input.toLowerCase(),
      };

      // Use Hugging Face for sentiment and emotion analysis
      const emotions = await this.analyzeEmotions(input);
      const sentiment = await this.analyzeSentiment(input);

      // Extract genres
      analysis.genres = this.extractGenres(input);

      // Extract moods and emotions
      analysis.moods = this.extractMoods(input, emotions);

      // Extract countries
      analysis.countries = this.extractCountries(input);

      // Extract time periods
      analysis.timePeriod = this.extractTimePeriod(input);

      // Extract rating preferences
      analysis.rating = this.extractRating(input);

      // Extract keywords for search
      analysis.keywords = this.extractKeywords(input);

      return analysis;
    } catch (error) {
      console.error("Error analyzing user input:", error);
      return this.fallbackAnalysis(input);
    }
  }

  async analyzeEmotions(text) {
    try {
      const response = await fetch(
        `${this.baseUrl}/j-hartmann/emotion-english-distilroberta-base`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.huggingFaceToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) throw new Error("Emotion analysis failed");

      const result = await response.json();
      return result[0] || [];
    } catch (error) {
      console.error("Emotion analysis error:", error);
      return [];
    }
  }

  async analyzeSentiment(text) {
    try {
      const response = await fetch(
        `${this.baseUrl}/cardiffnlp/twitter-roberta-base-sentiment-latest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.huggingFaceToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) throw new Error("Sentiment analysis failed");

      const result = await response.json();
      return result[0] || [];
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return [];
    }
  }

  extractGenres(input) {
    const genres = [];
    const lowerInput = input.toLowerCase();

    Object.entries(this.genreMap).forEach(([genre, id]) => {
      if (lowerInput.includes(genre)) {
        genres.push(id);
      }
    });

    return genres;
  }

  extractMoods(input, emotions) {
    const moods = [];
    const lowerInput = input.toLowerCase();

    // Check for explicit mood keywords
    Object.keys(this.moodToGenres).forEach((mood) => {
      if (lowerInput.includes(mood)) {
        moods.push(mood);
      }
    });

    // Add moods based on emotion analysis
    if (emotions && emotions.length > 0) {
      const topEmotion = emotions.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );

      const emotionToMood = {
        joy: "happy",
        sadness: "sad",
        anger: "intense",
        fear: "scared",
        surprise: "excited",
        love: "romantic",
      };

      if (emotionToMood[topEmotion.label]) {
        moods.push(emotionToMood[topEmotion.label]);
      }
    }

    return [...new Set(moods)]; // Remove duplicates
  }

  extractCountries(input) {
    const countries = [];
    const lowerInput = input.toLowerCase();

    Object.entries(this.countryMap).forEach(([country, code]) => {
      if (lowerInput.includes(country)) {
        countries.push(code);
      }
    });

    return countries;
  }

  extractTimePeriod(input) {
    const lowerInput = input.toLowerCase();

    for (const [period, range] of Object.entries(this.timePeriods)) {
      if (lowerInput.includes(period)) {
        return range;
      }
    }

    // Check for specific years
    const yearMatch = input.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      return { from: year, to: year };
    }

    return null;
  }

  extractRating(input) {
    const lowerInput = input.toLowerCase();

    if (
      lowerInput.includes("highly rated") ||
      lowerInput.includes("best") ||
      lowerInput.includes("top rated")
    ) {
      return { min: 8.0 };
    }

    if (lowerInput.includes("good") || lowerInput.includes("decent")) {
      return { min: 7.0 };
    }

    // Look for specific ratings
    const ratingMatch = input.match(
      /(\d+(?:\.\d+)?)\s*(?:stars?|\/10|rating)/i
    );
    if (ratingMatch) {
      return { min: parseFloat(ratingMatch[1]) };
    }

    return null;
  }

  extractKeywords(input) {
    // Remove common words and extract meaningful keywords
    const commonWords = [
      "movie",
      "film",
      "show",
      "watch",
      "want",
      "like",
      "good",
      "best",
      "top",
      "find",
      "recommend",
      "suggest",
    ];
    const words = input.toLowerCase().split(/\s+/);

    return words.filter(
      (word) =>
        word.length > 3 &&
        !commonWords.includes(word) &&
        !Object.keys(this.genreMap).includes(word) &&
        !Object.keys(this.moodToGenres).includes(word)
    );
  }

  fallbackAnalysis(input) {
    // Simple fallback when AI analysis fails
    return {
      genres: this.extractGenres(input),
      moods: [],
      countries: this.extractCountries(input),
      timePeriod: this.extractTimePeriod(input),
      rating: this.extractRating(input),
      keywords: this.extractKeywords(input),
      originalInput: input.toLowerCase(),
    };
  }

  async findMovies(analysis, moviePool) {
    try {
      let filteredMovies = [...moviePool];

      // Filter by genres
      if (analysis.genres.length > 0) {
        filteredMovies = filteredMovies.filter(
          (movie) =>
            movie.genre_ids &&
            movie.genre_ids.some((id) => analysis.genres.includes(id))
        );
      }

      // Filter by mood-based genres
      if (analysis.moods.length > 0) {
        const moodGenres = analysis.moods.flatMap(
          (mood) => this.moodToGenres[mood] || []
        );
        if (moodGenres.length > 0) {
          filteredMovies = filteredMovies.filter(
            (movie) =>
              movie.genre_ids &&
              movie.genre_ids.some((id) => moodGenres.includes(id))
          );
        }
      }

      // Filter by time period
      if (analysis.timePeriod) {
        filteredMovies = filteredMovies.filter((movie) => {
          if (!movie.release_date) return false;
          const year = new Date(movie.release_date).getFullYear();
          return (
            year >= analysis.timePeriod.from && year <= analysis.timePeriod.to
          );
        });
      }

      // Filter by rating
      if (analysis.rating) {
        filteredMovies = filteredMovies.filter(
          (movie) => movie.vote_average >= analysis.rating.min
        );
      }

      // Search by keywords in title and overview
      if (analysis.keywords.length > 0) {
        filteredMovies = filteredMovies.filter((movie) => {
          const searchText = `${movie.title} ${movie.overview}`.toLowerCase();
          return analysis.keywords.some((keyword) =>
            searchText.includes(keyword)
          );
        });
      }

      // Sort by relevance (popularity + rating)
      filteredMovies.sort((a, b) => {
        const scoreA = a.popularity * 0.3 + a.vote_average * 0.7;
        const scoreB = b.popularity * 0.3 + b.vote_average * 0.7;
        return scoreB - scoreA;
      });

      return {
        movies: filteredMovies.slice(0, 20),
        analysis,
        totalFound: filteredMovies.length,
      };
    } catch (error) {
      console.error("Error finding movies:", error);
      return {
        movies: moviePool.slice(0, 10),
        analysis,
        totalFound: moviePool.length,
      };
    }
  }

  generateExplanation(analysis, results) {
    const explanations = [];

    if (analysis.genres.length > 0) {
      const genreNames = analysis.genres
        .map((id) =>
          Object.keys(this.genreMap).find((key) => this.genreMap[key] === id)
        )
        .filter(Boolean);
      explanations.push(`Found ${genreNames.join(", ")} movies`);
    }

    if (analysis.moods.length > 0) {
      explanations.push(`Matched your ${analysis.moods.join(", ")} mood`);
    }

    if (analysis.countries.length > 0) {
      explanations.push(`From ${analysis.countries.join(", ")}`);
    }

    if (analysis.timePeriod) {
      if (analysis.timePeriod.from === analysis.timePeriod.to) {
        explanations.push(`From ${analysis.timePeriod.from}`);
      } else {
        explanations.push(
          `From ${analysis.timePeriod.from}-${analysis.timePeriod.to}`
        );
      }
    }

    if (analysis.rating) {
      explanations.push(`With rating ${analysis.rating.min}+ stars`);
    }

    if (analysis.keywords.length > 0) {
      explanations.push(`Matching "${analysis.keywords.join(", ")}"`);
    }

    return explanations.length > 0
      ? `🎬 ${explanations.join(" • ")} • Found ${results.totalFound} movies`
      : `🎬 Found ${results.totalFound} movies based on your request`;
  }

  // Predefined quick suggestions
  getQuickSuggestions() {
    return [
      "I want something funny and recent",
      "Show me romantic movies from the 90s",
      "I'm feeling scared, recommend horror",
      "Find action movies with high ratings",
      "Something inspiring and uplifting",
      "Japanese movies that are mysterious",
      "Classic movies from Hollywood",
      "I want to cry, show me sad movies",
      "Exciting adventure films",
      "Bollywood movies that are romantic",
    ];
  }
}

export default new AIMovieBot();
