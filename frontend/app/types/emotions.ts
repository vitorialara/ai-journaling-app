export type EmotionCategory = "happy" | "sad" | "angry" | "anxious" | "calm"

export type SubEmotion =
  | "Joyful"
  | "Grateful"
  | "Excited"
  | "Content"
  | "Proud"
  | "Peaceful"
  | "Hopeful"
  | "Inspired"
  | "Loved"
  | "Cheerful"
  | "Lonely"
  | "Disappointed"
  | "Hurt"
  | "Grief"
  | "Regretful"
  | "Hopeless"
  | "Melancholic"
  | "Empty"
  | "Heartbroken"
  | "Vulnerable"
  | "Frustrated"
  | "Irritated"
  | "Resentful"
  | "Jealous"
  | "Betrayed"
  | "Furious"
  | "Bitter"
  | "Disgusted"
  | "Outraged"
  | "Hostile"
  | "Nervous"
  | "Worried"
  | "Stressed"
  | "Insecure"
  | "Fearful"
  | "Panicked"
  | "Uneasy"
  | "Restless"
  | "Doubtful"
  | "Overwhelmed"
  | "Relaxed"
  | "Mindful"
  | "Centered"
  | "Balanced"
  | "Serene"
  | "Tranquil"
  | "Peaceful"
  | "Grounded"
  | "Harmonious"
  | "Soothed"

// Get sub-emotions based on the main emotion category
export function getSubEmotions(category: EmotionCategory): SubEmotion[] {
  switch (category) {
    case "happy":
      return [
        "Joyful",
        "Grateful",
        "Excited",
        "Content",
        "Proud",
        "Peaceful",
        "Hopeful",
        "Inspired",
        "Loved",
        "Cheerful",
      ]
    case "sad":
      return [
        "Lonely",
        "Disappointed",
        "Hurt",
        "Grief",
        "Regretful",
        "Hopeless",
        "Melancholic",
        "Empty",
        "Heartbroken",
        "Vulnerable",
      ]
    case "angry":
      return [
        "Frustrated",
        "Irritated",
        "Resentful",
        "Jealous",
        "Betrayed",
        "Furious",
        "Bitter",
        "Disgusted",
        "Outraged",
        "Hostile",
      ]
    case "anxious":
      return [
        "Nervous",
        "Worried",
        "Stressed",
        "Insecure",
        "Fearful",
        "Panicked",
        "Uneasy",
        "Restless",
        "Doubtful",
        "Overwhelmed",
      ]
    case "calm":
      return [
        "Relaxed",
        "Mindful",
        "Centered",
        "Balanced",
        "Serene",
        "Tranquil",
        "Peaceful",
        "Grounded",
        "Harmonious",
        "Soothed",
      ]
    default:
      return []
  }
}
