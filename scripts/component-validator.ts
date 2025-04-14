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

import {
  validateProjectStructure,
  generateProjectStructureReport
} from './modules/project-validator';

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

// Debug flags if needed
// console.log("Flags:", {
//   dir: componentDir, component, pattern, doFix, report: generateReport,
//   json: outputJson, output: outputFile, tailwind: focusTailwind, server: focusServer,
//   next: focusNext, accessibility: focusAccessibility, componentOnly, projectStructure,
//   all: validateAll, comprehensive, createUtils
// });

// Configure validation options
const validationOptions: ValidationOptions = comprehensive 
  ? { comprehensive: true }
  : {
      // React 19 validation
      expectServerComponents: validateAll || focusServer,
      requireReact19Features: validateAll || focusServer,
      checkServerOnlyCode: validateAll || focusServer,
      validateModernHooks: validateAll || focusServer,
      validateActionsPattern: validateAll || focusServer,
      
      // Component structure
      validateDisplayName: validateAll || componentOnly || !focusServer && !focusTailwind && !focusNext && !focusAccessibility,
      validatePropsInterface: validateAll || componentOnly || !focusServer && !focusTailwind && !focusNext && !focusAccessibility,
      validateForwardRef: validateAll || componentOnly || !focusServer && !focusTailwind && !focusNext && !focusAccessibility,
      
      // Accessibility
      validateDataTestId: validateAll || focusAccessibility || !focusServer && !focusTailwind && !focusNext && !componentOnly,
      validateAriaAttributes: validateAll || focusAccessibility || !focusServer && !focusTailwind && !focusNext && !componentOnly,
      validateSemanticHTML: validateAll || focusAccessibility || !focusServer && !focusTailwind && !focusNext && !componentOnly,
      
      // Tailwind validation
      checkTailwindPatterns: validateAll || focusTailwind,
      validateCVA: validateAll || focusTailwind,
      validateColorSystem: validateAll || focusTailwind,
      validateClassMerging: validateAll || focusTailwind,
      
      // Testing
      validateGhostClasses: validateAll || componentOnly || !focusServer && !focusTailwind && !focusNext && !focusAccessibility,
      
      // Next.js validation
      validateAppRouter: validateAll || focusNext,
      validateMetadata: validateAll || focusNext
    };

// Create utils file if requested
if (createUtils) {
  createUtilsFile();
}

// Start validation process
console.log(chalk.blue.bold('\n🧠 Tech Stack Alignment System\n'));

// Track if we need to run component validation, project validation, or both
const shouldValidateComponents = !projectStructure; // Skip component validation if only project structure is requested
const shouldValidateProject = projectStructure || comprehensive || validateAll; // Always validate project structure for comprehensive checks

// Track both component and project results
let componentResults = [];
let projectResult = null;

// Validate components if needed
if (shouldValidateComponents) {
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
    componentResults = [validateComponent(componentPath, validationOptions)];
  } else {
    // Validate all components
    const globPattern = path.join(componentDir, pattern).replace(/\\/g, '/');
    console.log(chalk.yellow(`Validating components matching: ${globPattern}`));
    componentResults = validateComponents(globPattern, validationOptions);
  }

  // Output component validation results
  console.log(chalk.green(`\n✅ Validated ${componentResults.length} components\n`));
}

// Validate project structure if needed
if (shouldValidateProject) {
  console.log(chalk.yellow('Validating project structure...'));
  
  // Determine project root
  const projectRoot = process.cwd();
  
  // Determine which project checks to run
  const projectOptions = {
    checkAll: comprehensive || validateAll,
    checkAppRouter: comprehensive || validateAll || focusNext,
    checkReact19: comprehensive || validateAll || focusServer,
    checkTailwind: comprehensive || validateAll || focusTailwind,
    checkESM: comprehensive || validateAll,
    checkTypeScript: comprehensive || validateAll,
    checkAccessibility: comprehensive || validateAll || focusAccessibility,
    checkCSS: comprehensive || validateAll || focusTailwind,
    checkDeps: comprehensive || validateAll,
    checkConfig: comprehensive || validateAll
  };
  
  // Run project structure validation
  projectResult = validateProjectStructure(projectRoot, projectOptions);
  
  console.log(chalk.green(`\n✅ Project structure validation complete (Score: ${projectResult.score}%)\n`));
}

// Output results (handle both component and project results)
if (outputJson) {
  const jsonOutput = JSON.stringify({
    components: componentResults,
    project: projectResult
  }, null, 2);
  
  if (outputFile) {
    fs.writeFileSync(outputFile, jsonOutput);
    console.log(chalk.green(`JSON results written to ${outputFile}`));
  } else {
    console.log(jsonOutput);
  }
} else if (generateReport) {
  let report = '';
  
  // Add component validation report if available
  if (componentResults.length > 0) {
    report += generateValidationReport(componentResults);
  }
  
  // Add project structure report if available
  if (projectResult) {
    report += generateProjectStructureReport(projectResult);
  }
  
  if (outputFile) {
    fs.writeFileSync(outputFile, report);
    console.log(chalk.green(`Report written to ${outputFile}`));
  } else {
    console.log(report);
  }
}

// Apply fixes if requested (only for components for now)
if (doFix && componentResults.length > 0) {
  console.log(chalk.blue.bold('\n🔧 Applying Fixes\n'));
  const fixStats = applyFixes(componentResults);
  console.log(chalk.green(`\n✅ Fixes applied: ${fixStats.fixed}`));
  console.log(chalk.yellow(`⚠️ Fixes skipped: ${fixStats.skipped}`));
  console.log(chalk.red(`❌ Fixes failed: ${fixStats.failed}`));
}

// Create a combined summary
console.log(chalk.blue.bold('\n📊 Summary\n'));

// Component summary
if (componentResults.length > 0) {
  const totalComponentIssues = componentResults.reduce((sum, r) => sum + r.issues.length, 0);
  const componentsWithIssues = componentResults.filter(r => r.issues.length > 0).length;
  const averageComponentScore = Math.round(componentResults.reduce((sum, r) => sum + r.score, 0) / componentResults.length);
  
  console.log(chalk.yellow('Component Health:'));
  console.log(`  Components scanned: ${componentResults.length}`);
  console.log(`  Components with issues: ${componentsWithIssues}`);
  console.log(`  Component issues found: ${totalComponentIssues}`);
  console.log(`  Average component score: ${averageComponentScore}%`);
}

// Project structure summary
if (projectResult) {
  const passedCount = projectResult.passedChecks.length;
  const issueCount = projectResult.issues.length;
  
  console.log(chalk.yellow('Project Structure Health:'));
  console.log(`  Checks passed: ${passedCount}`);
  console.log(`  Issues found: ${issueCount}`);
  console.log(`  Project structure score: ${projectResult.score}%`);
}

// Overall score (weighted average)
if (componentResults.length > 0 && projectResult) {
  const averageComponentScore = componentResults.reduce((sum, r) => sum + r.score, 0) / componentResults.length;
  const overallScore = Math.round((averageComponentScore * 0.6) + (projectResult.score * 0.4));
  console.log(chalk.green(`\nOverall Project Health Score: ${overallScore}%`));
}

// Exit with appropriate code for CI pipelines
const hasIssues = 
  (componentResults.length > 0 && componentResults.some(r => r.issues.length > 0)) || 
  (projectResult && projectResult.issues.length > 0);

if (hasIssues && !doFix) {
  process.exit(1);
} else {
  process.exit(0);
}