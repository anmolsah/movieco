import { supabase } from '../config/supabase.js'

class AuthService {
  constructor() {
    this.user = null
    this.isAuthenticated = false
    this.listeners = []
    this.authSubscription = null
    
    // Initialize auth state
    this.initializeAuth()
  }

  async initializeAuth() {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        this.user = this.formatUser(session.user)
        this.isAuthenticated = true
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            this.user = this.formatUser(session.user)
            this.isAuthenticated = true
          } else if (event === 'SIGNED_OUT') {
            this.user = null
            this.isAuthenticated = false
          }
          
          this.notifyListeners()
        }
      )
      
      this.authSubscription = subscription
      this.notifyListeners()
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
  }

  formatUser(supabaseUser) {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      picture: supabaseUser.user_metadata?.avatar_url || `https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1`,
      verified: supabaseUser.email_confirmed_at ? true : false,
      provider: supabaseUser.user_metadata?.provider || 'email',
      createdAt: supabaseUser.created_at,
      lastSignIn: supabaseUser.last_sign_in_at
    }
  }

  async signUp(email, password, fullName = '') {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0]
          }
        }
      })

      if (error) throw error

      return { user: data.user ? this.formatUser(data.user) : null, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error.message }
    }
  }

  async signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: data.user ? this.formatUser(data.user) : null, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error.message }
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) throw error

      return { user: null, error: null } // OAuth redirects, so no immediate user
    } catch (error) {
      console.error('Google sign in error:', error)
      return { user: null, error: error.message }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      this.user = null
      this.isAuthenticated = false
      this.notifyListeners()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: error.message }
    }
  }

  async updateProfile(updates) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          ...updates
        }
      })

      if (error) throw error

      if (data.user) {
        this.user = this.formatUser(data.user)
        this.notifyListeners()
      }

      return { user: this.user, error: null }
    } catch (error) {
      console.error('Profile update error:', error)
      return { user: null, error: error.message }
    }
  }

  getCurrentUser() {
    return this.user
  }

  isUserAuthenticated() {
    return this.isAuthenticated
  }

  // Preferences management (stored in localStorage for demo)
  getUserPreferences() {
    const userId = this.user?.id
    if (!userId) return this.getDefaultPreferences()

    const preferences = localStorage.getItem(`userPreferences_${userId}`)
    return preferences ? JSON.parse(preferences) : this.getDefaultPreferences()
  }

  getDefaultPreferences() {
    return {
      favoriteGenres: [],
      preferredLanguage: 'en',
      adultContent: false,
      notifications: {
        newReleases: true,
        recommendations: true,
        watchlistUpdates: true,
      },
      privacy: {
        profileVisibility: 'private',
        shareWatchlist: false,
      }
    }
  }

  async updateUserPreferences(preferences) {
    try {
      const userId = this.user?.id
      if (!userId) throw new Error('User not authenticated')

      localStorage.setItem(`userPreferences_${userId}`, JSON.stringify(preferences))
      this.notifyListeners()
      return preferences
    } catch (error) {
      console.error('Preferences update error:', error)
      throw error
    }
  }

  // Event listeners for auth state changes
  onAuthStateChanged(callback) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.user, this.isAuthenticated)
      } catch (error) {
        console.error('Auth listener error:', error)
      }
    })
  }

  // Cleanup
  destroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe()
    }
    this.listeners = []
  }
}

export default new AuthService()