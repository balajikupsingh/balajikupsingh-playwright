const fs = require('fs');
const path = process.argv[2];

if (path && fs.existsSync(path)) {
  let content = fs.readFileSync(path, 'utf8');
  // Example: Modify your sequelize/pg config to disable SSL
  content = content.replace(/ssl:\s*true/g, 'ssl: false');
  fs.writeFileSync(path, content);
  console.log('Patched backend SSL settings for CI.');
}
