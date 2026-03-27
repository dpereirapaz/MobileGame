#!/bin/bash
# Hook: detect-gaps.sh
# Event: SessionStart
# Purpose: Detect missing documentation when code/prototypes exist
# Cross-platform: Windows Git Bash compatible (uses grep -E, not -P)

set +e

echo "=== Checking for Documentation Gaps ==="

# --- Check 0: Fresh project detection (suggests /start) ---
FRESH_PROJECT=true

if [ -f ".claude/docs/technical-preferences.md" ]; then
  ENGINE_LINE=$(grep -E "^\- \*\*Engine\*\*:" .claude/docs/technical-preferences.md 2>/dev/null)
  if [ -n "$ENGINE_LINE" ] && ! echo "$ENGINE_LINE" | grep -q "TO BE CONFIGURED" 2>/dev/null; then
    FRESH_PROJECT=false
  fi
fi

if [ -f "design/gdd/game-concept.md" ]; then
  FRESH_PROJECT=false
fi

# Check if source code exists (including synapse/ structure)
for src_dir in src synapse/src; do
  if [ -d "$src_dir" ]; then
    SRC_CHECK=$(find "$src_dir" -type f \( -name "*.gd" -o -name "*.cs" -o -name "*.cpp" -o -name "*.c" -o -name "*.h" -o -name "*.hpp" -o -name "*.rs" -o -name "*.py" -o -name "*.js" -o -name "*.ts" \) 2>/dev/null | head -1)
    if [ -n "$SRC_CHECK" ]; then
      FRESH_PROJECT=false
    fi
  fi
done

if [ "$FRESH_PROJECT" = true ]; then
  echo ""
  echo "NEW PROJECT: No engine configured, no game concept, no source code."
  echo "   This looks like a fresh start! Run: /start"
  echo ""
  echo "To get a comprehensive project analysis, run: /project-stage-detect"
  echo "==================================="
  exit 0
fi

# --- Check 1: Substantial codebase but sparse design docs ---
SRC_FILES=0
for src_dir in src synapse/src; do
  if [ -d "$src_dir" ]; then
    COUNT=$(find "$src_dir" -type f \( -name "*.gd" -o -name "*.cs" -o -name "*.cpp" -o -name "*.c" -o -name "*.h" -o -name "*.hpp" -o -name "*.rs" -o -name "*.py" -o -name "*.js" -o -name "*.ts" \) 2>/dev/null | wc -l)
    SRC_FILES=$((SRC_FILES + COUNT))
  fi
done

DESIGN_FILES=0
if [ -d "design/gdd" ]; then
  DESIGN_FILES=$(find design/gdd -type f -name "*.md" 2>/dev/null | wc -l)
fi

# Also check Specs/ directory (this project uses Specs/)
SPEC_FILES=0
if [ -d "Specs" ]; then
  SPEC_FILES=$(find Specs -type f -name "*.md" 2>/dev/null | wc -l)
fi

SRC_FILES=$(echo "$SRC_FILES" | tr -d ' ')
DESIGN_FILES=$(echo "$DESIGN_FILES" | tr -d ' ')
SPEC_FILES=$(echo "$SPEC_FILES" | tr -d ' ')
TOTAL_DESIGN=$((DESIGN_FILES + SPEC_FILES))

if [ "$SRC_FILES" -gt 50 ] && [ "$TOTAL_DESIGN" -lt 5 ]; then
  echo "GAP: Substantial codebase ($SRC_FILES source files) but sparse design docs ($TOTAL_DESIGN files)"
  echo "    Suggested action: /reverse-document design src/[system]"
fi

# --- Check 2: Prototypes without documentation ---
if [ -d "prototypes" ]; then
  PROTOTYPE_DIRS=$(find prototypes -mindepth 1 -maxdepth 1 -type d 2>/dev/null)
  UNDOCUMENTED_PROTOS=()

  if [ -n "$PROTOTYPE_DIRS" ]; then
    while IFS= read -r proto_dir; do
      proto_dir=$(echo "$proto_dir" | sed 's|\\|/|g')
      if [ ! -f "${proto_dir}/README.md" ] && [ ! -f "${proto_dir}/CONCEPT.md" ]; then
        proto_name=$(basename "$proto_dir")
        UNDOCUMENTED_PROTOS+=("$proto_name")
      fi
    done <<< "$PROTOTYPE_DIRS"

    if [ ${#UNDOCUMENTED_PROTOS[@]} -gt 0 ]; then
      echo "GAP: ${#UNDOCUMENTED_PROTOS[@]} undocumented prototype(s) found:"
      for proto in "${UNDOCUMENTED_PROTOS[@]}"; do
        echo "    - prototypes/$proto/ (no README or CONCEPT doc)"
      done
    fi
  fi
fi

# --- Summary ---
echo ""
echo "To get a comprehensive project analysis, run: /project-stage-detect"
echo "==================================="

exit 0
