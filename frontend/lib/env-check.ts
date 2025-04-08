// Utility to check and log environment variables

export function checkEnvironmentVariables() {
  const variables = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ]

  const results: Record<string, boolean> = {}

  variables.forEach((variable) => {
    results[variable] = !!process.env[variable]
  })

  console.log("Environment variables check:")
  Object.entries(results).forEach(([variable, exists]) => {
    console.log(`- ${variable}: ${exists ? "Available ✅" : "Missing ❌"}`)
  })

  // Check for database URL specifically
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!dbUrl) {
    console.warn("WARNING: Both DATABASE_URL and POSTGRES_URL are missing!")
  } else {
    console.log(`Using database URL from: ${process.env.DATABASE_URL ? "DATABASE_URL" : "POSTGRES_URL"}`)
  }

  // Check for Supabase URL specifically
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn("WARNING: NEXT_PUBLIC_SUPABASE_URL is missing!")
  }

  return results
}

