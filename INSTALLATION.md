# Installation Guide

## Installation Options

### Option 1: Download and Run (Interactive, Recommended)

For the best interactive experience, download the script first and then run it:

```bash
# Step 1: Download the install script
curl -s -o install.sh https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh

# Step 2: Make it executable
chmod +x install.sh

# Step 3: Run it 
./install.sh
```

This will prompt you to confirm before updating your package.json scripts.

### Option 2: One-Line Installation (Auto-Yes)

For CI environments or when you want to skip all prompts:

```bash
curl -s https://raw.githubusercontent.com/iAmJustCam/component-healing/main/install.sh | bash -s -- --yes
```

This will:
1. Download all necessary files
2. Set up the directory structure
3. Try to add scripts to your package.json automatically
4. Install required dependencies

## Updating Scripts in package.json

The installation script will automatically clean up your package.json by:
1. Removing any outdated/conflicting scripts
2. Adding the new tech stack alignment scripts

This ensures you won't have duplicate or conflicting scripts in your package.json.

### Option 1: Run the helper script (recommended)

```bash
node add-scripts.js
```

This will:
- Remove old scripts like `heal`, `heal:*`, `fix:*`, `audit:*`, etc.
- Add all the new tech stack alignment scripts

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