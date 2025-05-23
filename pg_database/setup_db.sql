-- Drop the database if it exists
DROP DATABASE IF EXISTS journal-ai;

-- Create a new database
CREATE DATABASE journal-ai;

-- Connect to the new database
\c journal-ai
-- drop schema "feel-write" cascade;

-- Create the schema

CREATE SCHEMA IF NOT EXISTS "feel-write";

-- Set the search path
SET search_path TO "feel-write";


-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create emotion_categories table
CREATE TABLE IF NOT EXISTS emotion_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- Hex color code
    icon VARCHAR(50)   -- Icon name or path
);

-- Create sub_emotions table
CREATE TABLE IF NOT EXISTS sub_emotions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES emotion_categories(id),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10)
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES emotion_categories(id),
    text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    category_id INTEGER REFERENCES emotion_categories(id),
    sub_emotion_id INTEGER REFERENCES sub_emotions(id),
    text TEXT NOT NULL,
    photo_url TEXT,
    reflections JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(36) PRIMARY KEY REFERENCES users(id),
    name VARCHAR(100),
    avatar_url TEXT,
    stats JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    -- Streak data
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_check_in_date TIMESTAMP WITH TIME ZONE,
    -- Mood distribution
    mood_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Sub-emotion counts
    sub_emotion_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Timeline data
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_category_id ON journal_entries(category_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_analytics_user_date ON analytics(user_id, date);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert seed data for emotion_categories
INSERT INTO emotion_categories (name, description, color, icon) VALUES
('happy', 'Positive emotions and joy', '#FFD700', 'happy'),
('sad', 'Negative emotions and sorrow', '#4169E1', 'sad'),
('angry', 'Frustration and anger', '#FF4500', 'angry'),
('anxious', 'Worry and anxiety', '#9370DB', 'anxious'),
('calm', 'Peaceful and relaxed emotions', '#98FB98', 'calm');

-- Insert seed data for sub_emotions
INSERT INTO sub_emotions (category_id, name, description, intensity) VALUES
-- Happy sub-emotions (category_id: 1)
(1, 'Joyful', 'Feeling great happiness and delight', 5),
(1, 'Grateful', 'Feeling appreciation and thankfulness', 4),
(1, 'Excited', 'Feeling enthusiastic and eager', 4),
(1, 'Content', 'Feeling satisfied and at peace', 3),
(1, 'Proud', 'Feeling pleased with achievements', 4),
(1, 'Peaceful', 'Feeling calm and serene', 3),
(1, 'Hopeful', 'Feeling optimistic about the future', 4),
(1, 'Inspired', 'Feeling motivated and creative', 4),
(1, 'Loved', 'Feeling cared for and valued', 5),
(1, 'Cheerful', 'Feeling light-hearted and happy', 3),
-- Sad sub-emotions (category_id: 2)
(2, 'Lonely', 'Feeling isolated and alone', 4),
(2, 'Disappointed', 'Feeling let down or discouraged', 3),
(2, 'Hurt', 'Feeling emotional pain', 4),
(2, 'Grief', 'Feeling deep sadness and loss', 5),
(2, 'Regretful', 'Feeling remorse or guilt', 3),
(2, 'Hopeless', 'Feeling without hope or optimism', 4),
(2, 'Melancholic', 'Feeling deep sadness', 4),
(2, 'Empty', 'Feeling void of emotion', 3),
(2, 'Heartbroken', 'Feeling intense emotional pain', 5),
(2, 'Vulnerable', 'Feeling exposed and sensitive', 3),
-- Angry sub-emotions (category_id: 3)
(3, 'Frustrated', 'Feeling blocked or thwarted', 3),
(3, 'Irritated', 'Feeling annoyed or bothered', 2),
(3, 'Resentful', 'Feeling bitterness or indignation', 4),
(3, 'Jealous', 'Feeling envy or possessiveness', 3),
(3, 'Betrayed', 'Feeling deceived or let down', 4),
(3, 'Furious', 'Feeling extreme anger', 5),
(3, 'Bitter', 'Feeling resentful and angry', 4),
(3, 'Disgusted', 'Feeling revulsion or contempt', 4),
(3, 'Outraged', 'Feeling extreme anger and shock', 5),
(3, 'Hostile', 'Feeling aggressive or antagonistic', 4),
-- Anxious sub-emotions (category_id: 4)
(4, 'Nervous', 'Feeling uneasy or apprehensive', 3),
(4, 'Worried', 'Feeling concerned or anxious', 3),
(4, 'Stressed', 'Feeling pressure or tension', 4),
(4, 'Insecure', 'Feeling uncertain or unsafe', 3),
(4, 'Fearful', 'Feeling afraid or scared', 4),
(4, 'Panicked', 'Feeling extreme anxiety', 5),
(4, 'Uneasy', 'Feeling discomfort or anxiety', 2),
(4, 'Restless', 'Feeling unable to relax', 3),
(4, 'Doubtful', 'Feeling uncertain or skeptical', 3),
(4, 'Overwhelmed', 'Feeling unable to cope', 4),
-- Calm sub-emotions (category_id: 5)
(5, 'Relaxed', 'Feeling at ease and comfortable', 3),
(5, 'Mindful', 'Feeling present and aware', 4),
(5, 'Centered', 'Feeling balanced and focused', 4),
(5, 'Balanced', 'Feeling stable and composed', 3),
(5, 'Serene', 'Feeling peaceful and calm', 4),
(5, 'Tranquil', 'Feeling quiet and peaceful', 4),
(5, 'Peaceful', 'Feeling calm and undisturbed', 3),
(5, 'Grounded', 'Feeling stable and secure', 4),
(5, 'Harmonious', 'Feeling in balance and agreement', 4),
(5, 'Soothed', 'Feeling comforted and calm', 3);

-- Insert seed data for prompts
INSERT INTO prompts (category_id, text) VALUES
-- Happy prompts (category_id: 1)
(1, 'What brought you this joy today?'),
(1, 'How can you maintain this positive feeling?'),
(1, 'What are you grateful for in this moment?'),
(1, 'What achievements are you proud of?'),
(1, 'What inspires you right now?'),
-- Sad prompts (category_id: 2)
(2, 'What triggered this sadness?'),
(2, 'What support do you need right now?'),
(2, 'How can you be kind to yourself in this moment?'),
(2, 'What would help you feel less alone?'),
(2, 'What small step could you take to feel better?'),
-- Angry prompts (category_id: 3)
(3, 'What specifically made you feel this way?'),
(3, 'How can you express this anger constructively?'),
(3, 'What boundaries do you need to set?'),
(3, 'What would help you feel more in control?'),
(3, 'How can you channel this energy positively?'),
-- Anxious prompts (category_id: 4)
(4, 'What are you most worried about?'),
(4, 'What can you control in this situation?'),
(4, 'What would help you feel more secure?'),
(4, 'What evidence do you have that things will be okay?'),
(4, 'How can you practice self-care right now?'),
-- Calm prompts (category_id: 5)
(5, 'What helped you reach this peaceful state?'),
(5, 'How can you maintain this calm feeling?'),
(5, 'What practices help you stay centered?'),
(5, 'What brings you a sense of balance?'),
(5, 'How can you create more moments like this?');

-- Insert sample user
INSERT INTO users (id, email, username, hashed_password) VALUES
('user-1', 'demo@example.com', 'demo_user', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- Insert sample user profile
INSERT INTO user_profiles (user_id, name, avatar_url, stats) VALUES
('user-1', 'Demo User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', '{
    "totalEntries": 12,
    "totalReflections": 8,
    "streakDays": 15,
    "currentStreak": 3,
    "longestStreak": 5,
    "lastCheckInDate": "2024-03-20T10:30:00Z"
}');

-- Insert sample analytics
INSERT INTO analytics (user_id, date, current_streak, longest_streak, last_check_in_date, mood_distribution, sub_emotion_counts, timeline) VALUES
('user-1', CURRENT_DATE, 3, 5, CURRENT_TIMESTAMP, '{
    "happy": {"count": 4, "percentage": 33},
    "sad": {"count": 2, "percentage": 17},
    "angry": {"count": 1, "percentage": 8},
    "anxious": {"count": 3, "percentage": 25},
    "calm": {"count": 2, "percentage": 17}
}', '{
    "Joyful": 2,
    "Grateful": 2,
    "Lonely": 1,
    "Nervous": 2,
    "Peaceful": 1
}', '[{
    "date": "2024-03-20",
    "entries": 1,
    "reflections": 1,
    "primaryEmotion": "happy"
}]');

-- Insert sample journal entries
INSERT INTO journal_entries (id, user_id, category_id, sub_emotion_id, text, photo_url, reflections, created_at, updated_at) VALUES
-- Happy entries
('entry-1', 'user-1', 1, 1, 'Today was amazing! I got a promotion at work and celebrated with my team.', NULL, '[]', '2024-03-20T10:30:00Z', '2024-03-20T10:30:00Z'),
('entry-2', 'user-1', 1, 2, 'I feel so grateful for my family and friends who support me.', NULL, '[]', '2024-03-19T15:45:00Z', '2024-03-19T15:45:00Z'),
-- Sad entries
('entry-3', 'user-1', 2, 11, 'I miss my old friend who moved away. It feels lonely without them.', NULL, '[]', '2024-03-18T20:15:00Z', '2024-03-18T20:15:00Z'),
('entry-4', 'user-1', 2, 12, 'I feel disappointed about not getting the project I wanted.', NULL, '[]', '2024-03-17T09:30:00Z', '2024-03-17T09:30:00Z'),
-- Angry entries
('entry-5', 'user-1', 3, 21, 'I''m frustrated with the constant delays in the project.', NULL, '[]', '2024-03-16T14:20:00Z', '2024-03-16T14:20:00Z'),
('entry-6', 'user-1', 3, 22, 'Someone took credit for my work today. I''m so irritated!', NULL, '[]', '2024-03-15T11:45:00Z', '2024-03-15T11:45:00Z'),
-- Anxious entries
('entry-7', 'user-1', 4, 31, 'I''m nervous about my presentation tomorrow.', NULL, '[]', '2024-03-14T16:30:00Z', '2024-03-14T16:30:00Z'),
('entry-8', 'user-1', 4, 32, 'I''m worried about my upcoming medical test results.', NULL, '[]', '2024-03-13T13:15:00Z', '2024-03-13T13:15:00Z'),
-- Calm entries
('entry-9', 'user-1', 5, 41, 'I had a relaxing day at the beach. The sound of waves was so peaceful.', NULL, '[]', '2024-03-12T18:00:00Z', '2024-03-12T18:00:00Z'),
('entry-10', 'user-1', 5, 42, 'I practiced mindfulness meditation today and feel centered.', NULL, '[]', '2024-03-11T08:45:00Z', '2024-03-11T08:45:00Z');


-- Add comments to tables
COMMENT ON TABLE emotion_categories IS 'Read-only table containing predefined emotion categories. Do not modify.';
COMMENT ON TABLE sub_emotions IS 'Read-only table containing predefined sub-emotions. Do not modify.';

-- Create function to prevent updates on emotion_categories
CREATE OR REPLACE FUNCTION prevent_emotion_categories_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'emotion_categories table is read-only. Do not modify.';
END;
$$ language 'plpgsql';

-- Create function to prevent updates on sub_emotions
CREATE OR REPLACE FUNCTION prevent_sub_emotions_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'sub_emotions table is read-only. Do not modify.';
END;
$$ language 'plpgsql';

-- Create triggers to prevent updates on emotion tables
CREATE TRIGGER prevent_emotion_categories_update_trigger
    BEFORE UPDATE OR DELETE ON emotion_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_emotion_categories_update();

CREATE TRIGGER prevent_sub_emotions_update_trigger
    BEFORE UPDATE OR DELETE ON sub_emotions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_sub_emotions_update();
