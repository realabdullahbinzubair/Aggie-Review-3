/*
  # Remove Public Professor Insert Policy

  1. Changes
    - Drop the public insert policy for professors table
    - This policy was only needed for initial data seeding
    - Professors table should now be read-only for public users
  
  2. Security
    - Only public read access remains
    - INSERT operations no longer allowed via anon key
*/

-- Remove the public insert policy
DROP POLICY IF EXISTS "Allow public insert for professors" ON professors;