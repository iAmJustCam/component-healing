/**
 * Project Structure Validator
 * 
 * Validates the overall project structure against best practices for:
 * - React 19
 * - Next.js 15
 * - Tailwind CSS v4
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface ProjectIssue {
  type: 'error' | 'warning' | 'recommendation';
  message: string;
  context: string;
  solution: string;
  fixable: boolean;
}

export interface ProjectStructureResult {
  score: number;
  issues: ProjectIssue[];
  passedChecks: string[];
}

export interface ProjectValidationOptions {
  checkAppRouter?: boolean;
  checkReact19?: boolean;
  checkTailwind?: boolean;
  checkESM?: boolean;
  checkTypeScript?: boolean;
  checkAccessibility?: boolean;
  checkCSS?: boolean;
  checkDeps?: boolean;
  checkConfig?: boolean;
  checkAll?: boolean;
}

/**
 * Validates the project structure
 */
export function validateProjectStructure(
  projectRoot: string,
  options: ProjectValidationOptions = { checkAll: true }
): ProjectStructureResult {
  const issues: ProjectIssue[] = [];
  const passedChecks: string[] = [];

  // If checkAll is true, set all options to true
  if (options.checkAll) {
    options = {
      checkAll: true,
      checkAppRouter: true,
      checkReact19: true,
      checkTailwind: true,
      checkESM: true,
      checkTypeScript: true,
      checkAccessibility: true,
      checkCSS: true,
      checkDeps: true,
      checkConfig: true
    };
  }

  // Check Next.js App Router structure
  if (options.checkAppRouter) {
    const appDirExists = fs.existsSync(path.join(projectRoot, 'src/app')) || 
                         fs.existsSync(path.join(projectRoot, 'app'));
    
    if (!appDirExists) {
      issues.push({
        type: 'warning',
        message: 'Next.js App Router directory not found',
        context: 'Next.js 15 uses the App Router as the preferred routing system',
        solution: 'Create src/app directory and migrate from pages if using Pages Router',
        fixable: false
      });
    } else {
      passedChecks.push('Next.js App Router structure found');
      
      // Check for necessary App Router files
      const appDir = fs.existsSync(path.join(projectRoot, 'src/app')) ? 
                      path.join(projectRoot, 'src/app') :
                      path.join(projectRoot, 'app');
                      
      const hasLayoutFile = fs.existsSync(path.join(appDir, 'layout.tsx')) || 
                            fs.existsSync(path.join(appDir, 'layout.jsx'));
                            
      const hasPageFile = fs.existsSync(path.join(appDir, 'page.tsx')) || 
                          fs.existsSync(path.join(appDir, 'page.jsx'));
                          
      if (!hasLayoutFile) {
        issues.push({
          type: 'error',
          message: 'App Router layout.tsx file not found',
          context: 'Next.js App Router requires a root layout file',
          solution: 'Create app/layout.tsx with proper metadata and structure',
          fixable: false
        });
      } else {
        passedChecks.push('App Router root layout found');
      }
      
      if (!hasPageFile) {
        issues.push({
          type: 'warning',
          message: 'App Router page.tsx file not found',
          context: 'Next.js App Router typically has a root page file',
          solution: 'Create app/page.tsx for your homepage content',
          fixable: false
        });
      } else {
        passedChecks.push('App Router root page found');
      }
      
      // Check for error and loading states
      const hasErrorFile = fs.existsSync(path.join(appDir, 'error.tsx')) || 
                           fs.existsSync(path.join(appDir, 'error.jsx'));
                           
      const hasLoadingFile = fs.existsSync(path.join(appDir, 'loading.tsx')) || 
                             fs.existsSync(path.join(appDir, 'loading.jsx'));
                             
      const hasNotFoundFile = fs.existsSync(path.join(appDir, 'not-found.tsx')) || 
                              fs.existsSync(path.join(appDir, 'not-found.jsx'));
      
      if (!hasErrorFile) {
        issues.push({
          type: 'recommendation',
          message: 'App Router error.tsx file not found',
          context: 'Error boundaries help handle runtime errors gracefully',
          solution: 'Create app/error.tsx to handle runtime errors',
          fixable: false
        });
      } else {
        passedChecks.push('App Router error handling found');
      }
      
      if (!hasLoadingFile) {
        issues.push({
          type: 'recommendation',
          message: 'App Router loading.tsx file not found',
          context: 'Loading states provide better UX during page transitions',
          solution: 'Create app/loading.tsx to handle loading states',
          fixable: false
        });
      } else {
        passedChecks.push('App Router loading state found');
      }
      
      if (!hasNotFoundFile) {
        issues.push({
          type: 'recommendation',
          message: 'App Router not-found.tsx file not found',
          context: 'Custom 404 pages improve user experience',
          solution: 'Create app/not-found.tsx for 404 pages',
          fixable: false
        });
      } else {
        passedChecks.push('App Router 404 handling found');
      }
    }
  }

  // Check React 19 project structure
  if (options.checkReact19) {
    // Check for React version
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
      const reactVersion = packageJson.dependencies?.react || '';
      
      if (!reactVersion.startsWith('19')) {
        issues.push({
          type: 'warning',
          message: `React version is not 19 (found: ${reactVersion})`,
          context: 'React 19 includes modern features like Server Components and Actions',
          solution: 'Update React to version 19 in your package.json',
          fixable: false
        });
      } else {
        passedChecks.push('React 19 detected');
      }
      
      // Check for server components usage
      const componentsDir = fs.existsSync(path.join(projectRoot, 'src/components')) ? 
                           path.join(projectRoot, 'src/components') :
                           path.join(projectRoot, 'components');
                           
      if (fs.existsSync(componentsDir)) {
        const componentFiles = glob.sync(`${componentsDir}/**/*.{tsx,jsx}`);
        const clientComponents = componentFiles.filter(file => {
          const content = fs.readFileSync(file, 'utf-8');
          return content.includes('"use client"') || content.includes("'use client'");
        });
        
        const serverRatio = componentFiles.length > 0 ? 
                            (componentFiles.length - clientComponents.length) / componentFiles.length : 
                            0;
        
        if (serverRatio < 0.5 && componentFiles.length > 5) {
          issues.push({
            type: 'recommendation',
            message: `Low server component usage (${Math.round(serverRatio * 100)}%)`,
            context: 'Server Components reduce client-side JavaScript and improve performance',
            solution: 'Convert more components to Server Components by removing "use client" when possible',
            fixable: false
          });
        } else if (serverRatio >= 0.5) {
          passedChecks.push('Good balance of Server Components detected');
        }
      }
    } catch (error) {
      issues.push({
        type: 'error',
        message: 'Could not parse package.json',
        context: 'Package.json is required for dependency checking',
        solution: 'Ensure your package.json is valid JSON',
        fixable: false
      });
    }
  }

  // Check Tailwind CSS setup
  if (options.checkTailwind) {
    const tailwindConfigExists = fs.existsSync(path.join(projectRoot, 'tailwind.config.js')) || 
                                fs.existsSync(path.join(projectRoot, 'tailwind.config.ts')) ||
                                fs.existsSync(path.join(projectRoot, 'tailwind.config.mjs'));
    
    if (!tailwindConfigExists) {
      issues.push({
        type: 'warning',
        message: 'Tailwind CSS configuration file not found',
        context: 'Tailwind CSS requires a configuration file',
        solution: 'Create tailwind.config.js with appropriate settings',
        fixable: false
      });
    } else {
      passedChecks.push('Tailwind CSS configuration found');
      
      // Check for Tailwind v4 patterns
      try {
        let tailwindConfig: string;
        
        if (fs.existsSync(path.join(projectRoot, 'tailwind.config.js'))) {
          tailwindConfig = fs.readFileSync(path.join(projectRoot, 'tailwind.config.js'), 'utf-8');
        } else if (fs.existsSync(path.join(projectRoot, 'tailwind.config.ts'))) {
          tailwindConfig = fs.readFileSync(path.join(projectRoot, 'tailwind.config.ts'), 'utf-8');
        } else {
          tailwindConfig = fs.readFileSync(path.join(projectRoot, 'tailwind.config.mjs'), 'utf-8');
        }
        
        // Check for v4 specific features
        const isV4 = tailwindConfig.includes('colors:') && 
                     (tailwindConfig.includes('colorMix') || tailwindConfig.includes('color:'));
        
        if (!isV4) {
          issues.push({
            type: 'warning',
            message: 'Tailwind CSS configuration appears to be < v4',
            context: 'Tailwind CSS v4 has modern color system and improved features',
            solution: 'Update Tailwind CSS to v4 and use modern configuration patterns',
            fixable: false
          });
        } else {
          passedChecks.push('Tailwind CSS v4 configuration detected');
        }
      } catch (error) {
        issues.push({
          type: 'warning',
          message: 'Could not parse Tailwind configuration',
          context: 'Tailwind configuration file is invalid or has unexpected format',
          solution: 'Verify your Tailwind configuration file',
          fixable: false
        });
      }
    }
    
    // Check for proper CSS utilities structure
    const utilsFile = fs.existsSync(path.join(projectRoot, 'src/lib/utils.ts')) ? 
                     path.join(projectRoot, 'src/lib/utils.ts') :
                     path.join(projectRoot, 'lib/utils.ts');
                     
    if (!fs.existsSync(utilsFile)) {
      issues.push({
        type: 'warning',
        message: 'Tailwind CSS utilities file not found',
        context: 'Modern Tailwind usage requires a className merging utility',
        solution: 'Create src/lib/utils.ts with cn() utility function',
        fixable: true
      });
    } else {
      const utilsContent = fs.readFileSync(utilsFile, 'utf-8');
      
      if (!utilsContent.includes('cn(') && !utilsContent.includes('clsx(')) {
        issues.push({
          type: 'warning',
          message: 'Tailwind CSS cn() utility not found',
          context: 'Modern Tailwind usage requires a className merging utility',
          solution: 'Add cn() function using clsx and tailwind-merge',
          fixable: true
        });
      } else {
        passedChecks.push('Tailwind CSS utilities found');
      }
    }
  }

  // Check for ESM usage
  if (options.checkESM) {
    // Look for ESM patterns in package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
      
      const hasTypeModule = packageJson.type === 'module';
      const importsExports = packageJson.imports || packageJson.exports;
      
      if (!hasTypeModule && !importsExports) {
        issues.push({
          type: 'recommendation',
          message: 'Project not configured for modern ESM',
          context: 'Modern JavaScript projects benefit from ESM',
          solution: 'Consider adding "type": "module" to package.json',
          fixable: false
        });
      } else {
        passedChecks.push('ESM configuration found');
      }
    } catch (error) {
      // Already handled in React section
    }
  }

  // Check TypeScript configuration
  if (options.checkTypeScript) {
    const tsConfigExists = fs.existsSync(path.join(projectRoot, 'tsconfig.json'));
    
    if (!tsConfigExists) {
      issues.push({
        type: 'warning',
        message: 'TypeScript configuration not found',
        context: 'TypeScript provides type safety and better development experience',
        solution: 'Add tsconfig.json to your project',
        fixable: false
      });
    } else {
      passedChecks.push('TypeScript configuration found');
      
      // Check for modern TypeScript configuration
      try {
        const tsConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'tsconfig.json'), 'utf-8'));
        
        // Check for strict mode
        if (!tsConfig.compilerOptions?.strict) {
          issues.push({
            type: 'recommendation',
            message: 'TypeScript strict mode not enabled',
            context: 'Strict mode provides better type safety',
            solution: 'Enable "strict": true in tsconfig.json',
            fixable: false
          });
        } else {
          passedChecks.push('TypeScript strict mode enabled');
        }
        
        // Check for modern target
        const target = tsConfig.compilerOptions?.target || '';
        if (target && !['es2022', 'esnext', 'es2023'].includes(target.toLowerCase())) {
          issues.push({
            type: 'recommendation',
            message: `TypeScript target is not modern (found: ${target})`,
            context: 'Modern targets enable use of newer JavaScript features',
            solution: 'Set "target": "ES2022" or newer in tsconfig.json',
            fixable: false
          });
        } else if (target) {
          passedChecks.push('Modern TypeScript target found');
        }
      } catch (error) {
        issues.push({
          type: 'warning',
          message: 'Could not parse tsconfig.json',
          context: 'TypeScript configuration file is invalid',
          solution: 'Verify your tsconfig.json is valid JSON',
          fixable: false
        });
      }
    }
  }

  // Check CSS structure
  if (options.checkCSS) {
    // Look for global CSS file
    const globalCSSExists = fs.existsSync(path.join(projectRoot, 'src/app/globals.css')) || 
                           fs.existsSync(path.join(projectRoot, 'app/globals.css')) ||
                           fs.existsSync(path.join(projectRoot, 'src/styles/globals.css'));
    
    if (!globalCSSExists) {
      issues.push({
        type: 'recommendation',
        message: 'Global CSS file not found',
        context: 'A global CSS file is typically used for base styles',
        solution: 'Create a globals.css file in your app or styles directory',
        fixable: false
      });
    } else {
      passedChecks.push('Global CSS file found');
    }
    
    // Check for CSS modules
    const componentDirs = [
      path.join(projectRoot, 'src/components'),
      path.join(projectRoot, 'components')
    ].filter(dir => fs.existsSync(dir));
    
    if (componentDirs.length > 0) {
      let cssModulesCount = 0;
      
      for (const dir of componentDirs) {
        const cssModuleFiles = glob.sync(`${dir}/**/*.module.css`);
        cssModulesCount += cssModuleFiles.length;
      }
      
      if (cssModulesCount === 0) {
        issues.push({
          type: 'recommendation',
          message: 'No CSS modules found',
          context: 'CSS modules provide scoped styling for components',
          solution: 'Consider using CSS modules for component styling',
          fixable: false
        });
      } else {
        passedChecks.push('CSS modules found');
      }
    }
  }

  // Check dependencies
  if (options.checkDeps) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
      
      // Check for outdated React 
      const reactDom = packageJson.dependencies?.['react-dom'] || '';
      
      if (reactDom && !reactDom.startsWith('19')) {
        issues.push({
          type: 'warning',
          message: `react-dom version is not 19 (found: ${reactDom})`,
          context: 'React 19 requires matching react-dom version',
          solution: 'Update react-dom to version 19 in your package.json',
          fixable: false
        });
      }
      
      // Check for modern NextJS
      const nextVersion = packageJson.dependencies?.next || '';
      
      if (nextVersion && !nextVersion.startsWith('14') && !nextVersion.startsWith('15')) {
        issues.push({
          type: 'warning',
          message: `Next.js version is not 14+ (found: ${nextVersion})`,
          context: 'Modern Next.js provides improved features and performance',
          solution: 'Update Next.js to version 14 or 15 in your package.json',
          fixable: false
        });
      } else if (nextVersion) {
        passedChecks.push('Modern Next.js version found');
      }
      
      // Check for modern Tailwind
      const tailwindVersion = packageJson.devDependencies?.tailwindcss || '';
      
      if (tailwindVersion && !tailwindVersion.startsWith('4')) {
        issues.push({
          type: 'warning',
          message: `Tailwind CSS version is not 4 (found: ${tailwindVersion})`,
          context: 'Tailwind CSS v4 provides improved features and performance',
          solution: 'Update Tailwind CSS to version 4 in your package.json',
          fixable: false
        });
      } else if (tailwindVersion && tailwindVersion.startsWith('4')) {
        passedChecks.push('Tailwind CSS v4 found');
      }
      
      // Check for essential utilities
      const hasClsx = packageJson.dependencies?.clsx || packageJson.devDependencies?.clsx;
      const hasTailwindMerge = packageJson.dependencies?.['tailwind-merge'] || packageJson.devDependencies?.['tailwind-merge'];
      
      if (!hasClsx || !hasTailwindMerge) {
        issues.push({
          type: 'warning',
          message: 'Missing essential Tailwind utilities',
          context: 'clsx and tailwind-merge are needed for proper className management',
          solution: 'Install clsx and tailwind-merge as dev dependencies',
          fixable: false
        });
      } else {
        passedChecks.push('Tailwind utilities found');
      }
    } catch (error) {
      // Already handled in React section
    }
  }

  // Check Next.js config
  if (options.checkConfig) {
    const nextConfigExists = fs.existsSync(path.join(projectRoot, 'next.config.js')) || 
                             fs.existsSync(path.join(projectRoot, 'next.config.mjs'));
    
    if (!nextConfigExists) {
      issues.push({
        type: 'recommendation',
        message: 'Next.js configuration file not found',
        context: 'A Next.js config file can optimize your application',
        solution: 'Create next.config.js with appropriate settings',
        fixable: false
      });
    } else {
      passedChecks.push('Next.js configuration found');
    }
    
    // Check PostCSS config
    const postCSSConfigExists = fs.existsSync(path.join(projectRoot, 'postcss.config.js')) ||
                               fs.existsSync(path.join(projectRoot, 'postcss.config.mjs'));
    
    if (!postCSSConfigExists) {
      issues.push({
        type: 'recommendation',
        message: 'PostCSS configuration file not found',
        context: 'PostCSS is required for Tailwind CSS',
        solution: 'Create postcss.config.js with Tailwind CSS plugin',
        fixable: false
      });
    } else {
      passedChecks.push('PostCSS configuration found');
    }
  }

  // Calculate score
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const recommendationCount = issues.filter(i => i.type === 'recommendation').length;
  
  // Score calculation: 100 - (errors*15 + warnings*5 + recommendations*2)
  const score = Math.max(0, 100 - (errorCount * 15 + warningCount * 5 + recommendationCount * 2));

  return {
    score,
    issues,
    passedChecks
  };
}

/**
 * Generate a human-readable report of project structure issues
 */
export function generateProjectStructureReport(result: ProjectStructureResult): string {
  const { score, issues, passedChecks } = result;
  let report = '\n📊 Project Structure Report\n\n';
  
  // Add score and summary
  report += `Project Score: ${score}%\n`;
  report += `Passed Checks: ${passedChecks.length}\n`;
  report += `Issues Found: ${issues.length}\n\n`;
  
  // List passed checks
  if (passedChecks.length > 0) {
    report += '✅ Passed Checks:\n';
    passedChecks.forEach(check => {
      report += `  - ${check}\n`;
    });
    report += '\n';
  }
  
  // Group issues by type
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const recommendations = issues.filter(i => i.type === 'recommendation');
  
  // Add errors
  if (errors.length > 0) {
    report += '❌ Errors:\n';
    errors.forEach(issue => {
      report += `  - ${issue.message}\n`;
      report += `    Context: ${issue.context}\n`;
      report += `    Solution: ${issue.solution}\n\n`;
    });
  }
  
  // Add warnings
  if (warnings.length > 0) {
    report += '⚠️ Warnings:\n';
    warnings.forEach(issue => {
      report += `  - ${issue.message}\n`;
      report += `    Context: ${issue.context}\n`;
      report += `    Solution: ${issue.solution}\n\n`;
    });
  }
  
  // Add recommendations
  if (recommendations.length > 0) {
    report += '💡 Recommendations:\n';
    recommendations.forEach(issue => {
      report += `  - ${issue.message}\n`;
      report += `    Context: ${issue.context}\n`;
      report += `    Solution: ${issue.solution}\n\n`;
    });
  }
  
  return report;
}