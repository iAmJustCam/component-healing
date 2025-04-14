# Component Health System - Quick Start Guide

## Super Simple Workflow

```bash
# Check component health (gets % score)
npm run health

# Fix ALL issues automatically
npm run heal
```

That's it! Two commands to ensure your components follow all modern best practices.

## Checking Specific Components

```bash
# Check health of a specific component
npm run health -- --component=button

# Fix a specific component
npm run heal -- --component=button
```

## What's Being Checked?

The comprehensive validation system checks your components against:

✅ **React 19**: Server Components, modern hooks, proper structure  
✅ **Next.js 15**: App Router, metadata, routing patterns  
✅ **Tailwind CSS v4**: Modern patterns, class merging, color system  
✅ **Accessibility**: ARIA attributes, semantic HTML, testing IDs  
✅ **Testing**: Ghost classes for component testing

## Recommended Development Flow

1. **Build features**: Focus on functionality first
2. **Check health**: Run `npm run health` to see your score
3. **Auto-heal**: Run `npm run heal` to fix all issues
4. **Test**: Verify everything still works correctly

For more detailed options, see [COMPONENT-VALIDATION.md](./COMPONENT-VALIDATION.md).