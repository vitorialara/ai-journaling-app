// This script syncs DATABASE_URL and POSTGRES_URL
// Run with: npx ts-node scripts/sync-env-vars.ts

import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config()

function syncEnvVars() {
  console.log("Syncing environment variables...")

  const envPath = path.resolve(process.cwd(), ".env.local")
  let envContent = ""

  // Read existing .env.local file if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
  }

  // Parse existing variables
  const envVars: Record<string, string> = {}
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      envVars[match[1]] = match[2]
    }
  })

  // Check if we need to sync DATABASE_URL and POSTGRES_URL
  const databaseUrl = process.env.DATABASE_URL
  const postgresUrl = process.env.POSTGRES_URL

  if (databaseUrl && !postgresUrl) {
    console.log("Setting POSTGRES_URL to match DATABASE_URL")
    envVars["POSTGRES_URL"] = databaseUrl
  } else if (postgresUrl && !databaseUrl) {
    console.log("Setting DATABASE_URL to match POSTGRES_URL")
    envVars["DATABASE_URL"] = postgresUrl
  } else if (databaseUrl && postgresUrl && databaseUrl !== postgresUrl) {
    console.log("DATABASE_URL and POSTGRES_URL have different values")
    console.log(`DATABASE_URL: ${databaseUrl}`)
    console.log(`POSTGRES_URL: ${postgresUrl}`)
    console.log("Setting both to use DATABASE_URL value")
    envVars["POSTGRES_URL"] = databaseUrl
  } else if (!databaseUrl && !postgresUrl) {
    console.warn("Both DATABASE_URL and POSTGRES_URL are missing!")
  } else {
    console.log("DATABASE_URL and POSTGRES_URL are already in sync")
  }

  // Write updated .env.local file
  const newEnvContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  fs.writeFileSync(envPath, newEnvContent)
  console.log("Environment variables synced successfully!")
}

syncEnvVars()

