import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { journalEntries } from "@/lib/api"

// This would normally come from a database, but we're using the same in-memory storage
// from the main journal endpoint. In a real app, you'd use a database.

// GET - Retrieve a single journal entry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const id = await Promise.resolve(params.id)

    // Find the entry with the matching ID
    const entry = journalEntries.find((entry) => entry.id === id)

    if (!entry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return NextResponse.json(
      { error: "Failed to fetch journal entry" },
      { status: 500 }
    )
  }
}

// PATCH - Update a journal entry (for adding reflections)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id)
    const body = await request.json()

    // Find the entry with the matching ID
    const entryIndex = journalEntries.findIndex((entry) => entry.id === id)

    if (entryIndex === -1) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      )
    }

    // Update the entry
    journalEntries[entryIndex] = {
      ...journalEntries[entryIndex],
      ...body,
    }

    return NextResponse.json(journalEntries[entryIndex])
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json(
      { error: "Failed to update journal entry" },
      { status: 500 }
    )
  }
}
