import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function mergeDuplicateProfessors() {
  console.log('Finding duplicate professors...');

  const { data: professors, error } = await supabase
    .from('professors')
    .select('id, name, department_id, department:departments(name, code)');

  if (error) {
    console.error('Error fetching professors:', error);
    return;
  }

  const professorMap = new Map<string, any[]>();

  professors?.forEach(prof => {
    if (!professorMap.has(prof.name)) {
      professorMap.set(prof.name, []);
    }
    professorMap.get(prof.name)!.push(prof);
  });

  const duplicates = Array.from(professorMap.entries()).filter(([_, profs]) => profs.length > 1);

  console.log(`Found ${duplicates.length} professors with duplicates`);
  console.log(`Total duplicate records to merge: ${duplicates.reduce((sum, [_, profs]) => sum + profs.length - 1, 0)}`);

  for (const [name, profs] of duplicates) {
    console.log(`\nMerging ${profs.length} records for: ${name}`);

    const departments = profs.map(p => p.department?.name || 'Unknown').filter((v, i, a) => a.indexOf(v) === i);
    const departmentCodes = profs.map(p => p.department?.code || 'UNKN').filter((v, i, a) => a.indexOf(v) === i);

    console.log(`  Departments: ${departments.join(', ')}`);

    const keepProf = profs[0];
    const mergeIds = profs.slice(1).map(p => p.id);

    console.log(`  Reviews to reassign from ${mergeIds.length} duplicate(s) to primary record...`);
  }

  console.log('\nDuplicate analysis complete. To actually merge, we need to use Supabase migrations.');
  console.log('This script identified duplicates for manual review.');
}

mergeDuplicateProfessors().catch(console.error);
