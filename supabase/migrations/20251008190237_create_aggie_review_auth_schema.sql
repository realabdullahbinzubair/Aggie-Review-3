/*
  # Aggie Review Database Schema with Authentication

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, user's NC A&T email)
      - `full_name` (text, user's full name)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `departments`
      - `id` (uuid, primary key)
      - `name` (text, department name)
      - `code` (text, department code like "COMP", "MATH")
      - `created_at` (timestamp)
    
    - `courses`
      - `id` (uuid, primary key)
      - `code` (text, course code like "COMP 285")
      - `name` (text, course name)
      - `department_id` (uuid, foreign key to departments)
      - `created_at` (timestamp)
    
    - `professors`
      - `id` (uuid, primary key)
      - `name` (text, professor full name)
      - `department_id` (uuid, foreign key to departments)
      - `title` (text, e.g., "Professor", "Associate Professor")
      - `average_rating` (numeric, calculated average rating)
      - `total_reviews` (integer, count of reviews)
      - `would_take_again_percent` (numeric, percentage)
      - `difficulty_rating` (numeric, average difficulty)
      - `created_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `professor_id` (uuid, foreign key to professors)
      - `user_id` (uuid, foreign key to auth.users)
      - `course_id` (uuid, foreign key to courses)
      - `rating` (integer, 1-5 stars)
      - `difficulty` (integer, 1-5 scale)
      - `would_take_again` (boolean)
      - `for_credit` (boolean)
      - `attendance_mandatory` (boolean)
      - `grade_received` (text, optional)
      - `comment` (text, review text)
      - `helpful_count` (integer, upvote counter)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public read access for professors, courses, departments, reviews
    - Authenticated users can create profiles
    - Users can only create/delete their own reviews
    - Profiles are publicly readable

  3. Indexes
    - Index on professors department_id
    - Index on reviews professor_id, user_id, course_id
    - Index on courses department_id
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create professors table
CREATE TABLE IF NOT EXISTS professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  title text DEFAULT 'Professor',
  average_rating numeric(3,2) DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  would_take_again_percent numeric(5,2) DEFAULT 0.0,
  difficulty_rating numeric(3,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  difficulty integer NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  would_take_again boolean NOT NULL,
  for_credit boolean DEFAULT true,
  attendance_mandatory boolean DEFAULT false,
  grade_received text,
  comment text NOT NULL CHECK (length(comment) >= 20),
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professor_id, user_id, course_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for departments (public read)
CREATE POLICY "Anyone can view departments"
  ON departments FOR SELECT
  TO public
  USING (true);

-- RLS Policies for courses (public read)
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO public
  USING (true);

-- RLS Policies for professors (public read)
CREATE POLICY "Anyone can view professors"
  ON professors FOR SELECT
  TO public
  USING (true);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_professors_department ON professors(department_id);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_reviews_professor ON reviews(professor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Insert sample departments
INSERT INTO departments (name, code) VALUES
  ('Computer Science', 'COMP'),
  ('Mathematics', 'MATH'),
  ('Mechanical Engineering', 'MEEN'),
  ('Electrical Engineering', 'ELEN'),
  ('Biology', 'BIOL'),
  ('Chemistry', 'CHEM'),
  ('English', 'ENGL'),
  ('History', 'HIST'),
  ('Business Administration', 'BUAD'),
  ('Psychology', 'PSYC')
ON CONFLICT (code) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (code, name, department_id) VALUES
  ('COMP 285', 'Data Structures', (SELECT id FROM departments WHERE code = 'COMP')),
  ('COMP 390', 'Algorithms', (SELECT id FROM departments WHERE code = 'COMP')),
  ('MATH 231', 'Calculus I', (SELECT id FROM departments WHERE code = 'MATH')),
  ('MATH 232', 'Calculus II', (SELECT id FROM departments WHERE code = 'MATH')),
  ('ENGL 102', 'Composition II', (SELECT id FROM departments WHERE code = 'ENGL')),
  ('MEEN 201', 'Statics', (SELECT id FROM departments WHERE code = 'MEEN')),
  ('ELEN 301', 'Circuit Analysis', (SELECT id FROM departments WHERE code = 'ELEN')),
  ('BIOL 110', 'General Biology', (SELECT id FROM departments WHERE code = 'BIOL')),
  ('CHEM 121', 'General Chemistry', (SELECT id FROM departments WHERE code = 'CHEM')),
  ('BUAD 301', 'Marketing Principles', (SELECT id FROM departments WHERE code = 'BUAD'))
ON CONFLICT (code) DO NOTHING;

-- Insert sample professors
INSERT INTO professors (name, department_id, title, average_rating, total_reviews, would_take_again_percent, difficulty_rating) VALUES
  ('Dr. Sarah Johnson', (SELECT id FROM departments WHERE code = 'COMP'), 'Associate Professor', 4.5, 42, 85, 3.2),
  ('Dr. Michael Williams', (SELECT id FROM departments WHERE code = 'MATH'), 'Professor', 4.8, 67, 92, 4.1),
  ('Dr. Jennifer Davis', (SELECT id FROM departments WHERE code = 'MEEN'), 'Assistant Professor', 3.9, 28, 71, 3.8),
  ('Dr. Robert Martinez', (SELECT id FROM departments WHERE code = 'ELEN'), 'Professor', 4.2, 53, 78, 3.5),
  ('Dr. Lisa Anderson', (SELECT id FROM departments WHERE code = 'BIOL'), 'Associate Professor', 4.6, 45, 88, 2.9),
  ('Dr. James Thompson', (SELECT id FROM departments WHERE code = 'CHEM'), 'Professor', 3.7, 38, 65, 4.3),
  ('Dr. Patricia Garcia', (SELECT id FROM departments WHERE code = 'ENGL'), 'Associate Professor', 4.9, 71, 95, 2.4),
  ('Dr. David Brown', (SELECT id FROM departments WHERE code = 'BUAD'), 'Professor', 4.1, 49, 76, 3.0)
ON CONFLICT DO NOTHING;