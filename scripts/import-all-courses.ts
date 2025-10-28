import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface CourseData {
  code: string;
  name: string;
  department_name: string;
}

function parseCourseLine(line: string): { code: string; name: string } | null {
  const regex = /^(.+?)\s+-\s+([A-Z]+\s+\d+[A-Z]*(?:\s+-\s+[A-Z]+)?)\s*$/;
  const match = line.match(regex);

  if (match) {
    const name = match[1].trim();
    const code = match[2].replace(/\s+-\s+[A-Z]+$/, '').trim();
    return { code, name };
  }

  const shortRegex = /^([A-Z]+\s+\d+[A-Z]*)\s*$/;
  const shortMatch = line.match(shortRegex);
  if (shortMatch) {
    return { code: shortMatch[1].trim(), name: shortMatch[1].trim() };
  }

  return null;
}

async function importCourses() {
  console.log('Starting course import...');

  const jsonPath = path.join(__dirname, '../src/assets/subjects_and_courses_clean.json');
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(fileContent);

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code');

  if (!departments) {
    console.error('Failed to fetch departments');
    return;
  }

  const departmentMap = new Map(
    departments.map(d => [d.name.toLowerCase(), d])
  );

  const coursesSet = new Set<string>();
  const coursesToInsert: CourseData[] = [];

  for (const [deptName, courseList] of Object.entries(data)) {
    if (!Array.isArray(courseList)) continue;

    const cleanDeptName = deptName.replace(/^["']|["']$/g, '').trim();
    const department = departmentMap.get(cleanDeptName.toLowerCase());

    if (!department) {
      console.log(`Department not found: ${cleanDeptName}`);
      continue;
    }

    for (const courseLine of courseList) {
      const parsed = parseCourseLine(courseLine);
      if (!parsed) continue;

      const uniqueKey = `${parsed.code}|${department.id}`;
      if (coursesSet.has(uniqueKey)) continue;

      coursesSet.add(uniqueKey);
      coursesToInsert.push({
        code: parsed.code,
        name: parsed.name,
        department_name: cleanDeptName
      });
    }
  }

  console.log(`Found ${coursesToInsert.length} unique courses to import`);

  let successCount = 0;
  let errorCount = 0;

  for (const course of coursesToInsert) {
    const department = departmentMap.get(course.department_name.toLowerCase());
    if (!department) continue;

    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('code', course.code)
      .maybeSingle();

    if (existing) {
      continue;
    }

    const { error } = await supabase
      .from('courses')
      .insert({
        code: course.code,
        name: course.name,
        department_id: department.id
      });

    if (error) {
      errorCount++;
      if (errorCount <= 10) {
        console.error(`Error inserting ${course.code}:`, error.message);
      }
    } else {
      successCount++;
      if (successCount % 100 === 0) {
        console.log(`Imported ${successCount} courses...`);
      }
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

importCourses().catch(console.error);
