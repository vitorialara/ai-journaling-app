import { NextResponse } from "next/server"

/**
 * GENERATE REFLECTION ENDPOINT
 *
 * POST /api/generate-reflection
 * - Generates a reflection prompt based on entry and previous reflections
 * - Body: { entry, previousReflection?, reflectionCount? }
 * - Example:
 *   fetch('/api/generate-reflection', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       entry: {
 *         category: 'happy',
 *         subEmotion: 'Joyful',
 *         text: 'Today was amazing!'
 *       },
 *       previousReflection: 'I felt really connected to everyone.',
 *       reflectionCount: 1
 *     })
 *   })
 * - Response: { prompt: string, source: string }
 *
 * This endpoint uses the dummy data defined below to generate
 * reflection prompts. It selects from category-specific prompts
 * for the first reflection, and follow-up prompts for subsequent
 * reflections.
 */

// GET - Generate a reflection prompt based on entry and previous reflections
export async function POST(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    const body = await request.json()
    const { entry, previousReflection, reflectionCount } = body

    if (!entry) {
      return NextResponse.json({
        error: "Entry is required",
        prompt: "What's something you're learning about yourself through this reflection?",
        source: "fallback",
      })
    }

    // Prompts for different emotion categories
    const prompts: Record<string, string[]> = {
      happy: [
        "What made this moment special for you?",
        "How can you create more moments like this in your life?",
        "Who would you like to share this happiness with?",
        "What does this happiness teach you about what truly matters to you?",
        "How can you hold onto this feeling when facing challenges?",
        "What small actions could help you experience this feeling more often?",
        "How does this positive emotion affect your perspective on other areas of life?",
        "What strengths or qualities in yourself does this emotion highlight?",
        "If you could bottle this feeling, when would you choose to open it?",
        "What gratitude arises when you sit with this emotion?",
      ],
      sad: [
        "What would you say to a friend feeling this way?",
        "Is there a small comfort you could give yourself right now?",
        "What's one tiny step that might help you feel better?",
        "How have you moved through similar feelings in the past?",
        "What would feel like a gentle step forward from here?",
        "What does this sadness need most from you right now?",
        "Is there wisdom or insight hidden within this difficult feeling?",
        "How might this emotion be trying to guide or protect you?",
        "What boundaries might need to be set or respected?",
        "What would self-compassion look like in this moment?",
      ],
      angry: [
        "What's beneath this anger? Is there another emotion hiding there?",
        "What would help you release some of this tension?",
        "Is there a boundary you need to set with someone?",
        "What would resolution or peace look like in this situation?",
        "What wisdom might your anger be trying to share with you?",
        "How can you honor this feeling without being controlled by it?",
        "What needs of yours aren't being met in this situation?",
        "How might you channel this energy constructively?",
        "What would help you feel heard or understood?",
        "If your anger could speak, what would it say it needs?",
      ],
      anxious: [
        "What's one thing you can control in this situation?",
        "What would help you feel more grounded right now?",
        "What's the kindest thing you could do for yourself today?",
        "What's a more balanced perspective you could consider?",
        "What self-care practice might help ease this anxiety?",
        "What's the worst that could happen, and how would you cope?",
        "What small step would help you feel more secure?",
        "How can you bring more certainty to this uncertain situation?",
        "What has helped you manage similar feelings in the past?",
        "How might you create a moment of safety for yourself right now?",
      ],
      calm: [
        "How can you bring more of this peaceful feeling into your daily life?",
        "What conditions helped create this sense of calm?",
        "What insights come to you when you're in this centered state?",
        "How does this calmness affect how you see your challenges?",
        "What would you like to remember about this feeling?",
        "What practices help you maintain this sense of balance?",
        "How does your body feel different when you're in this state?",
        "What clarity or wisdom emerges from this place of stillness?",
        "How might you anchor yourself to return to this feeling later?",
        "What does this calm state reveal about what truly matters to you?",
      ],
    }

    // Follow-up prompts based on previous reflections
    const followUpPrompts = [
      "How has your perspective shifted since you first wrote about this?",
      "What new insights are emerging as you continue to reflect?",
      "What patterns do you notice in how you've been thinking about this situation?",
      "What would your future self want you to remember about this experience?",
      "How does this connect to other important aspects of your life?",
      "What's something you're learning about yourself through this reflection?",
      "How might this understanding help you in similar situations in the future?",
      "What feels most important about what you've discovered so far?",
    ]

    let prompt: string

    // If we have a previous reflection, use a follow-up prompt
    if (previousReflection && reflectionCount > 0) {
      const index = Math.min(reflectionCount - 1, followUpPrompts.length - 1)
      prompt = followUpPrompts[index]
    } else {
      // Otherwise, use a prompt based on the emotion category
      const categoryPrompts = prompts[entry.category] || prompts.anxious
      const randomIndex = Math.floor(Math.random() * categoryPrompts.length)
      prompt = categoryPrompts[randomIndex]
    }

    return NextResponse.json({
      prompt,
      source: "enhanced-fallback",
    })
  } catch (error) {
    console.error("Error generating reflection prompt:", error)

    // Always return a valid JSON response, even in case of error
    return NextResponse.json({
      error: "Failed to generate reflection prompt",
      prompt: "What's something you're learning about yourself through this reflection?",
      source: "fallback",
    })
  }
}

