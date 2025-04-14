#!/bin/bash
# Component Healing - One-line installer script
# https://github.com/iAmJustCam/component-healing

set -e  # Exit on error

echo "🔧 Installing Component Healing System..."

# Create directories
mkdir -p scripts/modules
echo "✅ Created directory structure"

# Download files
echo "📥 Downloading files..."
curl -s -o scripts/component-healer.sh https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/component-healer.sh
curl -s -o scripts/component-validator.ts https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/component-validator.ts
curl -s -o scripts/modules/unified-validator.ts https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/modules/unified-validator.ts
curl -s -o QUICK-START.md https://raw.githubusercontent.com/iAmJustCam/component-healing/main/QUICK-START.md

# Make shell script executable
chmod +x scripts/component-healer.sh
echo "✅ Made scripts executable"

# Add npm scripts (trying both ways)
echo "📝 Adding scripts to package.json..."

# Try to use npm pkg command if available
if command -v npm &> /dev/null; then
  npm pkg set "scripts.health"="bash scripts/component-healer.sh --comprehensive --report" || true
  npm pkg set "scripts.heal"="bash scripts/component-healer.sh --comprehensive --fix --yes" || true
  npm pkg set "scripts.component:comprehensive"="bash scripts/component-healer.sh --comprehensive --report" || true
  npm pkg set "scripts.fix:modern"="bash scripts/component-healer.sh --comprehensive --fix --yes" || true
fi

echo "⚠️ Make sure your package.json has these scripts:
  \"health\": \"bash scripts/component-healer.sh --comprehensive --report\",
  \"heal\": \"bash scripts/component-healer.sh --comprehensive --fix --yes\""

# Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
  npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority || true
else
  echo "⚠️ Couldn't install dependencies. Please run:"
  echo "npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority"
fi

echo "
🎉 Component Healing System installed successfully!

👉 Check component health:
   npm run health

👉 Fix component issues:
   npm run heal

📚 See QUICK-START.md for more information
"