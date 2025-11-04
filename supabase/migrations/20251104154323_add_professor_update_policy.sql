/*
  # Add Professor Update Policy

  1. Changes
    - Add UPDATE policy for professors table to allow authenticated users to update professor statistics
    - This policy allows the system to update average_rating, total_reviews, would_take_again_percent, and difficulty_rating after reviews are submitted
  
  2. Security
    - Only authenticated users can update professors (users who can submit reviews)
    - The policy enables automatic calculation of professor statistics when reviews are submitted
*/

-- Drop policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can update professor stats" ON professors;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add policy to allow authenticated users to update professor statistics
CREATE POLICY "Authenticated users can update professor stats"
  ON professors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
