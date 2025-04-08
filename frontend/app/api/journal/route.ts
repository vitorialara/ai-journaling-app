import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { JournalEntry } from "@/app/types/journal"
import { journalEntries } from "./_data"

// GET - Retrieve all journal entries
export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || "user-1"

  // Filter entries by userId
  const userEntries = journalEntries.filter((entry) => entry.userId === userId)

  return NextResponse.json({ entries: userEntries })
}

// POST - Create a new journal entry
export async function POST(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const body = await request.json()

    // Create new entry with an ID
    const newEntry: JournalEntry = {
      id: uuidv4(),
      userId: body.userId || "user-1",
      category: body.category,
      subEmotion: body.subEmotion,
      text: body.text,
      photoUrl: body.photoUrl,
      createdAt: body.createdAt || new Date().toISOString(),
    }

    // Add to our in-memory database
    journalEntries.unshift(newEntry)

    return NextResponse.json({ entry: newEntry }, { status: 201 })
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}

