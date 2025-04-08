import { NextResponse } from "next/server"
import { resetRedirectCount, addTimestamp } from "@/lib/auth-utils"

// Debug flag
const DEBUG = true

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get("next") || "/dashboard"
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  if (DEBUG) {
    console.log("[Auth Callback] Next URL:", next)
    console.log("[Auth Callback] Error:", error || "none")
    console.log("[Auth Callback] Error description:", errorDescription || "none")
  }

  // Handle error from OAuth provider
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription)
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(errorDescription || error)}`, request.url),
    )
  }

  // Reset redirect count and add timestamp
  const redirectUrl = new URL(next, request.url)
  const resetUrl = resetRedirectCount(redirectUrl)
  const timestampedUrl = addTimestamp(resetUrl)

  // Set a cookie to indicate mock auth mode
  const response = NextResponse.redirect(timestampedUrl)
  response.cookies.set("mock_auth_enabled", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  })

  if (DEBUG) {
    console.log("[Auth Callback] Redirecting to:", timestampedUrl.toString())
  }

  return response
}

