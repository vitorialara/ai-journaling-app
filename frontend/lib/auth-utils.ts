// Helper functions for authentication

// Check if we're in a redirect loop
export function isInRedirectLoop(url: URL): boolean {
  const redirectCount = Number.parseInt(url.searchParams.get("redirectCount") || "0", 10)
  return redirectCount > 1 // Consider it a loop if we've redirected more than once
}

// Increment the redirect count in a URL
export function incrementRedirectCount(url: URL): URL {
  const newUrl = new URL(url)
  const currentCount = Number.parseInt(newUrl.searchParams.get("redirectCount") || "0", 10)
  newUrl.searchParams.set("redirectCount", (currentCount + 1).toString())
  return newUrl
}

// Reset the redirect count in a URL
export function resetRedirectCount(url: URL): URL {
  const newUrl = new URL(url)
  newUrl.searchParams.delete("redirectCount")
  return newUrl
}

// Add a timestamp to a URL to prevent caching
export function addTimestamp(url: URL): URL {
  const newUrl = new URL(url)
  newUrl.searchParams.set("t", Date.now().toString())
  return newUrl
}

