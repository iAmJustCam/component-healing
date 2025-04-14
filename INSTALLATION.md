# Installation Guide

## One-Line Installation

Copy and paste this command into your terminal inside your project directory:

```bash
curl -s https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh | bash
```

This will:
1. Download all necessary files
2. Set up the directory structure
3. Try to add scripts to your package.json automatically
4. Install required dependencies

## Adding Scripts to package.json

The installation script will try to automatically add the required scripts to your package.json. If it fails, you have two options:

### Option 1: Run the helper script (recommended)

```bash
node add-scripts.js
```

### Option 2: Manually add these scripts to your package.json

```json
"scripts": {
  "stack:check": "bash scripts/tech-stack-validator.sh --comprehensive --report",
  "stack:align": "bash scripts/tech-stack-validator.sh --comprehensive --fix --yes",
  
  "component:check": "bash scripts/tech-stack-validator.sh --component-only --report",
  "component:fix": "bash scripts/tech-stack-validator.sh --component-only --fix --yes",
  
  "project:check": "bash scripts/tech-stack-validator.sh --project-structure --report",
  "project:fix": "bash scripts/tech-stack-validator.sh --project-structure --fix --yes",
  
  "react:check": "bash scripts/tech-stack-validator.sh --react --report",
  "react:fix": "bash scripts/tech-stack-validator.sh --react --fix --yes",
  
  "next:check": "bash scripts/tech-stack-validator.sh --next --report",
  "next:fix": "bash scripts/tech-stack-validator.sh --next --fix --yes",
  
  "tailwind:check": "bash scripts/tech-stack-validator.sh --tailwind --report",
  "tailwind:fix": "bash scripts/tech-stack-validator.sh --tailwind --fix --yes",
  
  "a11y:check": "bash scripts/tech-stack-validator.sh --accessibility --report",
  "a11y:fix": "bash scripts/tech-stack-validator.sh --accessibility --fix --yes"
}
```

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