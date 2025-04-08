// Mock authentication service for preview environments
import { v4 as uuidv4 } from "uuid"

// Debug flag
const DEBUG = true

// Types
interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

interface Session {
  user: User
  expires_at: number // Unix timestamp
}

interface AuthState {
  user: User | null
  session: Session | null
}

// Mock user database
const MOCK_USERS = [
  {
    email: "demo@example.com",
    password: "password123",
    name: "Demo User",
  },
  {
    email: "test@example.com",
    password: "test123",
    name: "Test User",
  },
]

// Storage keys
const AUTH_STATE_KEY = "feel-write_mock_auth_state"

// Helper functions
const saveAuthState = (state: AuthState) => {
  if (typeof window === "undefined") return
  if (DEBUG) console.log("[MockAuth] Saving auth state:", state)
  localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state))

  // Also set a cookie for the middleware
  document.cookie = "mock_auth_enabled=true; path=/; max-age=604800; SameSite=Lax"
}

const loadAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, session: null }
  }

  try {
    const state = localStorage.getItem(AUTH_STATE_KEY)
    if (!state) return { user: null, session: null }

    const parsedState = JSON.parse(state) as AuthState

    if (DEBUG) console.log("[MockAuth] Loaded auth state:", parsedState)

    // Check if session is expired
    if (parsedState.session && parsedState.session.expires_at < Date.now() / 1000) {
      if (DEBUG) console.log("[MockAuth] Session expired")
      // Session expired, clear it
      localStorage.removeItem(AUTH_STATE_KEY)
      document.cookie = "mock_auth_enabled=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      return { user: null, session: null }
    }

    return parsedState
  } catch (error) {
    console.error("[MockAuth] Error loading auth state:", error)
    return { user: null, session: null }
  }
}

// Mock auth API
export const mockAuth = {
  // Sign in with email and password
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    if (DEBUG) console.log("[MockAuth] Signing in with:", email)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Find user
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      if (DEBUG) console.log("[MockAuth] Invalid credentials")
      return {
        data: { user: null, session: null },
        error: new Error("Invalid email or password"),
      }
    }

    // Create session
    const mockUser: User = {
      id: uuidv4(),
      email: user.email,
      user_metadata: {
        full_name: user.name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
      },
    }

    const mockSession: Session = {
      user: mockUser,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    }

    // Save to localStorage
    saveAuthState({ user: mockUser, session: mockSession })

    if (DEBUG) console.log("[MockAuth] Sign in successful")

    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    }
  },

  // Sign out
  signOut: async () => {
    if (DEBUG) console.log("[MockAuth] Signing out")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Clear auth state
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STATE_KEY)
      document.cookie = "mock_auth_enabled=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }

    return { error: null }
  },

  // Get current session
  getSession: async () => {
    if (DEBUG) console.log("[MockAuth] Getting session")

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const state = loadAuthState()

    return {
      data: { session: state.session },
      error: null,
    }
  },

  // Sign in with OAuth (mock)
  signInWithOAuth: async ({ provider }: { provider: string }) => {
    if (DEBUG) console.log("[MockAuth] OAuth sign in with:", provider)

    // In a real implementation, this would redirect to the OAuth provider
    // For our mock, we'll just simulate a successful sign-in with a demo account

    // Create session
    const mockUser: User = {
      id: uuidv4(),
      email: "oauth@example.com",
      user_metadata: {
        full_name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      },
    }

    const mockSession: Session = {
      user: mockUser,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    }

    // Save to localStorage
    saveAuthState({ user: mockUser, session: mockSession })

    // In a real implementation, this would redirect to the OAuth provider
    // For our mock, we'll just return the session
    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    }
  },

  // Auth state change listener
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    if (DEBUG) console.log("[MockAuth] Setting up auth state change listener")

    // Initial call with current state
    const state = loadAuthState()
    if (state.session) {
      callback("SIGNED_IN", state.session)
    } else {
      callback("SIGNED_OUT", null)
    }

    // Set up storage event listener to detect changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_STATE_KEY) {
        const newState = event.newValue ? (JSON.parse(event.newValue) as AuthState) : { user: null, session: null }
        if (newState.session) {
          callback("SIGNED_IN", newState.session)
        } else {
          callback("SIGNED_OUT", null)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            if (DEBUG) console.log("[MockAuth] Unsubscribing from auth state changes")
            window.removeEventListener("storage", handleStorageChange)
          },
        },
      },
    }
  },
}

// Helper to determine if we should use mock auth
export const shouldUseMockAuth = () => {
  // Use mock auth in preview environments or when explicitly enabled
  if (typeof window === "undefined") return false

  // Check if we're in a preview environment
  const isPreview =
    window.location.hostname.includes("vercel.app") ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    localStorage.getItem("use_mock_auth") === "true" ||
    document.cookie.includes("mock_auth_enabled=true")

  if (DEBUG) console.log("[MockAuth] Should use mock auth:", isPreview)
  return isPreview
}

// Function to toggle mock auth
export const toggleMockAuth = (useMock: boolean) => {
  if (typeof window === "undefined") return
  if (DEBUG) console.log("[MockAuth] Toggling mock auth:", useMock)
  localStorage.setItem("use_mock_auth", useMock ? "true" : "false")

  // Also set or clear the cookie
  if (useMock) {
    document.cookie = "mock_auth_enabled=true; path=/; max-age=604800; SameSite=Lax"
  } else {
    document.cookie = "mock_auth_enabled=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  // Reload to apply changes
  window.location.reload()
}

