import { NextResponse } from "next/server"

/**
 * IMAGE RETRIEVAL ENDPOINT
 *
 * GET /api/images/[id]
 * - Retrieves an image by ID
 * - Example: fetch('/api/images/abc123')
 * - Response: The image file with appropriate content type
 *
 * Note: This is a dummy implementation. In a real application,
 * you would retrieve the image from a storage service.
 */

// This would normally retrieve from a database or storage service
// For demo purposes, we'll return a placeholder image
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    // In a real implementation, you would retrieve the image from storage
    // For this demo, we'll return a placeholder
    const placeholderUrl = `https://picsum.photos/seed/${id}/400/300`

    // Fetch the placeholder image
    const imageResponse = await fetch(placeholderUrl)

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch placeholder: ${imageResponse.status}`)
    }

    // Get the image data and content type
    const imageData = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg"

    // Return the image with the appropriate content type
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error retrieving image:", error)
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }
}

