# Modern Component Validation and Healing System (2025)

This project includes a comprehensive validation and healing system for React components, ensuring they follow modern best practices for React 19, Next.js 15, and Tailwind CSS v4.

## Overview

The component validation system performs extensive checks across multiple dimensions:

### React 19 Architecture
- **Server Components**: Enforces Server-first architecture
- **Modern Hooks**: Validates proper use of useOptimistic, useFormStatus, useActionState, etc.
- **Actions Pattern**: Ensures proper form handling with the Actions API
- **Server/Client Boundaries**: Checks for proper server-only code isolation

### Component Structure
- **Display Names**: Enforces displayName properties for better debugging
- **Props Interfaces**: Validates proper TypeScript interfaces
- **Forward Ref**: Ensures components use forwardRef for proper composition
- **Type Safety**: Checks typings throughout components

### Accessibility
- **ARIA Attributes**: Validates proper ARIA attributes on interactive elements
- **Semantic HTML**: Encourages proper semantic element usage
- **Testing IDs**: Ensures data-testid attributes for testing
- **Keyboard Navigation**: Checks for keyboard accessibility

### Tailwind CSS v4
- **Modern Patterns**: Enforces modern Tailwind v4 syntax and patterns
- **Class Variance Authority**: Validates proper CVA implementation for variants
- **Color System**: Checks for modern color opacity syntax (color/opacity)
- **Class Merging**: Ensures proper className merging with cn()

### Next.js 15 Structure
- **App Router**: Validates proper App Router directory structure
- **Metadata API**: Checks for proper metadata implementation
- **Route Handling**: Ensures correct dynamic route implementation
- **Special Files**: Validates proper error.tsx, loading.tsx, etc.

## Quick Start

```bash
# Validate all components with basic checks
npm run component:validate

# Run comprehensive validation against all 2025 best practices
npm run component:comprehensive

# Automatically fix all issues to meet 2025 standards
npm run fix:modern

# Validate and fix issues with auto-approval
npm run component:autofix

# Generate a detailed report
npm run component:report

# Validate a specific component
npm run component:validate -- --component=Button

# Focus on Tailwind CSS issues
npm run component:tailwind

# Focus on React 19 / Server Component issues
npm run component:react
```

## Available Commands

### Validation Commands

- `npm run component:validate` - Validate all components with basic checks
- `npm run component:comprehensive` - Run comprehensive validation against all 2025 standards
- `npm run component:report` - Generate a validation report
- `npm run component:check` - Run the validator with default options
- `npm run component:tailwind` - Focus on Tailwind CSS issues
- `npm run component:react` - Focus on React 19 issues

### Fixing Commands

- `npm run component:fix` - Validate and prompt to fix issues
- `npm run component:autofix` - Validate and auto-fix all issues
- `npm run fix:modern` - Apply fixes to meet 2025 best practices standards
- `npm run fix:tailwind` - Fix Tailwind CSS issues
- `npm run fix:react` - Fix React 19 issues
- `npm run fix:all` - Fix all issues with auto-approval

### Component Generation

- `npm run generate:component` - Generate a new component from templates

## Command Line Options

The component-healer.sh script accepts the following options:

- `--component=NAME` - Validate a specific component
- `--fix` - Apply fixes after validation
- `--yes` - Auto-approve all fixes
- `--report` - Generate a detailed report
- `--all` - Enable all validators
- `--comprehensive` - Enable comprehensive 2025 best practices validation
- `--tailwind` - Focus on Tailwind CSS validation
- `--react` - Focus on React 19 validation
- `--create-utils` - Create utils.ts with cn() utility
- `--output=FILE` - Output report to a file

## What Gets Fixed

The healing system can automatically fix:

1. **React 19 Architecture**
   - Missing displayName properties
   - Unnecessary 'use client' directives
   - Server vs. client component conversion
   - Props interfaces
   - ForwardRef implementation

2. **Tailwind CSS v4 Issues**
   - Deprecated class patterns (text-opacity-*, bg-left-top, etc.)
   - String concatenation in className without proper merging
   - Missing cn() utility
   - Modern color opacity syntax

3. **Component Structure & Accessibility**
   - Missing data-testid attributes
   - Ghost classes for testing
   - Basic ARIA attributes on interactive elements
   - Router imports for App Router

## Architecture

The system consists of:

- **Unified Validator**: A comprehensive validator that checks for all 2025 best practices
- **Component Validator CLI**: Command-line interface for validation and fixing
- **Component Healer Shell Script**: User-friendly script with options

## Development

To extend the validator with new checks or fixers:

1. Add new validation logic to `scripts/modules/unified-validator.ts`
2. Add a new fixer in the `FIXERS` registry for auto-fixing capabilities
3. Update the CLI or shell script if needed

## Comprehensive Validation Checks

The comprehensive validation checks for:

- **React 19 Best Practices**
  - Server Components Architecture
  - Modern Hooks Usage
  - Actions Pattern
  - Server-Only Code
  - Component Display Name
  - Props Interface
  - Forward Ref Usage
  - Type Safety

- **Accessibility**
  - ARIA Attributes
  - Semantic HTML
  - Data Test IDs
  - Keyboard Navigation

- **Tailwind CSS v4**
  - Modern Configuration
  - Modern CSS Features
  - Utility Patterns
  - Component Styling
  - Developer Experience

- **Next.js 15**
  - App Router Structure
  - Metadata and SEO
  - Route Handling
  - Performance Optimization
  - Data Fetching

## Troubleshooting

If the validator misses issues or applies incorrect fixes:

1. Use the `--comprehensive` flag to run all possible checks
2. Inspect the component structure to ensure it matches expectations
3. Run with `--report` to generate a detailed report
4. Consider manually fixing complex issues that the auto-fixer can't handle

---

This validation system is designed to enforce the Modern Web Development Best Practices Guide (2025) and will evolve as best practices continue to advance.