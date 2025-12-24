-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner1_id UUID NOT NULL REFERENCES users(id),
  partner2_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner1_id, partner2_id)
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  assignee_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  couple_id UUID REFERENCES couples(id),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'grocery',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping_items table
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shopping_lists(id),
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  aisle TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  couple_id UUID REFERENCES couples(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_date DATE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  is_mutual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  couple_id UUID REFERENCES couples(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 10),
  triggers TEXT[],
  thoughts TEXT,
  skills_used TEXT[],
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 5),
  duration_minutes INTEGER,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coping_skills table
CREATE TABLE IF NOT EXISTS coping_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  instructions TEXT[],
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coping_logs table
CREATE TABLE IF NOT EXISTS coping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  skill_id UUID NOT NULL REFERENCES coping_skills(id),
  trigger_type TEXT,
  urge_before INTEGER CHECK (urge_before >= 0 AND urge_before <= 10),
  urge_after INTEGER CHECK (urge_after >= 0 AND urge_after <= 10),
  notes TEXT,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Insert sample coping skills
INSERT INTO coping_skills (id, name, category, description, instructions) VALUES
  ('00000000-0000-0000-0000-000000000009', '4-7-8 Breathing', 'distress_tolerance', 'A breathing technique to quickly reduce anxiety', ARRAY['Inhale for 4 counts', 'Hold for 7 counts', 'Exhale for 8 counts', 'Repeat 3-4 times']),
  ('00000000-0000-0000-0000-000000000010', '5-4-3-2-1 Grounding', 'mindfulness', 'Use your senses to ground yourself in the present', ARRAY['Name 5 things you see', 'Name 4 things you touch', 'Name 3 things you hear', 'Name 2 things you smell', 'Name 1 thing you taste']),
  ('00000000-0000-0000-0000-000000000011', 'TIPP - Temperature', 'distress_tolerance', 'Use cold water to activate your dive response', ARRAY['Splash cold water on face', 'Hold ice cubes', 'Take cold shower', 'Dunk face in cold water']),
  ('00000000-0000-0000-0000-000000000012', 'Opposite Action', 'emotion_regulation', 'Do the opposite of what your emotion urges', ARRAY['Identify the emotion', 'Notice the urge', 'Choose opposite action', 'Act with your whole body']);

-- Insert demo users
INSERT INTO users (id, email, username, timezone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo1@syncycle.com', 'Alex', 'UTC'),
  ('00000000-0000-0000-0000-000000000002', 'demo2@syncycle.com', 'Jordan', 'UTC');

-- Create couple connection
INSERT INTO couples (id, partner1_id, partner2_id) VALUES
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Create shared shopping list
INSERT INTO shopping_lists (id, name, type, couple_id) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Weekly Groceries', 'grocery', '00000000-0000-0000-0000-000000000003');

-- Add items to shopping list
INSERT INTO shopping_items (id, list_id, name, quantity, aisle, created_by) VALUES
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000004', 'Organic Bananas', 6, 'Produce', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000004', 'Almond Milk', 2, 'Dairy', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000004', 'Whole Grain Bread', 1, 'Bakery', '00000000-0000-0000-0000-000000000001');

-- Create shared goals
INSERT INTO goals (id, title, description, category, target_date, is_mutual, progress, couple_id) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Save for Vacation', 'Save $3000 for our summer trip to Japan', 'finance', '2024-07-01', true, 1200, '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000006', 'Exercise 3x per week', 'Maintain consistent workout routine together', 'health', '2024-12-31', true, 60, '00000000-0000-0000-0000-000000000003');

-- Create sample transactions
INSERT INTO transactions (id, amount, description, category, type, transaction_date, couple_id) VALUES
  ('00000000-0000-0000-0000-000000000007', 85.50, 'Grocery shopping at Whole Foods', 'groceries', 'expense', '2024-01-15', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000008', 120.00, 'Date night dinner', 'dining', 'expense', '2024-01-14', '00000000-0000-0000-0000-000000000003');

-- Create sample episode
INSERT INTO episodes (id, user_id, intensity, triggers, thoughts, skills_used, effectiveness, duration_minutes, occurred_at) VALUES
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 7, ARRAY['work_stress', 'misunderstanding'], 'Feeling overwhelmed by deadlines and partner not understanding', ARRAY['4-7-8 Breathing', 'Opposite Action'], 4, 25, '2024-01-13T14:30:00Z');