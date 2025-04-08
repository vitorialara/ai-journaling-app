"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { mockAuth } from "@/lib/mock-auth"

// Debug flag
const DEBUG = true

type User = {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

type Session = {
  user: User
}

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  isMockAuth: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const defaultUser: User = {
    id: "user-1",
    email: "demo@example.com",
    user_metadata: {
      full_name: "Demo User",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=feelora&backgroundColor=b6e3f4&hairColor=2c1b18&facialHairColor=2c1b18&clothingColor=ffd5dc&accessoriesColor=ffd5dc"
    }
  }

  const [user, setUser] = useState<User | null>(defaultUser)
  const [session, setSession] = useState<Session | null>({ user: defaultUser })
  const [isLoading, setIsLoading] = useState(false)
  const [isMockAuth, setIsMockAuth] = useState(true)

  // Initialize auth client once
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (DEBUG) {
          console.log("[AuthContext] Initializing auth with mock auth")
        }

        // Set a cookie to indicate mock auth mode for middleware
        if (typeof window !== "undefined") {
          document.cookie = "mock_auth_enabled=true; path=/; max-age=604800; SameSite=Lax"
        }

        // In mock mode, we'll always have a default user
        setUser(defaultUser)
        setSession({ user: defaultUser })
        setIsLoading(false)
        return null
      } catch (error) {
        console.error("[AuthContext] Error initializing auth:", error)
        return null
      }
    }

    // Initialize auth
    initAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Use mock auth
      if (DEBUG) console.log("[AuthContext] Signing in with mock auth")
      const { error } = await mockAuth.signInWithPassword({ email, password })

      // Set cookie for middleware
      if (!error && typeof window !== "undefined") {
        document.cookie = "mock_auth_enabled=true; path=/; max-age=604800; SameSite=Lax"
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    // For mock auth, just sign in with the credentials
    try {
      if (DEBUG) console.log("[AuthContext] Signing up with mock auth")
      const result = await mockAuth.signInWithPassword({ email, password })

      // Set cookie for middleware
      if (!result.error && typeof window !== "undefined") {
        document.cookie = "mock_auth_enabled=true; path=/; max-age=604800; SameSite=Lax"
      }

      return { data: result.data, error: null }
    } catch (error) {
      return { error, data: null }
    }
  }

  const signOut = async () => {
    if (DEBUG) console.log("[AuthContext] Signing out with mock auth")
    await mockAuth.signOut()

    // Clear mock auth cookie
    if (typeof window !== "undefined") {
      document.cookie = "mock_auth_enabled=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  }

  const signInWithGoogle = async () => {
    if (DEBUG) console.log("[AuthContext] Google sign in with mock auth")
    await mockAuth.signInWithOAuth({ provider: "google" })

    // Set cookie for middleware
    if (typeof window !== "undefined") {
      document.cookie = "mock_auth_enabled=true; path=/; max-age=604800; SameSite=Lax"
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    isMockAuth: true,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
