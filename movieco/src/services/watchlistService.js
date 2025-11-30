import { supabase } from "../config/supabase.js";

class WatchlistService {
  constructor() {
    this.tableName = "watchlist";
  }


  async getUserWatchlist(userId) {
    try {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .order("added_at", { ascending: false });

      if (error) {
        return [];
      }


      return data.map((item) => ({
        ...item.movie_data,
        watchlist_id: item.id,
        added_at: item.added_at,
      }));
    } catch (error) {
      return [];
    }
  }


  async addToWatchlist(userId, movie) {
    try {
      if (!userId) {
        throw new Error("User must be authenticated to add to watchlist");
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: userId,
          movie_id: movie.id,
          movie_data: movie,
        })
        .select()
        .single();

      if (error) {

        if (error.code === "23505") {
          throw new Error("Movie is already in your watchlist");
        }
        throw error;
      }

      return {
        ...movie,
        watchlist_id: data.id,
        added_at: data.added_at,
      };
    } catch (error) {
      throw error;
    }
  }


  async removeFromWatchlist(userId, movieId) {
    try {
      if (!userId) {
        throw new Error("User must be authenticated to remove from watchlist");
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", movieId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }


  async isInWatchlist(userId, movieId) {
    try {
      if (!userId) return false;

      const { data, error } = await supabase
        .from(this.tableName)
        .select("id")
        .eq("user_id", userId)
        .eq("movie_id", movieId)
        .single();

      if (error && error.code !== "PGRST116") {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }


  async getWatchlistCount(userId) {
    try {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (error) {
        return 0;
      }

      return count || 0;
    } catch (error) {
      return 0;
    }
  }


  async clearWatchlist(userId) {
    try {
      if (!userId) {
        throw new Error("User must be authenticated to clear watchlist");
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }


  async getRecentlyAdded(userId, limit = 5) {
    try {
      if (!userId) return [];

      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .order("added_at", { ascending: false })
        .limit(limit);

      if (error) {
        return [];
      }

      return data.map((item) => ({
        ...item.movie_data,
        watchlist_id: item.id,
        added_at: item.added_at,
      }));
    } catch (error) {
      return [];
    }
  }


  async syncLocalWatchlist(userId, localWatchlist) {
    try {
      if (!userId || !localWatchlist.length) return;

      const watchlistItems = localWatchlist.map((movie) => ({
        user_id: userId,
        movie_id: movie.id,
        movie_data: movie,
      }));

      const { error } = await supabase
        .from(this.tableName)
        .upsert(watchlistItems, {
          onConflict: "user_id,movie_id",
          ignoreDuplicates: true,
        });

      if (error) {
        // Error syncing local watchlist
      }
    } catch (error) {
      // Watchlist sync error
    }
  }
}

export default new WatchlistService();
