import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createMockSupabaseClient = () => {
  return {
    auth: {
      signUp: async ({ email, password, options }) => {
        const user = {
          id: "user-" + Date.now(),
          email,
          user_metadata: {
            full_name: options?.data?.full_name || email.split("@")[0],
            avatar_url: `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`,
          },
          created_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
        };

        localStorage.setItem("supabase_user", JSON.stringify(user));
        localStorage.setItem(
          "supabase_session",
          JSON.stringify({
            access_token: "demo-token-" + Date.now(),
            user,
          })
        );

        return { data: { user }, error: null };
      },

      signInWithPassword: async ({ email, password }) => {
        if (password.length < 6) {
          return {
            data: { user: null },
            error: { message: "Password must be at least 6 characters" },
          };
        }

        const user = {
          id: "user-" + Date.now(),
          email,
          user_metadata: {
            full_name: email.split("@")[0],
            avatar_url: `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`,
          },
          created_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        };

        localStorage.setItem("supabase_user", JSON.stringify(user));
        localStorage.setItem(
          "supabase_session",
          JSON.stringify({
            access_token: "demo-token-" + Date.now(),
            user,
          })
        );

        return { data: { user }, error: null };
      },

      signInWithOAuth: async ({ provider, options }) => {
        if (provider === "google") {
          const user = {
            id: "google-user-" + Date.now(),
            email: "user@gmail.com",
            user_metadata: {
              full_name: "Google User",
              avatar_url:
                "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
              provider: "google",
            },
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
          };

          localStorage.setItem("supabase_user", JSON.stringify(user));
          localStorage.setItem(
            "supabase_session",
            JSON.stringify({
              access_token: "google-token-" + Date.now(),
              user,
            })
          );

          return { data: { user }, error: null };
        }

        return {
          data: { user: null },
          error: { message: "Provider not supported" },
        };
      },

      signOut: async () => {
        localStorage.removeItem("supabase_user");
        localStorage.removeItem("supabase_session");
        return { error: null };
      },

      resetPasswordForEmail: async (email, options) => {
        return { error: null };
      },

      updateUser: async ({ data }) => {
        const currentUser = localStorage.getItem("supabase_user");
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const updatedUser = {
            ...user,
            user_metadata: {
              ...user.user_metadata,
              ...data,
            },
          };

          localStorage.setItem("supabase_user", JSON.stringify(updatedUser));
          return { data: { user: updatedUser }, error: null };
        }

        return { data: { user: null }, error: { message: "User not found" } };
      },

      getSession: async () => {
        const session = localStorage.getItem("supabase_session");
        return {
          data: { session: session ? JSON.parse(session) : null },
          error: null,
        };
      },

      getUser: async () => {
        const user = localStorage.getItem("supabase_user");
        return {
          data: { user: user ? JSON.parse(user) : null },
          error: null,
        };
      },

      onAuthStateChange: (callback) => {
        const checkAuth = () => {
          const session = localStorage.getItem("supabase_session");
          const user = localStorage.getItem("supabase_user");

          if (session && user) {
            callback("SIGNED_IN", JSON.parse(session));
          } else {
            callback("SIGNED_OUT", null);
          }
        };

        setTimeout(checkAuth, 100);

        const handleStorageChange = (e) => {
          if (e.key === "supabase_session" || e.key === "supabase_user") {
            checkAuth();
          }
        };

        window.addEventListener("storage", handleStorageChange);

        return {
          data: {
            subscription: {
              unsubscribe: () => {
                window.removeEventListener("storage", handleStorageChange);
              },
            },
          },
        };
      },
    },
  };
};

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockSupabaseClient();

if (supabaseUrl && supabaseAnonKey) {
  console.log("✅ Using real Supabase configuration");
} else {
  console.log("⚠️ Using mock Supabase client for demo purposes");
  console.log(
    "To use real Supabase, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file"
  );
}
