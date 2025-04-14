# Tech Stack Alignment System

Modern tech stack alignment system for React 19, Next.js 15, and Tailwind CSS v4 applications. Keeps your entire project aligned with the latest best practices with minimal developer effort.

## Quick Start

```bash
# Install (interactive method)
curl -s -o install.sh https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh
chmod +x install.sh
./install.sh

# Or for CI environments (auto-yes, no prompts)
curl -s https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh | bash -s -- --yes

# Check full project alignment (components + project structure)
npm run stack:check

# Fix ALL alignment issues
npm run stack:align
```

## Features

- **Comprehensive Validation**: Validates both components and project structure
- **Automatic Fixing**: Self-heals issues with smart code transformations
- **Detailed Reporting**: Component and project health scores with specific recommendations
- **Developer Friendly**: Simple commands with clear reporting
- **Tech Stack Coverage**:
  - ✅ **React 19**: Server Components, modern hooks, Actions pattern, dependency versions
  - ✅ **Next.js 15**: App Router structure, metadata, routing patterns, configuration
  - ✅ **Tailwind CSS v4**: Modern patterns, class merging, color system, utilities
  - ✅ **Accessibility**: ARIA attributes, semantic HTML, testing IDs
  - ✅ **TypeScript**: Configuration, strict mode, ESM modules
  - ✅ **CSS**: Organization, modules, global styles
  - ✅ **Project Structure**: Directory organization, file structure, config files

## What Gets Validated

### Component Health
- Component structure and patterns
- Tailwind CSS usage and best practices
- Accessibility features
- Server/Client component boundaries
- TypeScript interfaces and typing

### Project Structure Health
- Next.js App Router setup
- React and dependencies versions
- Tailwind CSS configuration
- TypeScript configuration
- CSS organization
- ESM and modern JavaScript setup

## Documentation

- [Quick Start Guide](./QUICK-START.md) - Simple guide to get started
- [Full Documentation](./COMPONENT-VALIDATION.md) - Detailed documentation

## License

MIT