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

      if (session?.user) {
        this.user = this.formatUser(session.user);
        this.isAuthenticated = true;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          this.user = this.formatUser(session.user);
          this.isAuthenticated = true;
        } else if (event === "SIGNED_OUT") {
          this.user = null;
          this.isAuthenticated = false;
        }

        this.notifyListeners();
      });

      this.authSubscription = subscription;
      this.notifyListeners();
    } catch (error) {
      console.error("Error initializing authentication:", error);
    }
  }

  formatUser(supabaseUser) {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.email?.split("@")[0] ||
        "User",
      picture:
        supabaseUser.user_metadata?.avatar_url ||
        `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`,
      verified: supabaseUser.email_confirmed_at ? true : false,
      provider: supabaseUser.user_metadata?.provider || "email",
      createdAt: supabaseUser.created_at,
      lastSignIn: supabaseUser.last_sign_in_at,
    };
  }
}
