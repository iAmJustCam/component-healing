#!/usr/bin/env node

/**
 * Helper script to add tech stack alignment commands to package.json
 * Usage: node add-scripts.js
 */

const fs = require('fs');
const path = require('path');

// Define scripts to add
const scripts = {
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
  
  // Add new scripts
  let added = 0;
  Object.entries(scripts).forEach(([key, value]) => {
    if (!packageJson.scripts[key]) {
      packageJson.scripts[key] = value;
      added++;
    }
  });
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log(`✅ Added ${added} scripts to package.json`);
  console.log('\n🚀 You can now use:');
  console.log('  npm run stack:check    # Check full project alignment');
  console.log('  npm run stack:align    # Fix all alignment issues');
  console.log('\n💡 See QUICK-START.md for more information about all available commands');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
  console.log('\nManually add these scripts to your package.json:');
  console.log(JSON.stringify({ scripts }, null, 2));
}