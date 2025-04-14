# Tech Stack Alignment System - Quick Start Guide

## Super Simple Workflow

```bash
# Install with one line
curl -s https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh | bash

# Check full project alignment
npm run stack:check

# Fix ALL alignment issues
npm run stack:align
```

That's it! Three commands to ensure your entire project follows all modern best practices.

## Checking Specific Areas

```bash
# Check components only
npm run component:check

# Check project structure
npm run project:check

# Check specific technologies
npm run react:check
npm run next:check
npm run tailwind:check
npm run a11y:check
```

## Fixing Specific Areas

```bash
# Fix components only
npm run component:fix

# Fix project structure
npm run project:fix

# Fix specific technologies
npm run react:fix
npm run next:fix
npm run tailwind:fix
npm run a11y:fix
```

## What's Being Checked?

The comprehensive validation system checks your entire project against:

✅ **Project Structure**: Directory organization, file naming, configuration files  
✅ **React 19**: Server Components, modern hooks, proper component structure  
✅ **Next.js 15**: App Router, metadata, routing patterns  
✅ **Tailwind CSS v4**: Modern patterns, class merging, color system  
✅ **Accessibility**: ARIA attributes, semantic HTML, testing IDs  

## Recommended Development Flow

1. **Build features**: Focus on functionality first
2. **Check alignment**: Run `npm run stack:check` to see your score
3. **Auto-align**: Run `npm run stack:align` to fix all issues
4. **Test**: Verify everything still works correctly

For more detailed options, see [full documentation](./COMPONENT-VALIDATION.md).