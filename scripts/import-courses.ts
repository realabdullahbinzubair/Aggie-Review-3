import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const coursesDataRaw = readFileSync(join(__dirname, '../src/assets/subjects_and_courses.json'), 'utf-8');
const coursesData = JSON.parse(coursesDataRaw);

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

function extractCourseCode(courseString: string): string | null {
  const match = courseString.match(/([A-Z]+\s+\d+[A-Z]*)/);
  return match ? match[1] : null;
}

function extractCourseName(courseString: string): string {
  const parts = courseString.split(' - ');
  return parts[0].trim();
}

async function importCourses() {
  console.log('Starting course import...');

  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*');

  if (deptError) {
    console.error('Error fetching departments:', deptError);
    return;
  }

  const deptMap = new Map(departments?.map(d => [d.name, d.id]) || []);
  const coursesSet = new Map<string, { name: string; code: string; department_id: string }>();

  for (const [department, courses] of Object.entries(coursesData)) {
    const cleanDept = department.replace(/["]/g, '').trim();
    const departmentId = deptMap.get(cleanDept);

    if (!departmentId) {
      console.log(`Skipping department: ${cleanDept} (not found in database)`);
      continue;
    }

    console.log(`Processing ${courses.length} courses for ${cleanDept}...`);

    for (const courseString of courses) {
      const courseCode = extractCourseCode(courseString as string);

      if (!courseCode) {
        console.log(`  Skipping invalid course: ${courseString}`);
        continue;
      }

      if (!coursesSet.has(courseCode)) {
        const courseName = extractCourseName(courseString as string);
        coursesSet.set(courseCode, {
          name: courseName,
          code: courseCode,
          department_id: departmentId
        });
      }
    }
  }

  console.log(`\nFound ${coursesSet.size} unique courses. Inserting...`);

  const coursesToInsert = Array.from(coursesSet.values());
  let imported = 0;
  let skipped = 0;

  const batchSize = 100;
  for (let i = 0; i < coursesToInsert.length; i += batchSize) {
    const batch = coursesToInsert.slice(i, i + batchSize);

    const { error } = await supabase
      .from('courses')
      .upsert(batch, { onConflict: 'code', ignoreDuplicates: true });

    if (error) {
      console.error(`Error importing batch:`, error.message);
      skipped += batch.length;
    } else {
      imported += batch.length;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Total unique courses: ${coursesSet.size}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped/Errors: ${skipped}`);
}

importCourses().catch(console.error);
