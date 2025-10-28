import { createClient } from '@supabase/supabase-js';
import professorsData from '../src/assets/subjects_and_professors.json';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importProfessors() {
  console.log('Starting professor import...');

  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*');

  if (deptError) {
    console.error('Error fetching departments:', deptError);
    return;
  }

  const deptMap = new Map(departments?.map(d => [d.name, d.id]) || []);

  let totalImported = 0;
  let skipped = 0;

  for (const [department, professors] of Object.entries(professorsData)) {
    const departmentId = deptMap.get(department);

    if (!departmentId) {
      console.log(`Skipping department: ${department} (not found in database)`);
      skipped += professors.length;
      continue;
    }

    console.log(`Importing ${professors.length} professors for ${department}...`);

    const professorRecords = professors.map((name: string) => ({
      name,
      department_id: departmentId,
      title: 'Professor',
      average_rating: 0,
      total_reviews: 0,
      would_take_again_percent: 0,
      difficulty_rating: 0,
    }));

    const batchSize = 100;
    for (let i = 0; i < professorRecords.length; i += batchSize) {
      const batch = professorRecords.slice(i, i + batchSize);

      const { error } = await supabase
        .from('professors')
        .insert(batch);

      if (error) {
        console.error(`Error importing batch for ${department}:`, error.message);
      } else {
        totalImported += batch.length;
      }
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Total professors imported: ${totalImported}`);
  console.log(`Skipped: ${skipped}`);
}

importProfessors().catch(console.error);
