import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isInRedirectLoop, incrementRedirectCount, resetRedirectCount, addTimestamp } from "./lib/auth-utils"

// Debug flag
const DEBUG = true

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.includes("favicon") ||
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname === "/auth/callback"
  ) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()

  // Check if we're in a redirect loop
  if (isInRedirectLoop(url)) {
    if (DEBUG) console.log("[Middleware] Redirect loop detected, breaking the loop")
    // Break the loop by allowing the request to proceed
    const resetUrl = resetRedirectCount(url)
    return NextResponse.next()
  }

  // Check if the path is protected
  const protectedPaths = ["/dashboard", "/journal", "/profile", "/settings"]
  const isProtectedPath = protectedPaths.some((path) => url.pathname.startsWith(path))

  // Auth paths that should redirect to dashboard if user is already logged in
  const authPaths = ["/auth/signin", "/auth/signup"]
  const isAuthPath = authPaths.some((path) => url.pathname === path)

  // If not a protected or auth path, skip middleware
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next()
  }

  // Check for mock auth cookie
  const isMockAuthMode = request.cookies.has("mock_auth_enabled")

  if (DEBUG) {
    console.log(`[Middleware] Mock auth mode: ${isMockAuthMode}`)
  }

  // If using mock auth, allow access to protected routes
  if (isMockAuthMode && isProtectedPath) {
    if (DEBUG) console.log(`[Middleware] Mock auth mode enabled, allowing access to ${url.pathname}`)
    return NextResponse.next()
  }

  // If the user is not authenticated and trying to access a protected path
  if (!isMockAuthMode && isProtectedPath) {
    if (DEBUG) console.log(`[Middleware] No auth cookie, redirecting to signin from ${url.pathname}`)
    const redirectUrl = new URL(`/auth/signin?callbackUrl=${encodeURIComponent(url.pathname)}`, request.url)
    const incrementedUrl = incrementRedirectCount(redirectUrl)
    const timestampedUrl = addTimestamp(incrementedUrl)
    return NextResponse.redirect(timestampedUrl)
  }

  // If the user is authenticated and trying to access an auth path
  if (isMockAuthMode && isAuthPath) {
    if (DEBUG) console.log(`[Middleware] Auth cookie present, redirecting to dashboard from ${url.pathname}`)
    const redirectUrl = new URL("/dashboard", request.url)
    const incrementedUrl = incrementRedirectCount(redirectUrl)
    const timestampedUrl = addTimestamp(incrementedUrl)
    return NextResponse.redirect(timestampedUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
