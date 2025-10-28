/*
  # Add Policy to Allow Professor Inserts

  1. Changes
    - Add policy to allow inserts to professors table
    - This enables data import while maintaining security for other operations
  
  2. Security
    - Only allows INSERT operations
    - Public can insert professors (for initial data population)
    - Read access remains public
*/

-- Add policy to allow anyone to insert professors (for data seeding)
CREATE POLICY "Allow public insert for professors"
  ON professors FOR INSERT
  TO public
  WITH CHECK (true);