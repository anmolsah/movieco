import { supabase } from '../config/supabase.js';

class WatchlistService {
  constructor() {
    this.tableName = 'watchlist';
  }

  // Get user's watchlist from Supabase
  async getUserWatchlist(userId) {
    try {
      if (!userId) {
        console.warn('No user ID provided for watchlist fetch');
        return [];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching watchlist:', error);
        return [];
      }

      // Return the movie data from each watchlist item
      return data.map(item => ({
        ...item.movie_data,
        watchlist_id: item.id,
        added_at: item.added_at
      }));
    } catch (error) {
      console.error('Watchlist fetch error:', error);
      return [];
    }
  }

  // Add movie to user's watchlist
  async addToWatchlist(userId, movie) {
    try {
      if (!userId) {
        throw new Error('User must be authenticated to add to watchlist');
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: userId,
          movie_id: movie.id,
          movie_data: movie
        })
        .select()
        .single();

      if (error) {
        // Handle duplicate entry error
        if (error.code === '23505') {
          throw new Error('Movie is already in your watchlist');
        }
        throw error;
      }

      return {
        ...movie,
        watchlist_id: data.id,
        added_at: data.added_at
      };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  // Remove movie from user's watchlist
  async removeFromWatchlist(userId, movieId) {
    try {
      if (!userId) {
        throw new Error('User must be authenticated to remove from watchlist');
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId)
        .eq('movie_id', movieId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  // Check if movie is in user's watchlist
  async isInWatchlist(userId, movieId) {
    try {
      if (!userId) return false;

      const { data, error } = await supabase
        .from(this.tableName)
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking watchlist:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Watchlist check error:', error);
      return false;
    }
  }

  // Get watchlist count for user
  async getWatchlistCount(userId) {
    try {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting watchlist count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Watchlist count error:', error);
      return 0;
    }
  }

  // Clear user's entire watchlist
  async clearWatchlist(userId) {
    try {
      if (!userId) {
        throw new Error('User must be authenticated to clear watchlist');
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw error;
    }
  }

  // Get recently added movies to watchlist
  async getRecentlyAdded(userId, limit = 5) {
    try {
      if (!userId) return [];

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recently added:', error);
        return [];
      }

      return data.map(item => ({
        ...item.movie_data,
        watchlist_id: item.id,
        added_at: item.added_at
      }));
    } catch (error) {
      console.error('Recently added fetch error:', error);
      return [];
    }
  }

  // Sync local watchlist with Supabase (for migration)
  async syncLocalWatchlist(userId, localWatchlist) {
    try {
      if (!userId || !localWatchlist.length) return;

      const watchlistItems = localWatchlist.map(movie => ({
        user_id: userId,
        movie_id: movie.id,
        movie_data: movie
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(watchlistItems, {
          onConflict: 'user_id,movie_id',
          ignoreDuplicates: true
        });

      if (error) {
        console.error('Error syncing local watchlist:', error);
      } else {
        console.log('Local watchlist synced successfully');
      }
    } catch (error) {
      console.error('Watchlist sync error:', error);
    }
  }
}

export default new WatchlistService();