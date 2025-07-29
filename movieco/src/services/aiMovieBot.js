import { GEMINI_API_KEY, GEMINI_API_URL } from '../config/api.js';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/api.js';

class AIMovieBot {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;

    // Genre mapping for better understanding
    this.genreMap = {
      'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35,
      'crime': 80, 'documentary': 99, 'drama': 18, 'family': 10751,
      'fantasy': 14, 'history': 36, 'horror': 27, 'music': 10402,
      'mystery': 9648, 'romance': 10749, 'romantic': 10749, 
      'science fiction': 878, 'sci-fi': 878, 'thriller': 53,
      'war': 10752, 'western': 37, 'tv movie': 10770
    };

    // Mood to genre mapping
    this.moodToGenres = {
      'happy': [35, 10751, 16],  // Comedy, Family, Animation
      'sad': [18, 10749],        // Drama, Romance
      'excited': [28, 12, 53],   // Action, Adventure, Thriller
      'scared': [27, 53],        // Horror, Thriller
      'romantic': [10749, 35],   // Romance, Comedy
      'adventurous': [12, 14, 878], // Adventure, Fantasy, Sci-Fi
      'nostalgic': [36, 18],     // History, Drama
      'funny': [35, 16],         // Comedy, Animation
      'intense': [53, 80, 27],   // Thriller, Crime, Horror
      'relaxed': [10751, 99],    // Family, Documentary
      'inspiring': [18, 36, 10751], // Drama, History, Family
      'mysterious': [9648, 53, 80] // Mystery, Thriller, Crime
    };

    // Country codes mapping
    this.countryMap = {
      'usa': 'US', 'america': 'US', 'united states': 'US',
      'uk': 'GB', 'britain': 'GB', 'england': 'GB', 'united kingdom': 'GB',
      'france': 'FR', 'germany': 'DE', 'italy': 'IT', 'spain': 'ES',
      'japan': 'JP', 'korea': 'KR', 'south korea': 'KR', 'china': 'CN',
      'india': 'IN', 'bollywood': 'IN', 'russia': 'RU', 'canada': 'CA',
      'australia': 'AU', 'brazil': 'BR', 'mexico': 'MX', 'argentina': 'AR'
    };

    // Time period keywords
    this.timePeriods = {
      'recent': { from: new Date().getFullYear() - 2, to: new Date().getFullYear() },
      'new': { from: new Date().getFullYear() - 1, to: new Date().getFullYear() },
      'classic': { from: 1950, to: 1990 },
      'retro': { from: 1950, to: 1990 }, // Added retro
      'old': { from: 1900, to: 1980 },
      '90s': { from: 1990, to: 1999 },
      '2000s': { from: 2000, to: 2009 },
      '2010s': { from: 2010, to: 2019 },
      '2020s': { from: 2020, to: new Date().getFullYear() }
    };

    // TMDB region codes for countries
    this.tmdbRegionMap = {
      'US': 'US', 'GB': 'GB', 'FR': 'FR', 'DE': 'DE', 'IT': 'IT', 'ES': 'ES',
      'JP': 'JP', 'KR': 'KR', 'CN': 'CN', 'IN': 'IN', 'RU': 'RU', 'CA': 'CA',
      'AU': 'AU', 'BR': 'BR', 'MX': 'MX', 'AR': 'AR'
    };
  }

  // Main analysis of user input
  async analyzeUserInput(input) {
    try {
      const analysis = {
        genres: [],
        moods: [],
        countries: [],
        timePeriod: null,
        rating: null,
        keywords: [],
        originalInput: input.toLowerCase()
      };

      const geminiAnalysis = await this.analyzeWithGemini(input);
      
      analysis.genres = this.extractGenres(input);
      analysis.moods = this.extractMoods(input, geminiAnalysis);
      analysis.countries = this.extractCountries(input);
      analysis.timePeriod = this.extractTimePeriod(input);
      analysis.rating = this.extractRating(input);
      analysis.keywords = this.extractKeywords(input);

      return analysis;
    } catch (error) {
      console.error('Error analyzing user input:', error);
      return this.fallbackAnalysis(input);
    }
  }

  // Call Gemini AI (fallback if fails)
  async analyzeWithGemini(text) {
    try {
      const prompt = `
        Analyze this movie request and extract detailed information in JSON format:
        "${text}"
        
        Extract the following information:
        1. genres: Array of genre names (action, comedy, drama, horror, romance, thriller, mystery, sci-fi, fantasy, animation, documentary, etc.)
        2. countries: Array of country names or regions (USA, India, Japan, Korea, France, etc.)
        3. timeperiod: Object with from/to years if mentioned (e.g., {"from": 1980, "to": 1990} for 80s movies)
        4. emotions: Array of emotions/moods (happy, sad, romantic, scary, exciting, nostalgic, etc.)
        5. keywords: Array of important keywords or themes
        6. rating: Minimum rating preference if mentioned (e.g., 7.0 for "good movies")
        7. language: Preferred language if mentioned (en, hi, ja, ko, etc.)
        
        Example for "retro comedy romance movies india":
        {
          "genres": ["comedy", "romance"],
          "countries": ["India"],
          "timeperiod": {"from": 1950, "to": 1990},
          "emotions": ["happy", "romantic"],
          "keywords": ["retro", "bollywood"],
          "rating": null,
          "language": "hi"
        }
        
        Return only valid JSON without any additional text.
      `;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (generatedText) {
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn('Failed to parse Gemini JSON response:', parseError);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return null;
    }
  }

  // Enhanced analysis using Gemini insights
  async enhancedAnalyzeUserInput(input) {
    try {
      const geminiAnalysis = await this.analyzeWithGemini(input);
      const basicAnalysis = await this.analyzeUserInput(input);
      
      if (geminiAnalysis) {
        // Merge Gemini insights with basic analysis
        return {
          ...basicAnalysis,
          geminiGenres: geminiAnalysis.genres || [],
          geminiCountries: geminiAnalysis.countries || [],
          geminiTimeperiod: geminiAnalysis.timeperiod || null,
          geminiEmotions: geminiAnalysis.emotions || [],
          geminiKeywords: geminiAnalysis.keywords || [],
          geminiRating: geminiAnalysis.rating || null,
          geminiLanguage: geminiAnalysis.language || null
        };
      }
      
      return basicAnalysis;
    } catch (error) {
      console.error('Enhanced analysis error:', error);
      return await this.analyzeUserInput(input);
    }
  }

  // Convert genre names to TMDB genre IDs
  mapGenreNamesToIds(genreNames) {
    const genreNameToId = {
      'action': 28, 'adventure': 12, 'animation': 16, 'comedy': 35,
      'crime': 80, 'documentary': 99, 'drama': 18, 'family': 10751,
      'fantasy': 14, 'history': 36, 'horror': 27, 'music': 10402,
      'mystery': 9648, 'romance': 10749, 'science fiction': 878, 'sci-fi': 878,
      'thriller': 53, 'war': 10752, 'western': 37
    };
    
    return genreNames
      .map(name => genreNameToId[name.toLowerCase()])
      .filter(id => id !== undefined);
  }

  // Convert country names to TMDB region codes
  mapCountryNamesToCodes(countryNames) {
    const countryNameToCode = {
      'usa': 'US', 'america': 'US', 'united states': 'US',
      'uk': 'GB', 'britain': 'GB', 'england': 'GB', 'united kingdom': 'GB',
      'india': 'IN', 'bollywood': 'IN',
      'japan': 'JP', 'korea': 'KR', 'south korea': 'KR',
      'china': 'CN', 'france': 'FR', 'germany': 'DE',
      'italy': 'IT', 'spain': 'ES', 'russia': 'RU',
      'canada': 'CA', 'australia': 'AU', 'brazil': 'BR'
    };
    
    return countryNames
      .map(name => countryNameToCode[name.toLowerCase()])
      .filter(code => code !== undefined);
  }

  // Fetch movies from TMDB based on analysis
  async fetchMoviesFromTMDB(analysis) {
    try {
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}`;
      const params = new URLSearchParams();
      
      // Add genre filters
      const allGenres = [...analysis.genres];
      if (analysis.geminiGenres) {
        const geminiGenreIds = this.mapGenreNamesToIds(analysis.geminiGenres);
        allGenres.push(...geminiGenreIds);
      }
      if (analysis.moods.length > 0) {
        const moodGenres = analysis.moods.flatMap(mood => this.moodToGenres[mood] || []);
        allGenres.push(...moodGenres);
      }
      
      if (allGenres.length > 0) {
        const uniqueGenres = [...new Set(allGenres)];
        params.append('with_genres', uniqueGenres.join(','));
      }
      
      // Add country/region filters
      const allCountries = [...analysis.countries];
      if (analysis.geminiCountries) {
        const geminiCountryCodes = this.mapCountryNamesToCodes(analysis.geminiCountries);
        allCountries.push(...geminiCountryCodes);
      }
      
      if (allCountries.length > 0) {
        const uniqueCountries = [...new Set(allCountries)];
        params.append('with_origin_country', uniqueCountries.join(','));
      }
      
      // Add language filter
      if (analysis.geminiLanguage) {
        params.append('with_original_language', analysis.geminiLanguage);
      }
      
      // Add time period filter
      const timePeriod = analysis.timePeriod || analysis.geminiTimeperiod;
      if (timePeriod) {
        if (timePeriod.from) {
          params.append('primary_release_date.gte', `${timePeriod.from}-01-01`);
        }
        if (timePeriod.to) {
          params.append('primary_release_date.lte', `${timePeriod.to}-12-31`);
        }
      }
      
      // Add rating filter
      const minRating = analysis.rating?.min || analysis.geminiRating;
      if (minRating) {
        params.append('vote_average.gte', minRating.toString());
      }
      
      // Add sorting
      params.append('sort_by', 'popularity.desc');
      params.append('page', '1');
      
      // Make the API call
      const finalUrl = `${url}&${params.toString()}`;
      console.log('TMDB API URL:', finalUrl);
      
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('TMDB API Response:', data);
      
      return data.results || [];
    } catch (error) {
      console.error('TMDB fetch error:', error);
      return [];
    }
  }

  // Genre extraction (supports multiple genres)
  extractGenres(input) {
    const genres = [];
    const lowerInput = input.toLowerCase();
    
    Object.entries(this.genreMap).forEach(([genre, id]) => {
      if (lowerInput.includes(genre)) genres.push(id);
    });

    return [...new Set(genres)];
  }

  // Mood extraction
  extractMoods(input, geminiAnalysis) {
    const moods = [];
    const lowerInput = input.toLowerCase();

    Object.keys(this.moodToGenres).forEach(mood => {
      if (lowerInput.includes(mood)) moods.push(mood);
    });

    if (geminiAnalysis?.emotions) {
      const emotions = Array.isArray(geminiAnalysis.emotions) 
        ? geminiAnalysis.emotions 
        : [geminiAnalysis.emotions];
      
      const emotionToMood = {
        'joy': 'happy', 'happiness': 'happy',
        'sadness': 'sad', 'sad': 'sad',
        'anger': 'intense', 'angry': 'intense',
        'fear': 'scared', 'scared': 'scared',
        'surprise': 'excited', 'excited': 'excited',
        'love': 'romantic', 'romantic': 'romantic'
      };
      
      emotions.forEach(emotion => {
        const emotionLower = emotion.toLowerCase();
        if (emotionToMood[emotionLower]) moods.push(emotionToMood[emotionLower]);
      });
    }

    return [...new Set(moods)];
  }

  // Country extraction
  extractCountries(input) {
    const countries = [];
    const lowerInput = input.toLowerCase();

    Object.entries(this.countryMap).forEach(([country, code]) => {
      if (lowerInput.includes(country)) countries.push(code);
    });

    return [...new Set(countries)];
  }

  // Time period extraction
  extractTimePeriod(input) {
    const lowerInput = input.toLowerCase();
    for (const [period, range] of Object.entries(this.timePeriods)) {
      if (lowerInput.includes(period)) return range;
    }

    const yearMatch = input.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      const year = parseInt(yearMatch[0]);
      return { from: year, to: year };
    }

    return null;
  }

  // Rating extraction
  extractRating(input) {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('highly rated') || lowerInput.includes('best') || lowerInput.includes('top rated')) return { min: 8.0 };
    if (lowerInput.includes('good') || lowerInput.includes('decent')) return { min: 7.0 };

    const ratingMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:stars?|\/10|rating)/i);
    if (ratingMatch) return { min: parseFloat(ratingMatch[1]) };
    return null;
  }

  // Keyword extraction
  extractKeywords(input) {
    const commonWords = ['movie', 'film', 'show', 'watch', 'want', 'like', 'good', 'best', 'top', 'find', 'recommend', 'suggest'];
    return input.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));
  }

  fallbackAnalysis(input) {
    return {
      genres: this.extractGenres(input),
      moods: [],
      countries: this.extractCountries(input),
      timePeriod: this.extractTimePeriod(input),
      rating: this.extractRating(input),
      keywords: this.extractKeywords(input),
      originalInput: input.toLowerCase()
    };
  }

  // Helper to check time period
  inTimePeriod(releaseDate, timePeriod) {
    if (!releaseDate) return false;
    const year = new Date(releaseDate).getFullYear();
    return year >= timePeriod.from && year <= timePeriod.to;
  }

  // Filter movies based on analysis
  async findMovies(analysis, moviePool = []) {
    try {
      console.log('Finding movies with analysis:', analysis);
      
      // Use enhanced analysis with Gemini
      const enhancedAnalysis = await this.enhancedAnalyzeUserInput(analysis.originalInput);
      console.log('Enhanced analysis:', enhancedAnalysis);
      
      // Fetch movies from TMDB based on analysis
      const tmdbMovies = await this.fetchMoviesFromTMDB(enhancedAnalysis);
      console.log('TMDB movies found:', tmdbMovies.length);
      
      if (tmdbMovies.length > 0) {
        // Use TMDB results
        return {
          movies: tmdbMovies.slice(0, 20),
          analysis: enhancedAnalysis,
          totalFound: tmdbMovies.length,
          source: 'TMDB API'
        };
      } else {
        // Fallback to moviePool filtering if TMDB returns no results
        console.log('No TMDB results, falling back to moviePool filtering');
        const filteredMovies = this.filterMoviePool(enhancedAnalysis, moviePool);
        
        return {
          movies: filteredMovies.slice(0, 20),
          analysis: enhancedAnalysis,
          totalFound: filteredMovies.length,
          source: 'Local filtering'
        };
      }
    } catch (error) {
      console.error('Error in findMovies:', error);
      
      // Final fallback
      return {
        movies: moviePool.slice(0, 10),
        analysis,
        totalFound: moviePool.length,
        source: 'Fallback'
      };
    }
  }

  // Fallback filtering for moviePool
  filterMoviePool(analysis, moviePool) {
    let filteredMovies = [...moviePool];

    // Apply filters similar to before but with enhanced analysis
    const allGenres = [...analysis.genres];
    if (analysis.geminiGenres) {
      const geminiGenreIds = this.mapGenreNamesToIds(analysis.geminiGenres);
      allGenres.push(...geminiGenreIds);
    }
    
    if (allGenres.length > 0) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.genre_ids && movie.genre_ids.some(id => allGenres.includes(id))
      );
    }

    // Apply other filters...
    const allCountries = [...analysis.countries];
    if (analysis.geminiCountries) {
      const geminiCountryCodes = this.mapCountryNamesToCodes(analysis.geminiCountries);
      allCountries.push(...geminiCountryCodes);
    }
    
    if (allCountries.length > 0) {
      filteredMovies = filteredMovies.filter(movie => this.countryMatch(movie, allCountries));
    }

    // Sort by relevance
    filteredMovies.sort((a, b) => ((b.popularity * 0.3) + (b.vote_average * 0.7)) - ((a.popularity * 0.3) + (a.vote_average * 0.7)));

    return {
      movies: filteredMovies,
      analysis,
      totalFound: filteredMovies.length
    };
  }

  // Check if movie matches country
  countryMatch(movie, countries) {
    const countryToLanguage = { 'JP': 'ja', 'KR': 'ko', 'CN': 'zh', 'IN': 'hi' };
    const langMatch = countries.some(c => movie.original_language === countryToLanguage[c]);
    const prodMatch = movie.production_countries?.some(pc => countries.includes(pc.iso_3166_1));
    return langMatch || prodMatch;
  }

  // Explanation for results
  generateExplanation(analysis, results) {
    const explanations = [];
    
    // Include Gemini-detected genres
    const allGenres = [...analysis.genres];
    if (analysis.geminiGenres) {
      allGenres.push(...analysis.geminiGenres.map(name => name.charAt(0).toUpperCase() + name.slice(1)));
    }
    if (allGenres.length > 0) {
      explanations.push(`${allGenres.join(', ')} movies`);
    }
    
    // Include Gemini-detected countries
    const allCountries = [...analysis.countries];
    if (analysis.geminiCountries) {
      allCountries.push(...analysis.geminiCountries);
    }
    if (allCountries.length > 0) {
      explanations.push(`from ${allCountries.join(', ')}`);
    }
    
    // Include time period
    const timePeriod = analysis.timePeriod || analysis.geminiTimeperiod;
    if (timePeriod) {
      if (timePeriod.from === timePeriod.to) {
        explanations.push(`from ${timePeriod.from}`);
      } else {
        explanations.push(`from ${timePeriod.from}-${timePeriod.to}`);
      }
    }
    
    // Include moods and emotions
    const allEmotions = [...analysis.moods];
    if (analysis.geminiEmotions) {
      allEmotions.push(...analysis.geminiEmotions);
    }
    if (allEmotions.length > 0) {
      explanations.push(`matching ${allEmotions.join(', ')} mood`);
    }

    const baseMessage = explanations.length > 0 
      ? `🎬 ${explanations.join(' • ')}`
      : `🎬 Based on your request`;
      
    const sourceInfo = results.source ? ` (via ${results.source})` : '';
    
    return `${baseMessage} • Found ${results.totalFound} movies${sourceInfo}`;
  }

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
      "Bollywood movies that are romantic"
    ];
  }
}

export default new AIMovieBot();
