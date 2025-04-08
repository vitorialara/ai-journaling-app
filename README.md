# Feel-Write - Emotional Journaling App

Feel-Write is a comprehensive emotion tracking application that helps users understand and manage their emotional well-being through journaling and reflection.

## Project Structure

```
feel-write/
├── backend/           # FastAPI backend
├── frontend/          # React frontend
├── pg_database/       # PostgreSQL database setup
└── README.md
```

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

## Features

- **Emotional journaling**: Log and categorize your emotions
- **Journal Entries**: Write about your experiences and feelings
- **Reflection Prompts**: Guided questions to help process emotions
- **Analytics**: Track emotional patterns over time
- **User Authentication**: Secure account management
- **Photo Upload**: Attach photos to your journal entries
- **Dark Mode**: Support for different themes

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python 3.12
- **Database**: PostgreSQL
- **Authentication**: JWT (coming soon)

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
