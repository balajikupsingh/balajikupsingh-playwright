const fs = require('fs');
const path = process.argv[2];

if (path && fs.existsSync(path)) {
  let content = fs.readFileSync(path, 'utf8');
  // Replace the production API URL with the local CI URL
  content = content.replace(/API_ROOT\s*=\s*['"][^'"]+['"]/g, 'API_ROOT = "http://localhost:3000/api"');
  fs.writeFileSync(path, content);
  console.log('Patched frontend API root for CI.');
}
