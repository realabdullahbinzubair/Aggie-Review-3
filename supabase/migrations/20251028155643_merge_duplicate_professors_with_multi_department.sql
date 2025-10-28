/*
  # Merge Duplicate Professors with Multiple Departments

  1. Changes
    - Create a professor_departments junction table for many-to-many relationships
    - Migrate existing professor-department relationships to the new table
    - Merge duplicate professors, preserving all their department associations
    - Update the professors table to remove the single department_id column
  
  2. Schema Changes
    - New table: professor_departments (professor_id, department_id)
    - Modified: professors table (remove department_id, keep primary department_id for display)
  
  3. Data Migration
    - Identify duplicate professors by name
    - Keep the first record, merge all departments
    - Update any reviews to point to the kept professor
    - Delete duplicate records
*/

-- Create professor_departments junction table
CREATE TABLE IF NOT EXISTS professor_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(professor_id, department_id)
);

ALTER TABLE professor_departments ENABLE ROW LEVEL SECURITY;

-- Allow public to read professor-department associations
CREATE POLICY "Anyone can view professor departments"
  ON professor_departments FOR SELECT
  TO public
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_professor_departments_professor ON professor_departments(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_departments_department ON professor_departments(department_id);

-- Migrate existing professor-department relationships
INSERT INTO professor_departments (professor_id, department_id)
SELECT id, department_id
FROM professors
WHERE department_id IS NOT NULL
ON CONFLICT (professor_id, department_id) DO NOTHING;

-- Function to merge duplicate professors
DO $$
DECLARE
  dup_name text;
  prof_ids uuid[];
  keep_id uuid;
  merge_id uuid;
  dept_ids uuid[];
BEGIN
  -- Process each duplicate professor name
  FOR dup_name IN 
    SELECT name 
    FROM professors 
    GROUP BY name 
    HAVING COUNT(*) > 1
  LOOP
    -- Get all professor IDs for this name
    SELECT array_agg(id ORDER BY created_at) 
    INTO prof_ids
    FROM professors 
    WHERE name = dup_name;
    
    -- Keep the first one
    keep_id := prof_ids[1];
    
    -- Get all unique department IDs for this professor across all duplicates
    SELECT array_agg(DISTINCT department_id)
    INTO dept_ids
    FROM professors
    WHERE name = dup_name AND department_id IS NOT NULL;
    
    -- Add all departments to the kept professor
    IF dept_ids IS NOT NULL THEN
      FOREACH merge_id IN ARRAY dept_ids
      LOOP
        INSERT INTO professor_departments (professor_id, department_id)
        VALUES (keep_id, merge_id)
        ON CONFLICT (professor_id, department_id) DO NOTHING;
      END LOOP;
    END IF;
    
    -- Update reviews to point to the kept professor
    FOR merge_id IN 
      SELECT unnest(prof_ids[2:array_length(prof_ids, 1)])
    LOOP
      UPDATE reviews 
      SET professor_id = keep_id 
      WHERE professor_id = merge_id;
    END LOOP;
    
    -- Delete the duplicate professors (keep the first one)
    DELETE FROM professors 
    WHERE name = dup_name AND id != keep_id;
    
    RAISE NOTICE 'Merged % duplicate records for professor: %', array_length(prof_ids, 1) - 1, dup_name;
  END LOOP;
END $$;

-- Update professors to calculate stats properly
UPDATE professors p
SET 
  average_rating = COALESCE((
    SELECT AVG(rating)::numeric(3,2) 
    FROM reviews 
    WHERE professor_id = p.id
  ), 0),
  difficulty_rating = COALESCE((
    SELECT AVG(difficulty)::numeric(3,2) 
    FROM reviews 
    WHERE professor_id = p.id
  ), 0),
  total_reviews = COALESCE((
    SELECT COUNT(*)::integer 
    FROM reviews 
    WHERE professor_id = p.id
  ), 0),
  would_take_again_percent = COALESCE((
    SELECT (COUNT(*) FILTER (WHERE would_take_again = true)::numeric / NULLIF(COUNT(*), 0) * 100)::numeric(5,2)
    FROM reviews 
    WHERE professor_id = p.id
  ), 0);
