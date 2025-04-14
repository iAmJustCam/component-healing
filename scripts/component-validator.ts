#!/usr/bin/env node
/**
 * Tech Stack Alignment System CLI
 * 
 * A comprehensive command-line tool for validating and fixing entire projects
 * according to modern best practices for React 19, Next.js 15, and Tailwind CSS v4.
 * Checks both components and overall project structure.
 */

import path from 'path';
import fs from 'fs';
import yargsParser from 'yargs-parser';
import chalk from 'chalk';
import {
  validateComponents,
  validateComponent,
  generateValidationReport,
  applyFixes,
  createUtilsFile,
  ValidationOptions
} from './modules/unified-validator';

// Parse CLI arguments
const argv = yargsParser(process.argv.slice(2), {
  boolean: [
    'fix',
    'report',
    'json',
    'tailwind',
    'react19',
    'server',
    'react',
    'next',
    'help',
    'all',
    'create-utils',
    'comprehensive',
    'component-only',
    'project-structure',
    'accessibility'
  ],
  string: ['component', 'dir', 'pattern', 'output'],
  alias: {
    c: 'component',
    d: 'dir',
    f: 'fix',
    r: 'report',
    j: 'json',
    t: 'tailwind',
    s: 'server',
    h: 'help',
    a: 'all',
    p: 'pattern',
    o: 'output',
    u: 'create-utils',
    m: 'comprehensive'
  }
});

// Show help if requested
if (argv.help) {
  console.log(`
${chalk.bold('Tech Stack Alignment System')}
A modern validation and fixing tool for React 19, Next.js 15, and Tailwind CSS v4 projects

${chalk.yellow('Usage:')}
  npx tsx component-validator.ts [options]

${chalk.yellow('Options:')}
  ${chalk.cyan('-c, --component')}    Validate a specific component
  ${chalk.cyan('-d, --dir')}          Directory to validate (default: src/components/ui)
  ${chalk.cyan('-p, --pattern')}      Glob pattern for components (default: **/*.tsx)
  ${chalk.cyan('-f, --fix')}          Apply fixes automatically
  ${chalk.cyan('-r, --report')}       Generate detailed report
  ${chalk.cyan('-j, --json')}         Output results as JSON
  ${chalk.cyan('-o, --output')}       Output file for report (default: stdout)
  
${chalk.yellow('Validation Scopes:')}
  ${chalk.cyan('-a, --all')}          Enable all basic validators
  ${chalk.cyan('-m, --comprehensive')} Enable comprehensive validation (all 2025 best practices)
  ${chalk.cyan('--component-only')}   Focus on component structure validation
  ${chalk.cyan('--project-structure')} Focus on project structure validation
  
${chalk.yellow('Technology-specific:')}
  ${chalk.cyan('-t, --tailwind')}     Focus on Tailwind CSS v4 validation
  ${chalk.cyan('-s, --server')}       Focus on Server Component validation
  ${chalk.cyan('--react')}            Focus on React 19 validation
  ${chalk.cyan('--next')}             Focus on Next.js 15 validation
  ${chalk.cyan('--accessibility')}    Focus on accessibility validation
  
${chalk.yellow('Utilities:')}  
  ${chalk.cyan('-u, --create-utils')} Create utils.ts with cn() utility
  ${chalk.cyan('-h, --help')}         Show this help message

${chalk.yellow('Examples:')}
  # Validate all components in the default directory
  npx tsx component-validator.ts

  # Validate a specific component and fix issues
  npx tsx component-validator.ts --component=Button --fix

  # Validate only Tailwind CSS issues
  npx tsx component-validator.ts --tailwind

  # Generate a comprehensive report for the entire project
  npx tsx component-validator.ts --comprehensive --report
  `);
  process.exit(0);
}

// Set default options
const componentDir = argv.dir || 'src/components/ui';
const component = argv.component || '';
const pattern = argv.pattern || '**/*.tsx';
const doFix = argv.fix || false;
const generateReport = argv.report || false;
const outputJson = argv.json || false;
const outputFile = argv.output || '';
const focusTailwind = argv.tailwind || false;
const focusServer = argv.server || argv.react || false;
const focusNext = argv.next || false;
const focusAccessibility = argv.accessibility || false;
const componentOnly = argv['component-only'] || false;
const projectStructure = argv['project-structure'] || false;
const validateAll = argv.all || false;
const comprehensive = argv.comprehensive || false;
const createUtils = argv['create-utils'] || false;

// Configure validation options
const validationOptions: ValidationOptions = validateAll || comprehensive
  ? { comprehensive: true }
  : {
      // React 19 validation
      expectServerComponents: focusServer,
      requireReact19Features: focusServer,
      checkServerOnlyCode: focusServer,
      validateModernHooks: focusServer,
      validateActionsPattern: focusServer,
      
      // Component structure
      validateDisplayName: componentOnly || true,
      validatePropsInterface: componentOnly || true,
      validateForwardRef: componentOnly || true,
      
      // Accessibility
      validateDataTestId: focusAccessibility || true,
      validateAriaAttributes: focusAccessibility || focusTailwind,
      validateSemanticHTML: focusAccessibility || focusTailwind,
      
      // Tailwind validation
      checkTailwindPatterns: focusTailwind,
      validateCVA: focusTailwind,
      validateColorSystem: focusTailwind,
      validateClassMerging: focusTailwind,
      
      // Testing
      validateGhostClasses: true,
      
      // Next.js validation
      validateAppRouter: focusNext,
      validateMetadata: focusNext
    };

// Create utils file if requested
if (createUtils) {
  createUtilsFile();
}

// Start validation process
console.log(chalk.blue.bold('\n🧠 Tech Stack Alignment System\n'));

// Validate the components
let results;
if (component) {
  // Validate specific component
  const componentPaths = [
    path.join(componentDir, `${component}.tsx`),
    path.join(componentDir, `${component.toLowerCase()}.tsx`),
    path.join(componentDir, `${component}/${component}.tsx`),
    path.join(componentDir, `${component.toLowerCase()}/${component.toLowerCase()}.tsx`),
    path.join(componentDir, `${component}/index.tsx`),
    path.join(componentDir, `${component.toLowerCase()}/index.tsx`)
  ];
  
  let componentPath = '';
  for (const p of componentPaths) {
    if (fs.existsSync(p)) {
      componentPath = p;
      break;
    }
  }
  
  if (!componentPath) {
    console.error(chalk.red(`❌ Component "${component}" not found in ${componentDir}`));
    process.exit(1);
  }
  
  console.log(chalk.yellow(`Validating component: ${component}`));
  results = [validateComponent(componentPath, validationOptions)];
} else {
  // Validate all components
  const globPattern = path.join(componentDir, pattern).replace(/\\/g, '/');
  console.log(chalk.yellow(`Validating components matching: ${globPattern}`));
  results = validateComponents(globPattern, validationOptions);
}

// Output results
console.log(chalk.green(`\n✅ Validated ${results.length} components\n`));

if (outputJson) {
  const jsonOutput = JSON.stringify(results, null, 2);
  if (outputFile) {
    fs.writeFileSync(outputFile, jsonOutput);
    console.log(chalk.green(`JSON results written to ${outputFile}`));
  } else {
    console.log(jsonOutput);
  }
} else if (generateReport) {
  const report = generateValidationReport(results);
  if (outputFile) {
    fs.writeFileSync(outputFile, report);
    console.log(chalk.green(`Report written to ${outputFile}`));
  } else {
    console.log(report);
  }
}

// Apply fixes if requested
if (doFix) {
  console.log(chalk.blue.bold('\n🔧 Applying Fixes\n'));
  const fixStats = applyFixes(results);
  console.log(chalk.green(`\n✅ Fixes applied: ${fixStats.fixed}`));
  console.log(chalk.yellow(`⚠️ Fixes skipped: ${fixStats.skipped}`));
  console.log(chalk.red(`❌ Fixes failed: ${fixStats.failed}`));
}

// Create a simple summary
const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
const componentsWithIssues = results.filter(r => r.issues.length > 0).length;
const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

console.log(chalk.blue.bold('\n📊 Summary\n'));
console.log(`Components scanned: ${results.length}`);
console.log(`Components with issues: ${componentsWithIssues}`);
console.log(`Total issues found: ${totalIssues}`);
console.log(`Average health score: ${averageScore}%`);

// Exit with appropriate code for CI pipelines
if (totalIssues > 0 && !doFix) {
  process.exit(1);
} else {
  process.exit(0);
}