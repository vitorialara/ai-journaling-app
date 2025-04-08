# Feel-Write Frontend

## Project Structure
```
frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API route handlers
│   │   ├── journal/       # Journal entry API routes
│   │   └── _data.ts       # Mock data for development
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components
│   │   ├── journal-image.tsx
│   │   └── page-header.tsx
│   ├── journal/          # Journal entry pages
│   │   └── page.tsx      # Main journal entry form
│   ├── reflect/          # Reflection pages
│   │   └── page.tsx      # Reflection form
│   ├── dashboard/        # Dashboard pages
│   │   └── page.tsx      # User dashboard
│   ├── types/            # TypeScript type definitions
│   │   ├── journal.ts    # Journal entry types
│   │   └── emotions.ts   # Emotion types
│   └── lib/              # Utility functions
│       └── api-client.ts # API client functions
```

## Component Definitions

### Journal Entry Components

#### `JournalEntryPage` (`app/journal/page.tsx`)
Main component for creating journal entries.
- **Features**:
  - Emotion category selection
  - Sub-emotion selection
  - Text input
  - Photo upload
  - Reflection option
- **State Management**:
  - `journalText`: Current journal entry text
  - `photoUrl`: URL of uploaded photo
  - `isSubmitting`: Loading state
  - `isUploading`: Photo upload state
- **Props**: None
- **Dependencies**: `@/components/ui`, `next/navigation`, `lucide-react`

#### `JournalImage` (`app/components/journal-image.tsx`)
Component for displaying journal entry images.
- **Features**:
  - Image loading states
  - Error handling
  - Placeholder display
- **Props**:
  - `imageUrl`: URL of the image
  - `alt`: Alt text for accessibility
  - `className`: Additional CSS classes
- **Dependencies**: `lucide-react`

### Reflection Components

#### `ReflectionPage` (`app/reflect/page.tsx`)
Component for adding reflections to journal entries.
- **Features**:
  - Reflection prompt display
  - Text input for reflection
  - Entry details display
- **State Management**:
  - `entry`: Current journal entry
  - `reflectionPrompt`: Current reflection prompt
  - `isLoading`: Loading state
  - `error`: Error state
- **Props**: None
- **Dependencies**: `@/components/ui`, `next/navigation`

### Dashboard Components

#### `DashboardPage` (`app/dashboard/page.tsx`)
Main dashboard component showing recent entries and analytics.
- **Features**:
  - Recent entries list
  - Calendar view
  - Mood overview chart
  - Entry detail view
- **State Management**:
  - `entries`: List of journal entries
  - `selectedDate`: Currently selected date
  - `selectedEntry`: Currently selected entry
  - `isLoading`: Loading state
- **Props**: None
- **Dependencies**: `@/components/ui`, `date-fns`

### UI Components

#### `PageHeader` (`app/components/page-header.tsx`)
Reusable header component for pages.
- **Features**:
  - Title display
  - Subtitle display
  - Custom styling
- **Props**:
  - `title`: Header title
  - `subtitle`: Header subtitle
  - `className`: Additional CSS classes

## Type Definitions

### Journal Types (`app/types/journal.ts`)
```typescript
interface Reflection {
  prompt: string
  response: string
  timestamp: string
}

interface JournalEntry {
  id: string
  userId: string
  category: EmotionCategory
  subEmotion: SubEmotion
  text: string
  photoUrl: string | null
  reflections: Reflection[]
  createdAt: string
  updatedAt: string
}

interface CreateJournalEntryInput {
  userId: string
  category: EmotionCategory
  subEmotion: SubEmotion
  text: string
  photoUrl: string | null
  createdAt?: string
}
```

### Emotion Types (`app/types/emotions.ts`)
```typescript
type EmotionCategory = "happy" | "sad" | "angry" | "anxious" | "calm"
type SubEmotion = string // Specific sub-emotions for each category
```

## API Integration

### Journal API Client (`app/lib/api-client.ts`)
Functions for interacting with the journal API:
- `createJournalEntry`: Create a new journal entry
- `getJournalEntry`: Get a specific journal entry
- `updateJournalEntry`: Update a journal entry (add reflection)
- `getJournalEntries`: Get all journal entries for a user

## Development

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open browser:
   ```
   http://localhost:3000
   ```

### Environment Variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Features

### Journal Entry Creation
- Emotion category and sub-emotion selection
- Rich text input
- Photo upload with preview
- Reflection option
- Color-coded UI based on emotion

### Reflection System
- Context-aware prompts
- Multiple reflections per entry
- Timestamp tracking
- Emotion-based suggestions

### Dashboard
- Recent entries list
- Calendar view
- Mood overview chart
- Entry detail view
- Photo and reflection indicators

## Styling
- Uses Tailwind CSS for styling
- Emotion-based color schemes
- Responsive design
- Dark/light mode support

## Error Handling
- Form validation
- API error handling
- Loading states
- User feedback
- Error boundaries
