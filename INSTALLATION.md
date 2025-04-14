# Installation Guide

## One-Line Installation

Copy and paste this command into your terminal inside your project directory:

```bash
curl -s https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh | bash
```

This will:
1. Download all necessary files
2. Set up the directory structure
3. Add scripts to your package.json
4. Install required dependencies

## After Installation

Once installed, you can use these simple commands:

```bash
# Check full project alignment
npm run stack:check

# Fix ALL alignment issues
npm run stack:align
```

### Technology-Specific Commands

```bash
# Check specific areas
npm run component:check
npm run project:check
npm run react:check
npm run next:check
npm run tailwind:check
npm run a11y:check

# Fix specific areas
npm run component:fix
npm run project:fix
npm run react:fix
npm run next:fix
npm run tailwind:fix
npm run a11y:fix
```

See [QUICK-START.md](https://github.com/iAmJustCam/component-healing/blob/main/QUICK-START.md) for more usage information.