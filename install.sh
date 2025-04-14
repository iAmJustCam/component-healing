#!/bin/bash
# Tech Stack Alignment System - One-line installer script
# https://github.com/iAmJustCam/component-healing

set -e  # Exit on error
AUTO_YES=false

# Check for --yes flag
if [[ "$*" == *"--yes"* ]] || [[ "$*" == *"-y"* ]]; then
  AUTO_YES=true
fi

echo "🔧 Installing Tech Stack Alignment System..."

# Create directories
mkdir -p scripts/modules
echo "✅ Created directory structure"

# Download files
echo "📥 Downloading files..."
curl -s -o scripts/tech-stack-validator.sh https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/component-healer.sh
curl -s -o scripts/component-validator.ts https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/component-validator.ts
curl -s -o scripts/modules/unified-validator.ts https://raw.githubusercontent.com/iAmJustCam/component-healing/main/scripts/modules/unified-validator.ts
curl -s -o QUICK-START.md https://raw.githubusercontent.com/iAmJustCam/component-healing/main/QUICK-START.md
curl -s -o add-scripts.js https://raw.githubusercontent.com/iAmJustCam/component-healing/main/add-scripts.js

# Make shell script executable
chmod +x scripts/tech-stack-validator.sh
echo "✅ Made scripts executable"

# Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
  npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority || true
else
  echo "⚠️ Couldn't install dependencies. Please run:"
  echo "npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority"
fi

# Important - handle terminal input properly when piped
exec < /dev/tty || true

# Update package.json automatically with user confirmation
if command -v node &> /dev/null; then
  echo ""
  echo "⚠️  WARNING: This will update your package.json by:"
  echo "   - Removing outdated scripts (heal:*, fix:*, audit:*, etc.)"
  echo "   - Adding new tech stack alignment scripts (stack:*)"
  echo ""
  
  if [ "$AUTO_YES" = true ]; then
    echo "✅ Auto-updating package.json..."
    node add-scripts.js
  else
    # Try to read from terminal directly
    if [ -t 0 ]; then
      read -p "🔄 Continue with package.json update? (y/N): " confirm
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo "✅ Updating package.json..."
        node add-scripts.js
      else
        echo "⚠️ Skipped package.json update. Run 'node add-scripts.js' manually when ready."
      fi
    else
      echo "⚠️ Running in non-interactive mode. Use '--yes' flag for automatic updates."
      echo "   For now, run 'node add-scripts.js' manually to update package.json."
    fi
  fi
else
  echo "⚠️ Node.js not found. Please manually update your package.json:"
  echo "1. Remove old scripts like: heal, heal:*, fix:*, audit:*, health, etc."
  echo "2. Add the new tech stack alignment scripts shown above"
fi

echo "
🎉 Tech Stack Alignment System installed successfully!

🚀 After adding scripts to package.json, you can use:

  npm run stack:check    # Check full project alignment
  npm run stack:align    # Fix all alignment issues

💡 See QUICK-START.md for more information about all available commands
"