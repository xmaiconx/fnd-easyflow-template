#!/bin/bash
# Script: validate-resource-genericity.sh
# Purpose: Validate resource is generic (no template-specific dependencies)
# Usage: bash .claude/scripts/validate-resource-genericity.sh <file_path>
# Consumer: /fnd-builder agent
#
# Exit codes: 0=PASS, 1=FAIL (errors found)

set -e

[ -z "$1" ] && echo "ERROR:missing_file_path" && exit 1
[ ! -f "$1" ] && echo "ERROR:file_not_found:$1" && exit 1

FILE="$1"
ERRORS=0
WARNINGS=0

echo "=== GENERICITY_CHECK ==="
echo "FILE:$FILE"

# Check function - outputs structured result
check_pattern() {
    local type="$1"      # ERROR or WARN
    local category="$2"  # paths, stack, files, structure
    local pattern="$3"
    local exclude="$4"   # optional exclude pattern

    local result
    if [ -n "$exclude" ]; then
        result=$(grep -n "$pattern" "$FILE" 2>/dev/null | grep -v "$exclude" | head -1 || true)
    else
        result=$(grep -n "$pattern" "$FILE" 2>/dev/null | head -1 || true)
    fi

    if [ -n "$result" ]; then
        local line_num=$(echo "$result" | cut -d: -f1)
        echo "$type:$category:$pattern:line$line_num"
        [ "$type" = "ERROR" ] && ERRORS=$((ERRORS + 1))
        [ "$type" = "WARN" ] && WARNINGS=$((WARNINGS + 1))
    fi
}

echo "=== HARDCODED_PATHS ==="
# Template-specific paths (these indicate non-generic resource)
# Exclude: examples, code blocks, comments, check_pattern calls, output examples
EXCLUDE="# Example\|# PATTERN\|check_pattern\|ERROR:path\|PKG:"
check_pattern "ERROR" "path" "apps/backend" "$EXCLUDE"
check_pattern "ERROR" "path" "apps/frontend" "$EXCLUDE"
check_pattern "ERROR" "path" "apps/manager" "$EXCLUDE"
check_pattern "ERROR" "path" "libs/domain" "$EXCLUDE"
check_pattern "ERROR" "path" "libs/backend" "$EXCLUDE"
check_pattern "ERROR" "path" "libs/app-database" "$EXCLUDE"
check_pattern "ERROR" "path" "src/api/modules" "$EXCLUDE"
check_pattern "ERROR" "path" "src/shared/services" "$EXCLUDE"

echo "=== STACK_ASSUMPTIONS ==="
check_pattern "WARN" "stack" "@nestjs" "detect\|grep\|check"
check_pattern "WARN" "stack" "NestJS" "detect\|exemplo\|ex:"
check_pattern "WARN" "stack" "@angular" "detect\|grep\|check"

echo "=== BEST_PRACTICES ==="
# Check for good patterns
grep -qi "detect\|discover\|dynamic" "$FILE" 2>/dev/null && echo "OK:has_detection" || echo "WARN:best:no_detection_logic"
grep -qi "fallback\|default\|else" "$FILE" 2>/dev/null && echo "OK:has_fallback" || echo "WARN:best:no_fallback"
grep -qi "guide\|inform\|missing\|insuficiente" "$FILE" 2>/dev/null && echo "OK:has_guidance" || echo "WARN:best:no_guidance"

echo "=== SUMMARY ==="
echo "ERRORS:$ERRORS"
echo "WARNINGS:$WARNINGS"

if [ "$ERRORS" -gt 0 ]; then
    echo "STATUS:FAIL"
    exit 1
else
    echo "STATUS:PASS"
    exit 0
fi
