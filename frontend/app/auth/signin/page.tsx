"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader } from "@/app/components/page-header"
import { Logo } from "@/app/components/logo"
import { useAuth } from "@/contexts/auth-context"
import { toggleMockAuth } from "@/lib/mock-auth"
import { AlertCircle, Loader2, Info, Settings } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Debug flag
const DEBUG = true

// Set this to true to enable Google auth
const ENABLE_GOOGLE_AUTH = true

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  const errorMessage = searchParams?.get("error")

  const [email, setEmail] = useState("demo@example.com") // Default for easy testing
  const [password, setPassword] = useState("password123") // Default for easy testing
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(errorMessage || "")
  const [detailedError, setDetailedError] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online")
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  const { signIn, isLoading: isAuthLoading, user, isMockAuth, signInWithGoogle } = useAuth()

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus("online")
    const handleOffline = () => setNetworkStatus("offline")

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial status
    setNetworkStatus(navigator.onLine ? "online" : "offline")

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (DEBUG) console.log("[SignIn] User already logged in, redirecting to:", callbackUrl)
      router.replace(callbackUrl)
    }
  }, [user, router, callbackUrl])

  // Handle mock auth toggle
  const handleMockAuthChange = (checked: boolean) => {
    if (DEBUG) console.log("[SignIn] Toggling mock auth:", checked)
    toggleMockAuth(checked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (networkStatus === "offline") {
      setError("You appear to be offline. Please check your internet connection and try again.")
      return
    }

    setIsLoading(true)
    setError("")
    setDetailedError(null)

    try {
      if (DEBUG) {
        console.log("[SignIn] Signing in with email/password:", email)
      }

      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        if (DEBUG) {
          console.log("[SignIn] Sign in error:", signInError.message)
        }

        setError(signInError.message || "Invalid email or password")
        setIsLoading(false)
        return
      }

      if (DEBUG) {
        console.log(`[SignIn] Sign in successful`)
        console.log(`[SignIn] Redirecting to: ${callbackUrl}`)
      }

      // Add a timestamp to prevent caching issues
      const timestamp = Date.now()
      router.replace(`${callbackUrl}?t=${timestamp}`)
    } catch (error: any) {
      console.error("[SignIn] Error during sign in:", error)

      // Provide more specific error message for network issues
      if (error.message?.includes("fetch") || error.name === "TypeError") {
        setError(
          "Network error: Unable to connect to authentication service. Please check your internet connection and try again.",
        )
      } else {
        setError("An error occurred. Please try again.")
      }

      setDetailedError(`Sign-in error: ${error instanceof Error ? error.message : String(error)}`)
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin mb-4" />
          <p className="text-purple-700">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4">
      <div className="max-w-md mx-auto pt-12 flex flex-col items-center">
        <Logo className="w-24 h-24 mb-6" animated={true} variant="standard" />
        <PageHeader title="Welcome Back" subtitle="Sign in to continue your journey" />

        {isMockAuth && (
          <Alert className="mb-4 mt-4 bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Preview Mode</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Using mock authentication for preview. Use demo@example.com / password123 to sign in.
            </AlertDescription>
          </Alert>
        )}

        {/* Network status warning */}
        {networkStatus === "offline" && (
          <Alert variant="destructive" className="mb-4 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You're offline</AlertTitle>
            <AlertDescription>Please check your internet connection and try again.</AlertDescription>
          </Alert>
        )}

        {error && (
          <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {detailedError && (
          <div className="w-full mt-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-xs flex items-start">
            <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>Technical details: {detailedError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-white"
            />
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-purple-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Advanced options toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-xs text-purple-600 hover:underline flex items-center"
            >
              <Settings className="h-3 w-3 mr-1" />
              {showAdvancedOptions ? "Hide advanced options" : "Show advanced options"}
            </button>
          </div>

          {/* Advanced options */}
          {showAdvancedOptions && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <Checkbox id="use-mock-auth" checked={isMockAuth} onCheckedChange={handleMockAuthChange} />
                <Label htmlFor="use-mock-auth" className="text-sm">
                  Use mock authentication (for preview)
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This option uses a client-side mock authentication system instead of connecting to Supabase. Use
                demo@example.com / password123 to sign in.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-6 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
            disabled={isLoading || networkStatus === "offline"}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {ENABLE_GOOGLE_AUTH && (
          <>
            <div className="mt-6 w-full flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200"></div>
              <p className="text-sm text-gray-500">or</p>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                try {
                  signInWithGoogle()
                } catch (error) {
                  console.error("Error with Google sign in:", error)
                  setError("Failed to initialize Google sign in")
                }
              }}
              className="w-full mt-6 py-6 rounded-xl border border-gray-200 text-gray-600 hover:bg-white hover:text-purple-600 transition-all duration-300"
              disabled={isLoading || networkStatus === "offline"}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </>
        )}

        <p className="mt-8 text-sm text-center text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-purple-600 hover:underline">
            Sign up
          </Link>
        </p>

        {/* Add a direct link to the diagnostic endpoint */}
        <div className="mt-4 text-xs text-center text-gray-400">
          <Link href="/api/debug/supabase?debug_key=feel-write_debug_2023" target="_blank" className="hover:underline">
            Check Supabase Connection
          </Link>
        </div>
      </div>
    </div>
  )
}

