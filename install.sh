#!/bin/bash
# Tech Stack Alignment System - One-line installer script
# https://github.com/iAmJustCam/component-healing

set -e  # Exit on error

echo "🔧 Installing Tech Stack Alignment System..."

# Create directories
mkdir -p scripts/modules
echo "✅ Created directory structure"

# Download files
echo "📥 Downloading files..."
curl -s -o scripts/tech-stack-validator.sh https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/component-healer.sh
curl -s -o scripts/validator-cli.ts https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/component-validator.ts
curl -s -o scripts/modules/unified-validator.ts https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/modules/unified-validator.ts
curl -s -o QUICK-START.md https://raw.githubusercontent.com/iAmJustCam/component-healing/main/QUICK-START.md

# Make shell script executable
chmod +x scripts/tech-stack-validator.sh
echo "✅ Made scripts executable"

# Add npm scripts
echo "📝 Adding scripts to package.json..."

# Try to use npm pkg command if available
if command -v npm &> /dev/null; then
  # Core simple commands
  npm pkg set "scripts.stack:check"="bash scripts/tech-stack-validator.sh --comprehensive --report" || true
  npm pkg set "scripts.stack:align"="bash scripts/tech-stack-validator.sh --comprehensive --fix --yes" || true
  
  # Component specific commands
  npm pkg set "scripts.component:check"="bash scripts/tech-stack-validator.sh --component-only --report" || true
  npm pkg set "scripts.component:fix"="bash scripts/tech-stack-validator.sh --component-only --fix --yes" || true
  
  # Project structure commands
  npm pkg set "scripts.project:check"="bash scripts/tech-stack-validator.sh --project-structure --report" || true
  npm pkg set "scripts.project:fix"="bash scripts/tech-stack-validator.sh --project-structure --fix --yes" || true
  
  # Tech-specific commands
  npm pkg set "scripts.react:check"="bash scripts/tech-stack-validator.sh --react --report" || true
  npm pkg set "scripts.react:fix"="bash scripts/tech-stack-validator.sh --react --fix --yes" || true
  npm pkg set "scripts.next:check"="bash scripts/tech-stack-validator.sh --next --report" || true
  npm pkg set "scripts.next:fix"="bash scripts/tech-stack-validator.sh --next --fix --yes" || true
  npm pkg set "scripts.tailwind:check"="bash scripts/tech-stack-validator.sh --tailwind --report" || true
  npm pkg set "scripts.tailwind:fix"="bash scripts/tech-stack-validator.sh --tailwind --fix --yes" || true
  npm pkg set "scripts.a11y:check"="bash scripts/tech-stack-validator.sh --accessibility --report" || true
  npm pkg set "scripts.a11y:fix"="bash scripts/tech-stack-validator.sh --accessibility --fix --yes" || true
fi

echo "⚠️ Make sure your package.json has these scripts:
  \"stack:check\": \"bash scripts/tech-stack-validator.sh --comprehensive --report\",
  \"stack:align\": \"bash scripts/tech-stack-validator.sh --comprehensive --fix --yes\""

# Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
  npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority || true
else
  echo "⚠️ Couldn't install dependencies. Please run:"
  echo "npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority"
fi

echo "
🎉 Tech Stack Alignment System installed successfully!

👉 Check full project alignment:
   npm run stack:check

👉 Fix all alignment issues:
   npm run stack:align

💡 Other useful commands:
   npm run component:check    # Check only components
   npm run project:check      # Check project structure
   npm run react:check        # Check React 19 alignment
   npm run next:check         # Check Next.js 15 alignment
   npm run tailwind:check     # Check Tailwind CSS v4 alignment
   npm run a11y:check         # Check accessibility

📚 See QUICK-START.md for more information
"