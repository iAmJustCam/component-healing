/**
 * Unified Component Validator
 * 
 * A comprehensive validator for React components that checks:
 * - React 19 best practices
 * - Tailwind CSS v4 patterns
 * - Component structure and accessibility
 * - Server component compatibility
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Common interfaces for validation results
export interface ValidationIssue {
  type: 'error' | 'warning' | 'recommendation';
  message: string;
  code: string;
  fixable: boolean;
}

export interface ComponentValidationResult {
  componentPath: string;
  componentName: string;
  issues: ValidationIssue[];
  score: number;
}

export interface ValidationFixer {
  code: string;
  description: string;
  apply: (componentPath: string, sourceCode: string) => string | false;
}

export interface ValidationOptions {
  // React 19 validation options
  expectServerComponents?: boolean;
  requireReact19Features?: boolean;
  checkServerOnlyCode?: boolean;
  validateModernHooks?: boolean;
  validateActionsPattern?: boolean;
  
  // Component structure validation
  validateDisplayName?: boolean;
  validatePropsInterface?: boolean;
  validateForwardRef?: boolean;
  
  // Accessibility validation
  validateDataTestId?: boolean;
  validateAriaAttributes?: boolean;
  validateSemanticHTML?: boolean;
  
  // Tailwind validation options
  checkTailwindPatterns?: boolean;
  validateCVA?: boolean;
  validateColorSystem?: boolean;
  validateClassMerging?: boolean;
  
  // Testing validation
  validateGhostClasses?: boolean;
  validateSnapshotTests?: boolean;
  
  // Next.js validation
  validateAppRouter?: boolean;
  validateMetadata?: boolean;
  
  // Comprehensive validation
  comprehensive?: boolean; // Enables all checks
}

// Registry of available fixers
const FIXERS: Record<string, ValidationFixer> = {
  'missing-displayname': {
    code: 'missing-displayname',
    description: 'Add displayName property to component',
    apply: (componentPath, sourceCode) => {
      const componentName = getComponentNameFromPath(componentPath);
      
      // Check if already has displayName
      if (sourceCode.includes(`${componentName}.displayName`)) {
        return false;
      }

      // Find the component definitions
      const componentDefinitions = [];
      
      // Check for function components
      const funcRegex = /function\s+([A-Z][a-zA-Z0-9]*)/g;
      let match;
      while ((match = funcRegex.exec(sourceCode)) !== null) {
        componentDefinitions.push(match[1]);
      }
      
      // Check for arrow function components
      const arrowFuncRegex = /const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(\([^)]*\)|[^=]*)\s*=>/g;
      while ((match = arrowFuncRegex.exec(sourceCode)) !== null) {
        componentDefinitions.push(match[1]);
      }
      
      // Check if there are any named exports
      const exportStatement = sourceCode.match(/export\s+{([^}]+)}/);
      if (!exportStatement) {
        return false;
      }
      
      // Find which components are exported
      const exports = exportStatement[1].split(',').map(e => e.trim());
      
      // Add displayName to each exported component
      let newCode = sourceCode;
      let modified = false;
      
      for (const compName of componentDefinitions) {
        if (exports.includes(compName) && !newCode.includes(`${compName}.displayName`)) {
          // Find the position before the export
          const exportIndex = newCode.indexOf('export {');
          if (exportIndex === -1) continue;
          
          // Add displayName before export
          newCode = 
            newCode.slice(0, exportIndex) + 
            `${compName}.displayName = "${compName}";\n\n` + 
            newCode.slice(exportIndex);
          
          modified = true;
        }
      }
      
      return modified ? newCode : false;
    }
  },
  
  'missing-data-testid': {
    code: 'missing-data-testid',
    description: 'Add data-testid attribute to component',
    apply: (componentPath, sourceCode) => {
      const componentName = getComponentNameFromPath(componentPath);
      
      // Check if already has data-testid
      if (sourceCode.includes('data-testid')) {
        return false;
      }
      
      // Find component return statements with JSX
      const jsxMatches = Array.from(sourceCode.matchAll(/<([a-z][a-zA-Z0-9]*)[^>]*?>/g));
      if (jsxMatches.length === 0) {
        return false;
      }
      
      // Apply data-testid to the first tag of each component
      let newCode = sourceCode;
      let modified = false;
      
      // Find all component functions
      const functionMatches = Array.from(sourceCode.matchAll(/function\s+([A-Z][a-zA-Z0-9]*)/g));
      
      for (const [, funcName] of functionMatches) {
        // Find the function's content
        const funcRegex = new RegExp(`function\\s+${funcName}[\\s\\S]*?return\\s*\\([\\s\\S]*?<([a-z][a-zA-Z0-9]*)[^>]*?>`, 'g');
        const funcMatch = funcRegex.exec(newCode);
        
        if (funcMatch) {
          const tagName = funcMatch[1];
          const fullTagMatch = funcMatch[0];
          const tagPosition = fullTagMatch.lastIndexOf(`<${tagName}`);
          
          if (tagPosition !== -1) {
            const tagPart = fullTagMatch.substring(tagPosition);
            
            // Don't add data-testid if it already exists
            if (!tagPart.includes('data-testid')) {
              const replacement = fullTagMatch.substring(0, tagPosition) + 
                tagPart.replace(`<${tagName}`, `<${tagName} data-testid="${funcName.toLowerCase()}"`);
              
              newCode = newCode.replace(fullTagMatch, replacement);
              modified = true;
            }
          }
        }
      }
      
      // Also check arrow function components
      const arrowFunctionMatches = Array.from(sourceCode.matchAll(/const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(\([^)]*\)|[^=]*)\s*=>/g));
      
      for (const [, funcName] of arrowFunctionMatches) {
        // Find the component's return statement
        const funcRegex = new RegExp(`const\\s+${funcName}[\\s\\S]*?return\\s*\\([\\s\\S]*?<([a-z][a-zA-Z0-9]*)[^>]*?>`, 'g');
        const funcMatch = funcRegex.exec(newCode);
        
        if (funcMatch) {
          const tagName = funcMatch[1];
          const fullTagMatch = funcMatch[0];
          const tagPosition = fullTagMatch.lastIndexOf(`<${tagName}`);
          
          if (tagPosition !== -1) {
            const tagPart = fullTagMatch.substring(tagPosition);
            
            if (!tagPart.includes('data-testid')) {
              const replacement = fullTagMatch.substring(0, tagPosition) + 
                tagPart.replace(`<${tagName}`, `<${tagName} data-testid="${funcName.toLowerCase()}"`);
              
              newCode = newCode.replace(fullTagMatch, replacement);
              modified = true;
            }
          }
        }
      }
      
      return modified ? newCode : false;
    }
  },
  
  'add-cn-utility': {
    code: 'add-cn-utility',
    description: 'Add className merging with cn utility',
    apply: (componentPath, sourceCode) => {
      // Check if cn is already imported
      if (sourceCode.includes('import { cn }') || sourceCode.includes('import {cn}')) {
        // Check if it's actually used
        const hasClsxImport = sourceCode.includes('import { clsx }') || sourceCode.includes('import clsx');
        const hasTwMergeImport = sourceCode.includes('import { twMerge }') || sourceCode.includes('import twMerge');
        
        // If imports exist but aren't used correctly, we should try to fix usage
        if (!sourceCode.includes('cn(') && sourceCode.includes('className={')) {
          // Fix usage without changing imports
        } else {
          return false; // Already has correct imports and usage
        }
      }
      
      // Add import if needed
      let newCode = sourceCode;
      
      // First check if we need to create utils.ts
      const isUtilsCreated = createUtilsFile();
      
      if (!sourceCode.includes('import { cn }') && !sourceCode.includes('import {cn}')) {
        // Find a good spot to add the import
        const importLines = sourceCode
          .split('\n')
          .filter(line => line.trim().startsWith('import '));
        
        if (importLines.length > 0) {
          const lastImportLine = importLines[importLines.length - 1];
          const lastImportIndex = sourceCode.indexOf(lastImportLine) + lastImportLine.length;
          
          newCode = 
            sourceCode.substring(0, lastImportIndex) + 
            '\nimport { cn } from "@/lib/utils";' + 
            sourceCode.substring(lastImportIndex);
        } else {
          // No imports found, add at the top
          newCode = 'import { cn } from "@/lib/utils";\n' + sourceCode;
        }
      }
      
      // Fix string concatenation in className
      newCode = newCode.replace(
        /className={\s*(`|"|')(.+?)(`|"|')\s*\+\s*(.+?)\s*}/g,
        'className={cn("$2", $4)}'
      );
      
      // Fix template literals
      newCode = newCode.replace(
        /className={\s*`([^$]*)\${([^}]+)}([^`]*)`\s*}/g,
        'className={cn("$1$3", $2)}'
      );
      
      // Fix simple className attributes without cn
      if (newCode.includes('className=') && !newCode.includes('cn(')) {
        newCode = newCode.replace(
          /className={\s*"([^"]*)"\s*}/g,
          'className={cn("$1")}'
        );
        
        newCode = newCode.replace(
          /className={\s*'([^']*)'\s*}/g,
          "className={cn('$1')}"
        );
      }
      
      return newCode !== sourceCode ? newCode : false;
    }
  },
  
  'add-ghost-classes': {
    code: 'add-ghost-classes',
    description: 'Add ghost classes for testing',
    apply: (componentPath, sourceCode) => {
      const componentName = getComponentNameFromPath(componentPath);
      
      // Check if already has ghost classes
      if (sourceCode.includes('ghost') || sourceCode.includes('test-variant')) {
        return false;
      }
      
      // Find components that use className
      let newCode = sourceCode;
      let modified = false;
      
      // Get all component names from function declarations
      const componentNames = [];
      const functionMatches = Array.from(sourceCode.matchAll(/function\s+([A-Z][a-zA-Z0-9]*)/g));
      const arrowFunctionMatches = Array.from(sourceCode.matchAll(/const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(\([^)]*\)|[^=]*)\s*=>/g));
      
      for (const [, funcName] of functionMatches) {
        componentNames.push(funcName);
      }
      
      for (const [, funcName] of arrowFunctionMatches) {
        componentNames.push(funcName);
      }
      
      // First ensure cn is imported
      if (!newCode.includes('import { cn }') && !newCode.includes('import {cn}')) {
        const importLines = newCode.split('\n').filter(line => line.trim().startsWith('import '));
        
        if (importLines.length > 0) {
          const lastImportLine = importLines[importLines.length - 1];
          const lastImportIndex = newCode.indexOf(lastImportLine) + lastImportLine.length;
          
          newCode = 
            newCode.substring(0, lastImportIndex) + 
            '\nimport { cn } from "@/lib/utils";' + 
            newCode.substring(lastImportIndex);
          
          modified = true;
        }
      }
      
      // Add ghost classes to each className attribute
      for (const compName of componentNames) {
        // First try to find className with cn()
        const classNameRegex = new RegExp(`(className={cn\\()(.+?)(\\)})`, 'g');
        
        newCode = newCode.replace(classNameRegex, (match, prefix, content, suffix) => {
          if (match.includes('ghost')) return match; // Skip if already has ghost class
          
          modified = true;
          return `${prefix}${content}, process.env.NODE_ENV === 'test' ? 'ghost ghost-${compName.toLowerCase()}' : ''${suffix}`;
        });
        
        // If the component doesn't use cn() but has className
        const simpleClassNameRegex = new RegExp(`(className={)([^}]+)(})`, 'g');
        newCode = newCode.replace(simpleClassNameRegex, (match, prefix, content, suffix) => {
          if (match.includes('ghost')) return match; // Skip if already has ghost class
          if (match.includes('cn(')) return match; // Skip if already using cn()
          
          modified = true;
          return `${prefix}cn(${content}, process.env.NODE_ENV === 'test' ? 'ghost ghost-${compName.toLowerCase()}' : '')${suffix}`;
        });
      }
      
      return modified ? newCode : false;
    }
  },
  
  'convert-to-server-component': {
    code: 'convert-to-server-component',
    description: 'Convert to Server Component',
    apply: (componentPath, sourceCode) => {
      // Don't apply if it uses client-side hooks
      if (
        sourceCode.includes('useState') || 
        sourceCode.includes('useEffect') ||
        sourceCode.includes('useRef') ||
        sourceCode.includes('useContext') ||
        sourceCode.includes('createContext')
      ) {
        return false;
      }
      
      // Remove use client directive
      const result = sourceCode
        .replace(/'use client';\s*\n/g, '')
        .replace(/"use client";\s*\n/g, '');
      
      return result !== sourceCode ? result : false;
    }
  },
  
  'fix-tailwind-deprecated': {
    code: 'fix-tailwind-deprecated',
    description: 'Fix deprecated Tailwind classes',
    apply: (componentPath, sourceCode) => {
      let newCode = sourceCode;
      let modified = false;
      
      // Fix opacity utility classes
      const opacityPattern = /(text|bg|border|divide|placeholder|ring)-([a-z0-9-]+)\s+(text|bg|border|divide|placeholder|ring)-opacity-(\d+)/g;
      
      newCode = newCode.replace(opacityPattern, (match, type, color, _, opacity) => {
        modified = true;
        return `${type}-${color}/${opacity}`;
      });
      
      // Fix direct opacity classes
      newCode = newCode.replace(/opacity-(\d+)/g, (match, opacity) => {
        // Only replace if it's a standalone class, not part of another word
        if (sourceCode.includes(`text-opacity-${opacity}`) || 
            sourceCode.includes(`bg-opacity-${opacity}`) ||
            sourceCode.includes(`border-opacity-${opacity}`)) {
          return match; // Don't replace, will be handled by the pattern above
        }
        
        modified = true;
        return `opacity-${opacity}/100`;
      });
      
      // Fix deprecated positioning utilities
      const positionReplacements = {
        'object-left-top': 'object-top-left',
        'object-right-top': 'object-top-right',
        'object-left-bottom': 'object-bottom-left',
        'object-right-bottom': 'object-bottom-right',
        'bg-left-top': 'bg-top-left',
        'bg-right-top': 'bg-top-right',
        'bg-left-bottom': 'bg-bottom-left',
        'bg-right-bottom': 'bg-bottom-right'
      };
      
      for (const [deprecated, replacement] of Object.entries(positionReplacements)) {
        if (newCode.includes(deprecated)) {
          newCode = newCode.replace(new RegExp(deprecated, 'g'), replacement);
          modified = true;
        }
      }
      
      return modified ? newCode : false;
    }
  },
  
  'missing-props-interface': {
    code: 'missing-props-interface',
    description: 'Add props interface',
    apply: (componentPath, sourceCode) => {
      const componentName = getComponentNameFromPath(componentPath);
      
      // Check if already has props interface
      if (sourceCode.includes('interface') && 
          (sourceCode.includes('Props') || sourceCode.includes('props:'))) {
        return false;
      }
      
      let newCode = sourceCode;
      let modified = false;
      
      // Find component definition
      const funcMatch = sourceCode.match(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(\s*(\{[^}]*\}|\w+)\s*\)/);
      const arrowFuncMatch = sourceCode.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(\s*(\{[^}]*\}|\w+)\s*\)/);
      
      if (funcMatch || arrowFuncMatch) {
        const match = funcMatch || arrowFuncMatch;
        const compName = match[1];
        const propsParam = match[2];
        
        // Find the right spot to add the interface
        const importLines = sourceCode.split('\n').filter(line => line.trim().startsWith('import '));
        let insertPoint = 0;
        
        if (importLines.length > 0) {
          const lastImportLine = importLines[importLines.length - 1];
          insertPoint = sourceCode.indexOf(lastImportLine) + lastImportLine.length + 1;
        }
        
        // Create a basic interface
        let interfaceCode = `\ninterface ${compName}Props {\n  className?: string;\n}\n\n`;
        
        // Insert the interface
        newCode = 
          newCode.substring(0, insertPoint) + 
          interfaceCode + 
          newCode.substring(insertPoint);
        
        // Now update the component signature
        if (funcMatch) {
          newCode = newCode.replace(
            /function\s+([A-Z][a-zA-Z0-9]*)\s*\(\s*(\{[^}]*\}|\w+)\s*\)/,
            `function $1(props: ${compName}Props)`
          );
        } else {
          newCode = newCode.replace(
            /const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(\s*(\{[^}]*\}|\w+)\s*\)/,
            `const $1 = (props: ${compName}Props)`
          );
        }
        
        modified = true;
      }
      
      return modified ? newCode : false;
    }
  },
  
  'missing-aria-attributes': {
    code: 'missing-aria-attributes',
    description: 'Add basic ARIA attributes',
    apply: (componentPath, sourceCode) => {
      // This is complex and depends on component semantics
      // Implementing a basic version that adds role to common elements
      
      let newCode = sourceCode;
      let modified = false;
      
      // Add roles to common elements if they don't have one
      if (sourceCode.includes('<button') && !sourceCode.includes('role=')) {
        newCode = newCode.replace(
          /<button([^>]*?)>/g,
          '<button$1 role="button">'
        );
        modified = true;
      }
      
      if (sourceCode.includes('<a ') && !sourceCode.includes('role=')) {
        newCode = newCode.replace(
          /<a([^>]*?)>/g,
          '<a$1 role="link">'
        );
        modified = true;
      }
      
      // Add aria-label to interactive elements without one
      if (sourceCode.includes('onClick') && !sourceCode.includes('aria-label')) {
        const componentName = getComponentNameFromPath(componentPath);
        
        newCode = newCode.replace(
          /onClick={([^}]+)}/g,
          `onClick={$1} aria-label="${componentName} action"`
        );
        modified = true;
      }
      
      return modified ? newCode : false;
    }
  },
  
  'missing-forward-ref': {
    code: 'missing-forward-ref',
    description: 'Add forwardRef to component',
    apply: (componentPath, sourceCode) => {
      const componentName = getComponentNameFromPath(componentPath);
      
      // Check if already uses forwardRef
      if (sourceCode.includes('forwardRef')) {
        return false;
      }
      
      let newCode = sourceCode;
      let modified = false;
      
      // Make sure React is imported
      if (!sourceCode.includes('import * as React')) {
        if (sourceCode.includes('import React')) {
          // Replace React import
          newCode = newCode.replace(
            /import React.*/,
            'import * as React from "react"'
          );
        } else {
          // Add React import
          newCode = 'import * as React from "react"\n' + newCode;
        }
        modified = true;
      }
      
      // Try to find the component function
      const funcMatch = newCode.match(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(([^)]*)\)/);
      
      if (funcMatch) {
        const compName = funcMatch[1];
        const propsParam = funcMatch[2];
        
        // Replace the function with forwardRef
        const funcPattern = new RegExp(`function\\s+${compName}\\s*\\(([^)]*)\\)\\s*\\{`);
        
        newCode = newCode.replace(
          funcPattern,
          `const ${compName} = React.forwardRef((${propsParam}, ref) => {`
        );
        
        // Find the closing brace and add a closing parenthesis
        const lines = newCode.split('\n');
        let braceCount = 0;
        let position = -1;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.includes(`const ${compName} = React.forwardRef(`)) {
            braceCount = 1; // Start counting from this line
            position = i;
            continue;
          }
          
          if (braceCount > 0) {
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            
            if (braceCount === 0) {
              // Found the matching closing brace
              lines[i] = lines[i] + ')';
              break;
            }
          }
        }
        
        if (position !== -1) {
          newCode = lines.join('\n');
          modified = true;
        }
      }
      
      return modified ? newCode : false;
    }
  },
  
  'incorrect-router-import': {
    code: 'incorrect-router-import',
    description: 'Fix router import for App Router',
    apply: (componentPath, sourceCode) => {
      // Check if already uses correct import
      if (sourceCode.includes('next/navigation')) {
        return false;
      }
      
      let newCode = sourceCode;
      
      // Replace old Router import with new one
      if (sourceCode.includes('next/router')) {
        newCode = newCode.replace(
          /import\s+{\s*useRouter\s*}\s+from\s+['"]next\/router['"]/,
          "import { useRouter } from 'next/navigation'"
        );
        
        // Also replace common methods
        newCode = newCode.replace(/router\.push/g, 'router.navigate');
        newCode = newCode.replace(/router\.replace/g, 'router.navigate');
        newCode = newCode.replace(/router\.query/g, 'searchParams');
        
        return newCode !== sourceCode ? newCode : false;
      }
      
      return false;
    }
  }
};

/**
 * Extract component name from file path
 */
function getComponentNameFromPath(componentPath: string): string {
  const baseName = path.basename(componentPath, path.extname(componentPath));
  
  // Convert kebab-case to PascalCase
  return baseName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Check if component can be a server component
 */
function canBeServerComponent(sourceCode: string): boolean {
  return !sourceCode.includes('useState') && 
         !sourceCode.includes('useEffect') &&
         !sourceCode.includes('useRef') &&
         !sourceCode.includes('useContext');
}

/**
 * Validate a single component file
 */
export function validateComponent(
  componentPath: string, 
  options: ValidationOptions = {}
): ComponentValidationResult {
  // Enable all checks if comprehensive option is set
  if (options.comprehensive) {
    options = {
      expectServerComponents: true,
      requireReact19Features: true,
      checkServerOnlyCode: true,
      validateModernHooks: true,
      validateActionsPattern: true,
      validateDisplayName: true,
      validatePropsInterface: true,
      validateForwardRef: true,
      validateDataTestId: true,
      validateAriaAttributes: true,
      validateSemanticHTML: true,
      checkTailwindPatterns: true,
      validateCVA: true,
      validateColorSystem: true,
      validateClassMerging: true,
      validateGhostClasses: true,
      validateSnapshotTests: true,
      validateAppRouter: true,
      validateMetadata: true
    };
  }

  const componentName = getComponentNameFromPath(componentPath);
  const issues: ValidationIssue[] = [];
  
  // Check if file exists
  if (!fs.existsSync(componentPath)) {
    issues.push({
      type: 'error',
      message: `Component file not found: ${componentPath}`,
      code: 'file-not-found',
      fixable: false
    });
    
    return {
      componentPath,
      componentName,
      issues,
      score: 0
    };
  }
  
  // Read source code
  const sourceCode = fs.readFileSync(componentPath, 'utf-8');
  
  // Check for React component definitions
  const componentDefinitions = [];
  const funcRegex = /function\s+([A-Z][a-zA-Z0-9]*)/g;
  const arrowFuncRegex = /const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(\([^)]*\)|[^=]*)\s*=>/g;
  
  let match;
  while ((match = funcRegex.exec(sourceCode)) !== null) {
    componentDefinitions.push(match[1]);
  }
  
  // Also check for arrow function components
  while ((match = arrowFuncRegex.exec(sourceCode)) !== null) {
    componentDefinitions.push(match[1]);
  }
  
  // Check for export of those components
  const hasExports = componentDefinitions.some(comp => 
    sourceCode.includes(`export { ${comp}`) || 
    sourceCode.includes(`export {${comp}`) ||
    sourceCode.includes(`export default ${comp}`)
  );
  
  if (componentDefinitions.length === 0 || !hasExports) {
    // Skip validation for non-component files
    return {
      componentPath,
      componentName,
      issues: [],
      score: 100
    };
  }
  
  //-------------------------
  // COMPONENT STRUCTURE CHECKS
  //-------------------------
  
  // Check displayName
  if (options.validateDisplayName !== false) {
    const hasAllDisplayNames = componentDefinitions.every(comp => 
      sourceCode.includes(`${comp}.displayName`)
    );
    
    if (!hasAllDisplayNames) {
      issues.push({
        type: 'error',
        message: 'Missing displayName property',
        code: 'missing-displayname',
        fixable: true
      });
    }
  }
  
  // Check for proper props interface
  if (options.validatePropsInterface) {
    const hasPropsInterface = sourceCode.includes('interface') && 
                             (sourceCode.includes('Props') || sourceCode.includes('props:'));
                             
    if (!hasPropsInterface) {
      issues.push({
        type: 'warning',
        message: 'Missing props interface or type definition',
        code: 'missing-props-interface',
        fixable: false
      });
    }
  }
  
  // Check for forwardRef usage
  if (options.validateForwardRef) {
    const hasForwardRef = sourceCode.includes('forwardRef');
    const isSimpleComponent = !sourceCode.includes('ref=') && !sourceCode.includes('ref,');
    
    if (!hasForwardRef && !isSimpleComponent) {
      issues.push({
        type: 'warning',
        message: 'Component should use forwardRef for proper ref handling',
        code: 'missing-forward-ref',
        fixable: false
      });
    }
  }
  
  //-------------------------
  // ACCESSIBILITY CHECKS
  //-------------------------
  
  // Check data-testid
  if (options.validateDataTestId !== false) {
    if (!sourceCode.includes('data-testid')) {
      issues.push({
        type: 'warning',
        message: 'Missing data-testid attribute',
        code: 'missing-data-testid',
        fixable: true
      });
    }
  }
  
  // Check for ARIA attributes
  if (options.validateAriaAttributes) {
    const hasInteractiveElements = sourceCode.includes('<button') || 
                                  sourceCode.includes('<a ') ||
                                  sourceCode.includes('<input') ||
                                  sourceCode.includes('onClick');
                                  
    const hasAriaAttributes = sourceCode.includes('aria-') || 
                             sourceCode.includes('role=');
                             
    if (hasInteractiveElements && !hasAriaAttributes) {
      issues.push({
        type: 'warning',
        message: 'Interactive elements should have ARIA attributes',
        code: 'missing-aria-attributes',
        fixable: false
      });
    }
  }
  
  // Check for semantic HTML
  if (options.validateSemanticHTML) {
    const hasSemanticElements = sourceCode.includes('<nav') ||
                               sourceCode.includes('<header') ||
                               sourceCode.includes('<footer') ||
                               sourceCode.includes('<article') ||
                               sourceCode.includes('<section') ||
                               sourceCode.includes('<aside');
                               
    const mightNeedSemanticElements = sourceCode.includes('layout') ||
                                     sourceCode.includes('navigation') ||
                                     sourceCode.includes('header') ||
                                     sourceCode.includes('footer');
                                     
    if (mightNeedSemanticElements && !hasSemanticElements) {
      issues.push({
        type: 'recommendation',
        message: 'Consider using semantic HTML elements for better accessibility',
        code: 'use-semantic-html',
        fixable: false
      });
    }
  }
  
  //-------------------------
  // TAILWIND CSS CHECKS
  //-------------------------
  
  // Check Tailwind patterns
  if (options.checkTailwindPatterns !== false) {
    // Check for proper class merging
    const hasClassConcatenation = sourceCode.includes('className={`') || 
                                sourceCode.match(/className=.*\+/);
    
    const hasProperMerging = sourceCode.includes('cn(') || 
                            sourceCode.includes('twMerge(') || 
                            sourceCode.includes('clsx(');
    
    if (sourceCode.includes('className=') && !hasProperMerging) {
      issues.push({
        type: 'warning',
        message: 'Component should use className merging utility (cn)',
        code: 'add-cn-utility',
        fixable: true
      });
    } else if (hasClassConcatenation && !hasProperMerging) {
      issues.push({
        type: 'error',
        message: 'Component concatenates classes without proper utility',
        code: 'add-cn-utility',
        fixable: true
      });
    }
    
    // Check for deprecated Tailwind classes
    const deprecatedClasses = [
      'text-opacity-',
      'bg-opacity-',
      'border-opacity-',
      'divide-opacity-',
      'placeholder-opacity-',
      'ring-opacity-',
      'object-left-top',
      'object-right-top',
      'object-left-bottom',
      'object-right-bottom',
      'bg-left-top',
      'bg-right-top',
      'bg-left-bottom',
      'bg-right-bottom'
    ];
    
    for (const cls of deprecatedClasses) {
      if (sourceCode.includes(cls)) {
        issues.push({
          type: 'warning',
          message: `Uses deprecated Tailwind class: ${cls}`,
          code: 'fix-tailwind-deprecated',
          fixable: true
        });
        break; // Only report once
      }
    }
  }
  
  // Check color opacity syntax
  if (options.validateColorSystem) {
    const hasLegacyOpacity = sourceCode.match(/opacity-\d+/);
    const hasModernOpacity = sourceCode.match(/\/\d+/);
    
    if (hasLegacyOpacity && !hasModernOpacity) {
      issues.push({
        type: 'warning',
        message: 'Use modern color opacity syntax (color/opacity)',
        code: 'fix-tailwind-deprecated',
        fixable: true
      });
    }
  }
  
  // Check CVA implementation
  if (options.validateCVA !== false) {
    const hasVariants = /variant\??\s*:/.test(sourceCode);
    const hasCVA = sourceCode.includes('cva(') || sourceCode.includes('VariantProps');
    
    if (hasVariants && !hasCVA) {
      issues.push({
        type: 'warning',
        message: 'Missing CVA implementation for component variants',
        code: 'missing-cva',
        fixable: false // Complex to implement fully
      });
    }
  }
  
  //-------------------------
  // TESTING CHECKS
  //-------------------------
  
  // Check ghost classes for testing
  if (options.validateGhostClasses !== false) {
    const hasGhostClasses = sourceCode.includes('ghost') || 
                           sourceCode.includes('test-variant') ||
                           sourceCode.includes('data-testid');
    
    if (!hasGhostClasses) {
      issues.push({
        type: 'warning',
        message: 'Missing ghost classes or test utilities',
        code: 'add-ghost-classes',
        fixable: true
      });
    }
  }
  
  //-------------------------
  // REACT 19 CHECKS
  //-------------------------
  
  // Check Server Component capability
  if (options.expectServerComponents) {
    const isClientComponent = sourceCode.includes('use client');
    const couldBeServerComponent = canBeServerComponent(sourceCode);
    
    if (isClientComponent && couldBeServerComponent) {
      issues.push({
        type: 'recommendation',
        message: 'Could be converted to a Server Component',
        code: 'convert-to-server-component',
        fixable: true
      });
    }
  }
  
  // Check modern React 19 hooks
  if (options.validateModernHooks) {
    const hasReact19Hooks = sourceCode.includes('useOptimistic') ||
                           sourceCode.includes('useFormStatus') ||
                           sourceCode.includes('useActionState') ||
                           sourceCode.includes('use(');
                           
    const couldUseModernHooks = (sourceCode.includes('form') || sourceCode.includes('Form')) &&
                                (sourceCode.includes('useState') || sourceCode.includes('useCallback'));
                                
    if (couldUseModernHooks && !hasReact19Hooks) {
      issues.push({
        type: 'recommendation',
        message: 'Consider using React 19 hooks (useOptimistic, useFormStatus, useActionState)',
        code: 'missing-modern-hooks',
        fixable: false
      });
    }
  }
  
  // Check actions pattern
  if (options.validateActionsPattern) {
    const hasFormHandling = sourceCode.includes('form') || sourceCode.includes('Form');
    const usesActions = sourceCode.includes('action=') || sourceCode.includes('startTransition');
    
    if (hasFormHandling && !usesActions) {
      issues.push({
        type: 'recommendation',
        message: 'Consider using the Actions API for form handling',
        code: 'missing-actions-pattern',
        fixable: false
      });
    }
  }
  
  // Check server-only code
  if (options.checkServerOnlyCode) {
    const hasServerSideCode = sourceCode.includes('fetch(') || 
                             sourceCode.includes('db.') ||
                             sourceCode.includes('database');
                             
    const usesServerOnly = sourceCode.includes('server-only') ||
                          sourceCode.includes('"use server"') ||
                          sourceCode.includes("'use server'");
                          
    if (hasServerSideCode && !usesServerOnly && sourceCode.includes('use client')) {
      issues.push({
        type: 'warning',
        message: 'Server-side code should use "use server" or server-only package',
        code: 'missing-server-only',
        fixable: false
      });
    }
  }
  
  //-------------------------
  // NEXT.JS CHECKS
  //-------------------------
  
  // Check App Router structure
  if (options.validateAppRouter) {
    const isPageComponent = componentPath.includes('/page.') || 
                          componentPath.includes('/layout.') ||
                          componentPath.includes('/error.') ||
                          componentPath.includes('/loading.');
                          
    const hasAppRouterImports = sourceCode.includes('next/navigation') ||
                               sourceCode.includes('useRouter');
                               
    if (isPageComponent && !hasAppRouterImports && sourceCode.includes('useRouter')) {
      issues.push({
        type: 'warning',
        message: 'App Router components should use next/navigation',
        code: 'incorrect-router-import',
        fixable: false
      });
    }
  }
  
  // Check metadata
  if (options.validateMetadata) {
    const isPageOrLayout = componentPath.includes('/page.') || componentPath.includes('/layout.');
    const hasMetadata = sourceCode.includes('metadata') || 
                       sourceCode.includes('generateMetadata');
                       
    if (isPageOrLayout && !hasMetadata) {
      issues.push({
        type: 'recommendation',
        message: 'Pages and layouts should include metadata for SEO',
        code: 'missing-metadata',
        fixable: false
      });
    }
  }
  
  //-------------------------
  // SCORE CALCULATION
  //-------------------------
  
  // Calculate score based on issues
  let score = 100;
  
  // Each error reduces score by 15
  score -= issues.filter(i => i.type === 'error').length * 15;
  
  // Each warning reduces score by 5
  score -= issues.filter(i => i.type === 'warning').length * 5;
  
  // Each recommendation reduces score by 2
  score -= issues.filter(i => i.type === 'recommendation').length * 2;
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  return {
    componentPath,
    componentName,
    issues,
    score
  };
}

/**
 * Validate multiple components using glob pattern
 */
export function validateComponents(
  globPattern: string,
  options: ValidationOptions = {}
): ComponentValidationResult[] {
  const files = glob.sync(globPattern);
  
  return files.map(file => validateComponent(file, options));
}

/**
 * Generate a human-readable report
 */
export function generateValidationReport(results: ComponentValidationResult[]): string {
  let report = '\n📊 Component Validation Report\n\n';
  
  // Calculate overall stats
  const totalComponents = results.length;
  const componentsWithIssues = results.filter(r => r.issues.length > 0).length;
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const averageScore = totalComponents > 0 ? 
    Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalComponents) :
    0;
  
  // Add summary
  report += `Total components: ${totalComponents}\n`;
  report += `Components with issues: ${componentsWithIssues} (${totalComponents > 0 ? Math.round(componentsWithIssues / totalComponents * 100) : 0}%)\n`;
  report += `Total issues: ${totalIssues}\n`;
  report += `Average health score: ${averageScore}%\n\n`;
  
  // Add component details
  for (const result of results) {
    if (result.issues.length === 0) {
      continue; // Skip components without issues
    }
    
    report += `${result.score < 85 ? '❌' : '⚠️'} ${result.componentName} (${result.score}%)\n`;
    
    // Group issues by type
    const errors = result.issues.filter(i => i.type === 'error');
    const warnings = result.issues.filter(i => i.type === 'warning');
    const recommendations = result.issues.filter(i => i.type === 'recommendation');
    
    if (errors.length > 0) {
      report += '  Errors:\n';
      errors.forEach(issue => {
        report += `    - ${issue.message} ${issue.fixable ? '(fixable)' : ''}\n`;
      });
    }
    
    if (warnings.length > 0) {
      report += '  Warnings:\n';
      warnings.forEach(issue => {
        report += `    - ${issue.message} ${issue.fixable ? '(fixable)' : ''}\n`;
      });
    }
    
    if (recommendations.length > 0) {
      report += '  Recommendations:\n';
      recommendations.forEach(issue => {
        report += `    - ${issue.message} ${issue.fixable ? '(fixable)' : ''}\n`;
      });
    }
    
    report += '\n';
  }
  
  return report;
}

/**
 * Apply fixes to components with issues
 */
export function applyFixes(
  results: ComponentValidationResult[],
  fixCodes?: string[]
): { fixed: number, skipped: number, failed: number } {
  const stats = { fixed: 0, skipped: 0, failed: 0 };
  
  for (const result of results) {
    if (result.issues.length === 0) {
      continue;
    }
    
    console.log(`🔧 Fixing component: ${result.componentName}`);
    
    // Get fixable issues
    const fixableIssues = result.issues.filter(issue => 
      issue.fixable && 
      FIXERS[issue.code] && 
      (!fixCodes || fixCodes.includes(issue.code))
    );
    
    if (fixableIssues.length === 0) {
      console.log(`  ℹ️ No fixable issues`);
      continue;
    }
    
    // Read the current source code
    let sourceCode = fs.readFileSync(result.componentPath, 'utf-8');
    let fileModified = false;
    
    // Apply each fix
    for (const issue of fixableIssues) {
      const fixer = FIXERS[issue.code];
      
      if (!fixer) {
        stats.skipped++;
        console.log(`  ⚠️ No fixer available for: ${issue.code}`);
        continue;
      }
      
      console.log(`  🔧 Applying fix: ${fixer.description}`);
      
      try {
        const fixResult = fixer.apply(result.componentPath, sourceCode);
        
        if (fixResult === false) {
          stats.skipped++;
          console.log(`  ⚠️ Skipped: ${fixer.description}`);
        } else {
          sourceCode = fixResult;
          fileModified = true;
          stats.fixed++;
          console.log(`  ✅ Applied: ${fixer.description}`);
        }
      } catch (error) {
        stats.failed++;
        console.error(`  ❌ Failed: ${fixer.description}`, error);
      }
    }
    
    // Save the modified file
    if (fileModified) {
      fs.writeFileSync(result.componentPath, sourceCode);
      console.log(`  💾 Saved changes to ${result.componentPath}`);
    }
  }
  
  return stats;
}

/**
 * Utility function to create the className merging utility file if needed
 */
export function createUtilsFile(destPath: string = 'src/lib/utils.ts'): boolean {
  try {
    const dir = path.dirname(destPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Skip if file already exists
    if (fs.existsSync(destPath)) {
      console.log(`✅ Utility file already exists at ${destPath}`);
      return false;
    }
    
    // Create the file with utility functions
    const content = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper handling of conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
    
    fs.writeFileSync(destPath, content);
    console.log(`✅ Created utility file at ${destPath}`);
    return true;
  } catch (error) {
    console.error('Error creating utils file:', error);
    return false;
  }
}