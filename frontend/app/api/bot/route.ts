import { NextResponse } from "next/server"
import OpenAI from "openai"

/**
 * CHATBOT ENDPOINT
 *
 * POST /api/bot
 * - Sends a message to the chatbot and gets a response
 * - Body: { messages: Array<{role: 'user'|'assistant', content: string}> }
 * - Example:
 *   fetch('/api/bot', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       messages: [
 *         { role: 'user', content: 'I feel anxious about my presentation tomorrow.' }
 *       ]
 *     })
 *   })
 * - Response: { message: string }
 *
 * This endpoint uses OpenAI's API to generate responses.
 * It includes a system prompt that defines the bot's behavior
 * as an empathetic AI companion focused on emotional well-being.
 *
 * Note: This endpoint requires an OpenAI API key to be set in
 * the environment variables (OPENAI_API_KEY).
 */

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4.5 Preview (GPT-4o)
      messages: [
        {
          role: "system",
          content: `You are Feel-Write, an empathetic AI companion focused on emotional well-being. 
        
        Your purpose is to:
        - Help users understand and process their emotions
        - Provide a safe, non-judgmental space for reflection
        - Offer gentle guidance based on emotional intelligence principles
        - Encourage healthy emotional expression and self-awareness
        
        Guidelines:
        - Be warm, compassionate, and conversational
        - Ask thoughtful questions to deepen understanding
        - Validate emotions without judgment
        - Keep responses concise (2-3 paragraphs maximum)
        - Focus on emotional awareness rather than problem-solving
        - Never diagnose or provide medical/therapeutic advice
        - If users are in crisis, gently suggest professional help
        
        Remember that you're a supportive companion, not a therapist or medical professional.`,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return NextResponse.json({
      message: response.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Could we try again?",
    })
  } catch (error) {
    console.error("Error in chat completion:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

