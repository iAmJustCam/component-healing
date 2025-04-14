#!/bin/bash
# Component Validator and Healer
# A streamlined script for validating and fixing React components

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
CREATE_UTILS=false
OUTPUT_FILE=""
COMPREHENSIVE=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --component=*) COMPONENT="${1#*=}" ;;
    --component) 
      shift
      COMPONENT="$1" 
      ;;
    --fix) FIX_MODE=true ;;
    --yes) AUTO_APPROVE=true ;;
    --report) REPORT_ONLY=true ;;
    --all) VALIDATE_ALL=true ;;
    --tailwind) TAILWIND_ONLY=true ;;
    --react) REACT_ONLY=true ;;
    --create-utils) CREATE_UTILS=true ;;
    --output=*) OUTPUT_FILE="${1#*=}" ;;
    --comprehensive) COMPREHENSIVE=true ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

echo -e "${BLUE}🔍 Component Validator and Healer${NC}"
echo "----------------------------------------"

# Build command for validation
CMD="npx tsx scripts/component-validator.ts"

if [ -n "$COMPONENT" ]; then
  CMD="$CMD --component=$COMPONENT"
fi

if [ "$REPORT_ONLY" = true ]; then
  CMD="$CMD --report"
  if [ -n "$OUTPUT_FILE" ]; then
    CMD="$CMD --output=$OUTPUT_FILE"
  fi
fi

if [ "$COMPREHENSIVE" = true ]; then
  CMD="$CMD --comprehensive"
elif [ "$VALIDATE_ALL" = true ]; then
  CMD="$CMD --all"
elif [ "$TAILWIND_ONLY" = true ]; then
  CMD="$CMD --tailwind"
elif [ "$REACT_ONLY" = true ]; then
  CMD="$CMD --server"
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
  
  echo -e "${GREEN}✅ Component validation and healing complete!${NC}"
  echo "Run your tests to ensure everything still works correctly."
else
  echo -e "${BLUE}To fix issues, run: scripts/component-healer.sh --fix${NC}"
  echo -e "${BLUE}For automatic fixing, run: scripts/component-healer.sh --fix --yes${NC}"
fi