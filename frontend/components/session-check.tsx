"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function SessionCheck() {
  const router = useRouter()
  const pathname = usePathname()

  // Initialize state for auth information
  const [authState, setAuthState] = useState({ user: null, isLoading: true })

  useEffect(() => {
    let mounted = true // Track if the component is mounted

    // Fetch auth state within useEffect to avoid conditional hook call
    try {
      const auth = useAuth()
      if (mounted) {
        setAuthState(auth)
      }
    } catch (error) {
      // Handle the case when auth context is not available
      console.warn("Auth context not available, skipping auth check")
      if (mounted) {
        setAuthState({ user: null, isLoading: false }) // Set isLoading to false to prevent infinite loop
      }
    }

    return () => {
      mounted = false // Set mounted to false when the component unmounts
    }
  }, [])

  const { user, isLoading } = authState

  useEffect(() => {
    // Skip auth checks on auth pages
    if (pathname?.startsWith("/auth/")) {
      return
    }

    // Wait until auth is checked
    if (isLoading) {
      return
    }

    // Check if user is authenticated for protected routes
    const protectedPaths = ["/dashboard", "/journal", "/profile", "/settings"]
    const isProtectedPath = protectedPaths.some((path) => pathname?.startsWith(path))

    if (isProtectedPath && !user) {
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(pathname || "/")}`)
    }
  }, [pathname, router, user, isLoading])

  // Don't render anything, this is just for auth checking
  return null
}
