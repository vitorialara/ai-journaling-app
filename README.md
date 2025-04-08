# ✍️ Feel Write – AI-Powered Emotional Journaling App

**Feel Write** is an AI-powered journaling web application designed to help users reflect on their emotions, track their mental wellness, and grow emotionally through personalized AI-driven prompts and visual feedback.

This project combines my expertise in **machine learning**, **full-stack web development**, and **emotional intelligence design** to create a meaningful tool for self-reflection and mental wellness.

---

## 💡 Features

### 🌟 AI-Enhanced Journaling
- Generate intelligent, context-aware **reflection prompts** using LLMs
- Receive **AI-powered summaries and reframed perspectives** on journal entries
- Integrate a conversational **chatbot assistant** for guided reflection

### 🎨 Visual Growth Feedback
- Interactive growth animations (flowers, clouds, etc.) that evolve with user consistency and emotion trends

### 📈 Mood Analytics & Summaries
- Weekly emotion radar charts and summaries
- Track mood trends, journaling streaks, and time-based statistics

### 👤 Full Auth + User Profiles
- JWT-based authentication (Sign up, sign in, verify email)
- Custom dashboards for tracking personal progress and entries

### 💬 Emotion-Centric Design
- Emotion tagging system with predefined categories
- Journal entries and reflections are structured around emotional themes

---

## 🧠 Tech Stack

### Frontend
- **Next.js** with App Router
- **TailwindCSS** for styling
- **TypeScript** for type safety
- **ShadCN UI** & **custom components**
- **Zustand** & React Context for state
- **Charts.js** for mood analytics

### Backend
- **FastAPI** for backend API
- **PostgreSQL** for data storage
- **SQLAlchemy** for ORM
- **Docker** for deployment
- RESTful APIs organized by domains: `journal`, `emotions`, `users`, `analytics`, `bot`

### AI Integration
- **OpenAI API** for reflection prompt generation and summaries
- AI endpoints:
  - `/api/generate-reflection`
  - `/api/bot`
  - `/api/completion`

---

## 🧪 Folder Structure

### Backend
```
backend/
├── app/
│   ├── api/            # Journal, Emotion, Prompt, User, Bot APIs
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   └── core/           # Security logic (auth, hashing)
```

### Frontend
```
frontend/
├── app/
│   ├── api/            # Next.js API handlers
│   ├── components/     # UI components + Visual feedback animations
│   ├── journal/        # Journal pages
│   ├── dashboard/      # Mood charts, stats, reflections
│   └── auth/           # Signup, Signin, Email verification
```

---

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   cd ../pg_database
   psql -U postgres -d postgres -f schema.sql
   ```

5. Start the backend server:
   ```bash
   cd ../backend
   uvicorn app.main:app --reload --port 8001
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## API Documentation
For detailed API documentation, please refer to [API_DOCS.md](API_DOCS.md).


## Development

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/feel-write
SECRET_KEY=your-secret-key-here
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### API Documentation

Once the backend server is running:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.

## ✍️ Author

Built by Vitoria Lara and Ellen
A passion project focused on applying AI to enhance emotional well-being.