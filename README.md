# Tech Stack Alignment System

Modern tech stack alignment system for React 19, Next.js 15, and Tailwind CSS v4 applications. Keeps your entire project aligned with the latest best practices with minimal developer effort.

## Quick Start

```bash
# Install with one line
curl -s https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh | bash

# Check full project alignment
npm run stack:check

# Fix ALL alignment issues
npm run stack:align
```

## Features

- **Comprehensive Validation**: Checks your entire project against 2025 best practices
- **Automatic Fixing**: Self-heals issues with smart code transformations
- **Developer Friendly**: Simple commands with clear reporting
- **Tech Stack Coverage**:
  - ✅ **React 19**: Server Components, modern hooks, Actions pattern
  - ✅ **Next.js 15**: App Router, metadata, routing patterns
  - ✅ **Tailwind CSS v4**: Modern patterns, class merging, color system
  - ✅ **Accessibility**: ARIA attributes, semantic HTML, testing IDs
  - ✅ **Project Structure**: Directory structure, file organization, naming conventions

## What Gets Validated

### Project Structure
- Directory organization follows modern patterns
- File naming conventions are consistent
- Configuration files use recommended settings
- Dependencies are properly managed

### React 19
- Server Components architecture is properly implemented
- Modern hooks (useOptimistic, useFormStatus) are used correctly
- Actions pattern is used for forms
- Component structure follows best practices (displayName, props interfaces, forwardRef)

### Next.js 15
- App Router structure is properly implemented
- Metadata and SEO optimizations are in place
- Routing patterns follow recommendations
- Data fetching strategies are optimized

### Tailwind CSS v4
- Class merging with cn() utility is used
- Modern color system with opacity syntax is applied
- Component variants with Class Variance Authority are implemented
- Modern naming conventions are followed

### Accessibility
- ARIA attributes are present on interactive elements
- Semantic HTML is used appropriately
- Test IDs are included for component testing
- Keyboard navigation is properly supported

## Documentation

- [Quick Start Guide](./QUICK-START.md) - Simple guide to get started
- [Full Documentation](./COMPONENT-VALIDATION.md) - Detailed documentation

## License

MIT