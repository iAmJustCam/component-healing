#!/usr/bin/env node

/**
 * Helper script to add tech stack alignment commands to package.json
 * Also removes conflicting/outdated scripts
 * Usage: node add-scripts.js
 */

const fs = require('fs');
const path = require('path');

// Scripts to be removed (outdated/conflicting scripts)
const scriptsToRemove = [
  // Old healing scripts
  'heal', 'heal:dry', 'heal:fix', 'heal:component', 'heal:ci', 'heal:ci:fix',
  'heal:project', 'heal:tailwind', 'heal:react19',
  'fix:tailwind', 'fix:react19', 'fix:interface', 'fix:exports',
  'audit', 'audit:fix', 'audit:report', 'audit:component', 'audit:auto',
  
  // Transitional scripts from first iteration
  'health', 'component:comprehensive', 'fix:modern',
  
  // Any other conflicting scripts that might exist
  'component:validate', 'component:fix', 'component:report', 'component:autofix',
  'component:tailwind', 'component:react', 'component:check'
];

// Define new scripts to add
const scriptsToAdd = {
  "stack:check": "bash scripts/tech-stack-validator.sh --comprehensive --report",
  "stack:align": "bash scripts/tech-stack-validator.sh --comprehensive --fix --yes",
  "component:check": "bash scripts/tech-stack-validator.sh --component-only --report",
  "component:fix": "bash scripts/tech-stack-validator.sh --component-only --fix --yes",
  "project:check": "bash scripts/tech-stack-validator.sh --project-structure --report",
  "project:fix": "bash scripts/tech-stack-validator.sh --project-structure --fix --yes",
  "react:check": "bash scripts/tech-stack-validator.sh --react --report",
  "react:fix": "bash scripts/tech-stack-validator.sh --react --fix --yes",
  "next:check": "bash scripts/tech-stack-validator.sh --next --report",
  "next:fix": "bash scripts/tech-stack-validator.sh --next --fix --yes",
  "tailwind:check": "bash scripts/tech-stack-validator.sh --tailwind --report",
  "tailwind:fix": "bash scripts/tech-stack-validator.sh --tailwind --fix --yes",
  "a11y:check": "bash scripts/tech-stack-validator.sh --accessibility --report",
  "a11y:fix": "bash scripts/tech-stack-validator.sh --accessibility --fix --yes"
};

// Path to package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ensure scripts object exists
  packageJson.scripts = packageJson.scripts || {};
  
  // Remove old scripts
  let removed = 0;
  scriptsToRemove.forEach(script => {
    if (packageJson.scripts[script]) {
      delete packageJson.scripts[script];
      removed++;
    }
  });
  
  // Add new scripts
  let added = 0;
  Object.entries(scriptsToAdd).forEach(([key, value]) => {
    packageJson.scripts[key] = value;
    added++;
  });
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log(`✅ Operation successful:`);
  console.log(`   - Removed ${removed} outdated/conflicting scripts`);
  console.log(`   - Added ${added} new tech stack alignment scripts`);
  
  console.log('\n🚀 You can now use:');
  console.log('  npm run stack:check    # Check full project alignment');
  console.log('  npm run stack:align    # Fix all alignment issues');
  console.log('\n💡 See QUICK-START.md for more information about all available commands');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
  console.log('\nManually update your package.json:');
  console.log('1. Remove old scripts like: heal, heal:*, fix:*, audit:*, health, etc.');
  console.log('2. Add new scripts:');
  console.log(JSON.stringify({ scripts: scriptsToAdd }, null, 2));
}