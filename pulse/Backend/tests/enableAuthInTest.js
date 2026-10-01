import fs from 'fs';
import path from 'path';

const filesToPatch = [
  'tests/resilienceApi.test.js',
  'tests/simulationApi.test.js',
  'tests/devAApi.test.js',
  'tests/taskApi.test.js',
  'tests/incidentApi.test.js',
  'tests/announcementAndActivityApi.test.js',
  'tests/dashboardAndIntegrationApi.test.js',
  'tests/e2eWorkflow.test.js',
];

for (const relPath of filesToPatch) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if already patched
  if (content.includes('enableTestAuthInterceptor')) {
    console.log(`Already patched: ${relPath}`);
    continue;
  }

  // Add import
  content = `import { enableTestAuthInterceptor } from './testAuthHelper.js';\n` + content;

  // Add enableTestAuthInterceptor() call right after connectDB()
  if (content.includes('await connectDB();')) {
    content = content.replace('await connectDB();', 'await connectDB();\n    await enableTestAuthInterceptor();');
  } else if (content.includes('connectDB()')) {
    content = content.replace('connectDB()', 'connectDB();\n    await enableTestAuthInterceptor()');
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Successfully patched: ${relPath}`);
}
