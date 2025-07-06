import { supabase } from "../config/supabase.js";

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.listeners = [];
    this.authSubscription = null;

    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
    } catch (error) {}
  }
}
