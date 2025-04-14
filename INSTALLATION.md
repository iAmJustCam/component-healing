# Installation Guide

## Option 1: Quick Installation

```bash
# Clone the repository temporarily
git clone https://github.com/iAmJustCam/component-healing.git temp-healing

# Copy the required files to your project
mkdir -p scripts/modules
cp temp-healing/scripts/component-healer.sh scripts/
cp temp-healing/scripts/component-validator.ts scripts/
cp temp-healing/scripts/modules/unified-validator.ts scripts/modules/

# Copy documentation
cp temp-healing/COMPONENT-VALIDATION.md .
cp temp-healing/QUICK-START.md .

# Add scripts to your package.json
# You can copy and paste these into your package.json
# or use the npm pkg command if you prefer
npm pkg set "scripts.health"="bash scripts/component-healer.sh --comprehensive --report"
npm pkg set "scripts.heal"="bash scripts/component-healer.sh --comprehensive --fix --yes"
npm pkg set "scripts.component:comprehensive"="bash scripts/component-healer.sh --comprehensive --report"
npm pkg set "scripts.fix:modern"="bash scripts/component-healer.sh --comprehensive --fix --yes"

# Install required dependencies
npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority

# Clean up
rm -rf temp-healing
```

## Option 2: Manual Installation

1. **Create the directory structure:**

```bash
mkdir -p scripts/modules
```

2. **Download the files from GitHub:**
   - [scripts/component-healer.sh](https://github.com/iAmJustCam/component-healing/blob/main/scripts/component-healer.sh)
   - [scripts/component-validator.ts](https://github.com/iAmJustCam/component-healing/blob/main/scripts/component-validator.ts)
   - [scripts/modules/unified-validator.ts](https://github.com/iAmJustCam/component-healing/blob/main/scripts/modules/unified-validator.ts)

3. **Make the shell script executable:**

```bash
chmod +x scripts/component-healer.sh
```

4. **Add scripts to your package.json:**

```json
"scripts": {
  "health": "bash scripts/component-healer.sh --comprehensive --report",
  "heal": "bash scripts/component-healer.sh --comprehensive --fix --yes",
  "component:comprehensive": "bash scripts/component-healer.sh --comprehensive --report",
  "fix:modern": "bash scripts/component-healer.sh --comprehensive --fix --yes"
}
```

5. **Install required dependencies:**

```bash
npm install --save-dev glob tsx clsx tailwind-merge class-variance-authority
```

## Option 3: NPM Package (Future)

Once this becomes an npm package, you'll be able to install it with:

```bash
npm install --save-dev component-healing
```

And then use it via the CLI:

```bash
npx component-healing --comprehensive
```

## After Installation

Once installed, you can use the two simple commands:

```bash
# Check component health
npm run health

# Fix all issues
npm run heal
```

See [QUICK-START.md](./QUICK-START.md) for more usage information.