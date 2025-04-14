#!/bin/bash
# Tech Stack Alignment System
# A comprehensive script for validating and fixing modern web projects

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default values
COMPONENT=""
FIX_MODE=false
AUTO_APPROVE=false
REPORT_ONLY=false
VALIDATE_ALL=false
TAILWIND_ONLY=false
REACT_ONLY=false
NEXT_ONLY=false
PROJECT_ONLY=false
COMPONENT_ONLY=false
ACCESSIBILITY_ONLY=false
CREATE_UTILS=false
OUTPUT_FILE=""
COMPREHENSIVE=false

# Directory parameter
DIR=""
PATTERN=""
JSON_OUTPUT=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    # Component targeting
    --component=*) COMPONENT="${1#*=}" ;;
    --component) 
      shift
      COMPONENT="$1" 
      ;;
    --dir=*) DIR="${1#*=}" ;;
    --dir) 
      shift
      DIR="$1" 
      ;;
    --pattern=*) PATTERN="${1#*=}" ;;
    --pattern) 
      shift
      PATTERN="$1" 
      ;;
    
    # Action flags
    --fix) FIX_MODE=true ;;
    --yes) AUTO_APPROVE=true ;;
    --report) REPORT_ONLY=true ;;
    --create-utils) CREATE_UTILS=true ;;
    --output=*) OUTPUT_FILE="${1#*=}" ;;
    --json) JSON_OUTPUT=true ;;
    
    # Validation scope flags
    --all) VALIDATE_ALL=true ;;
    --comprehensive) COMPREHENSIVE=true ;;
    
    # Technology-specific flags
    --tailwind) TAILWIND_ONLY=true ;;
    --react) REACT_ONLY=true ;;
    --next) NEXT_ONLY=true ;;
    --project-structure) PROJECT_ONLY=true ;;
    --component-only) COMPONENT_ONLY=true ;;
    --accessibility) ACCESSIBILITY_ONLY=true ;;
    
    # Help
    --help|-h) 
      echo "Tech Stack Alignment System"
      echo "Usage: bash tech-stack-validator.sh [options]"
      echo ""
      echo "Options:"
      echo "  --component=NAME      Validate a specific component"
      echo "  --dir=PATH            Directory to search for components (default: src/components/ui)"
      echo "  --pattern=GLOB        Glob pattern to match files (default: **/*.tsx)"
      echo "  --fix                 Apply fixes to issues found"
      echo "  --yes                 Auto-approve all fixes"
      echo "  --report              Generate a detailed report"
      echo "  --json                Output in JSON format"
      echo "  --output=FILE         Write output to a file"
      echo "  --create-utils        Create utility files if missing"
      echo ""
      echo "Validation Scopes:"
      echo "  --comprehensive       Enable all checks (recommended)"
      echo "  --all                 Enable basic checks"
      echo "  --component-only      Focus only on component structure"
      echo "  --project-structure   Focus on project structure"
      echo "  --react               Focus on React 19 patterns"
      echo "  --next                Focus on Next.js 15 patterns"
      echo "  --tailwind            Focus on Tailwind CSS v4 patterns"
      echo "  --accessibility       Focus on accessibility features"
      exit 0
      ;;
    
    # Error handling
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

echo -e "${BLUE}🔍 Tech Stack Alignment System${NC}"
echo "----------------------------------------"

# Build command for validation
CMD="npx tsx scripts/component-validator.ts"

# Component and directory parameters
if [ -n "$COMPONENT" ]; then
  CMD="$CMD --component=$COMPONENT"
fi

if [ -n "$DIR" ]; then
  CMD="$CMD --dir=$DIR"
fi

if [ -n "$PATTERN" ]; then
  CMD="$CMD --pattern=$PATTERN"
fi

# Output options
if [ "$REPORT_ONLY" = true ]; then
  CMD="$CMD --report"
fi

if [ -n "$OUTPUT_FILE" ]; then
  CMD="$CMD --output=$OUTPUT_FILE"
fi

if [ "$JSON_OUTPUT" = true ]; then
  CMD="$CMD --json"
fi

# Set validation scope - add flags
if [ "$COMPREHENSIVE" = true ]; then
  CMD="$CMD --comprehensive"
fi

if [ "$VALIDATE_ALL" = true ]; then
  CMD="$CMD --all"
fi

if [ "$TAILWIND_ONLY" = true ]; then
  CMD="$CMD --tailwind"
fi

if [ "$REACT_ONLY" = true ]; then
  CMD="$CMD --react"
fi

if [ "$NEXT_ONLY" = true ]; then
  CMD="$CMD --next"
fi

if [ "$PROJECT_ONLY" = true ]; then
  CMD="$CMD --project-structure"
fi

if [ "$COMPONENT_ONLY" = true ]; then
  CMD="$CMD --component-only"
fi

if [ "$ACCESSIBILITY_ONLY" = true ]; then
  CMD="$CMD --accessibility"
fi

if [ "$CREATE_UTILS" = true ]; then
  CMD="$CMD --create-utils"
fi

# Execute validation
echo -e "${YELLOW}Executing: $CMD${NC}"
eval "$CMD"

# If fix mode is enabled
if [ "$FIX_MODE" = true ]; then
  if [ "$AUTO_APPROVE" = true ]; then
    echo -e "${GREEN}Auto-approving fixes...${NC}"
  else
    echo -e "${YELLOW}Would you like to apply fixes? (y/n)${NC}"
    read -r apply_fixes
    if [[ ! $apply_fixes =~ ^[Yy]$ ]]; then
      echo "Skipping fixes. Exiting."
      exit 0
    fi
  fi
  
  # Execute fixes
  FIX_CMD="$CMD --fix"
  echo -e "${YELLOW}Executing: $FIX_CMD${NC}"
  eval "$FIX_CMD"
  
  echo -e "${GREEN}✅ Tech stack alignment and healing complete!${NC}"
  echo "Run your tests to ensure everything still works correctly."
else
  echo -e "${BLUE}To fix issues, run: scripts/tech-stack-validator.sh --fix${NC}"
  echo -e "${BLUE}For automatic fixing, run: scripts/tech-stack-validator.sh --fix --yes${NC}"
fi