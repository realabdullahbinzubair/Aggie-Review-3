import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateProfessorDepartments() {
  console.log('Starting to populate professor_departments...');

  // Fetch all professors with their department_id
  const { data: professors, error: profError } = await supabase
    .from('professors')
    .select('id, name, department_id')
    .not('department_id', 'is', null);

  if (profError) {
    console.error('Error fetching professors:', profError);
    return;
  }

  if (!professors || professors.length === 0) {
    console.log('No professors found with department_id');
    return;
  }

  console.log(`Found ${professors.length} professors with department associations`);

  // Create professor_departments records
  const professorDepartments = professors.map(prof => ({
    professor_id: prof.id,
    department_id: prof.department_id,
  }));

  // Insert in batches
  const batchSize = 100;
  let totalInserted = 0;
  let duplicates = 0;

  for (let i = 0; i < professorDepartments.length; i += batchSize) {
    const batch = professorDepartments.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('professor_departments')
      .insert(batch)
      .select();

    if (error) {
      if (error.message.includes('duplicate')) {
        duplicates += batch.length;
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: Skipped ${batch.length} duplicates`);
      } else {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      }
    } else {
      totalInserted += data?.length || 0;
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: Inserted ${data?.length || 0} records`);
    }
  }

  console.log(`\nPopulation complete!`);
  console.log(`Total records inserted: ${totalInserted}`);
  console.log(`Duplicates skipped: ${duplicates}`);

  // Verify the results
  const { count } = await supabase
    .from('professor_departments')
    .select('*', { count: 'exact', head: true });

  console.log(`Total records in professor_departments: ${count}`);
}

populateProfessorDepartments().catch(console.error);
