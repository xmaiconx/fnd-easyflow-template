#!/bin/bash
# Architecture Discovery Script
# Automated initial scan of the codebase
# Creates temporary document: .claude/temp/architecture-discovery.md

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
TEMP_DIR=".claude/temp"
DISCOVERY_FILE="${TEMP_DIR}/architecture-discovery.md"
PROJECT_ROOT="."

# Create temp directory
mkdir -p "$TEMP_DIR"

# Start discovery document
{
  echo "# Architecture Discovery Document"
  echo ""
  echo "**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "**Scope:** Automated initial codebase scan"
  echo ""
  echo "---"
  echo ""

  # Section 1: Project Structure
  echo "## 1. Project Structure"
  echo ""
  echo "### Directory Tree (depth 3)"
  echo '```'
  if command -v tree &> /dev/null; then
    tree -L 3 -I 'node_modules|dist|build|.git|.next' 2>/dev/null || find . -maxdepth 3 -type d -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/.git/*' -not -path '*/.next/*' | sort
  else
    find . -maxdepth 3 -type d -not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/.git/*' -not -path '*/.next/*' | sort
  fi
  echo '```'
  echo ""

  # Section 2: Package Configuration
  echo "## 2. Package Configuration"
  echo ""

  # Root package.json
  if [ -f "package.json" ]; then
    echo "### package.json (root)"
    echo '```json'
    cat package.json | jq '{name, version, private, workspaces, type}' 2>/dev/null || head -20 package.json
    echo '```'
    echo ""
  fi

  # Turbo.json
  if [ -f "turbo.json" ]; then
    echo "### turbo.json"
    echo '```json'
    cat turbo.json | jq '{pipeline: .pipeline | keys}' 2>/dev/null || cat turbo.json | head -30
    echo '```'
    echo ""
  fi

  # TypeScript config
  if [ -f "tsconfig.json" ] || [ -f "tsconfig.base.json" ]; then
    echo "### TypeScript Configuration"
    for tsfile in tsconfig.json tsconfig.base.json tsconfig.*.json; do
      if [ -f "$tsfile" ]; then
        echo "**$tsfile:** $(head -1 $tsfile | sed 's/.*"extends": "\(.*\)".*/extends: \1/' || echo 'Found')"
      fi
    done
    echo ""
  fi

  # Section 2.5: Stack Detection (All Frameworks)
  echo "## 2.5 Stack Detection (Frameworks & Dependencies)"
  echo ""

  echo "### Backend Frameworks"
  echo '```'
  grep -ri "nestjs\|express\|fastify\|hono\|django\|flask\|rails\|laravel\|spring\|actix" package.json */package.json Gemfile Pipfile go.mod cargo.toml requirements.txt 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Frontend Frameworks"
  echo '```'
  grep -ri "react\|vue\|angular\|next\|svelte\|astro\|nuxt\|remix" package.json */package.json 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Database & ORM"
  echo '```'
  grep -ri "postgresql\|mysql\|mongodb\|sqlite\|kysely\|typeorm\|drizzle\|prisma\|knex\|sequelize\|sqlalchemy" package.json */package.json requirements.txt Gemfile 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Infrastructure & Services"
  echo '```'
  grep -ri "redis\|kafka\|rabbitmq\|bullmq\|celery\|sidekiq\|stripe\|supabase\|firebase" package.json */package.json requirements.txt Gemfile 2>/dev/null | head -10
  echo '```'
  echo ""

  # Section 3: Architectural Patterns
  echo "## 3. Architectural Patterns"
  echo ""

  echo "### CQRS Pattern (commands/queries)"
  echo '```'
  find . -type d \( -name "commands" -o -name "queries" -o -name "handlers" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Repository/DAO Pattern"
  echo '```'
  find . -type f \( -iname "*repository*" -o -iname "*dao*" \) -not -path "*/node_modules/*" 2>/dev/null | head -15
  echo '```'
  echo ""

  echo "### Service/Use Case Pattern"
  echo '```'
  find . -type f \( -name "*.service.ts" -o -name "*.use-case.ts" -o -name "*service.py" -o -name "*Service.java" \) -not -path "*/node_modules/*" 2>/dev/null | head -15
  echo '```'
  echo ""

  echo "### Dependency Injection"
  echo '```'
  grep -rh "@Injectable\|@Service\|@Bean\|Inject\|Autowired\|export interface I" --include="*.ts" --include="*.java" --include="*.py" . 2>/dev/null | grep -v node_modules | head -10
  echo '```'
  echo ""

  # Section 4: Domain Models
  echo "## 4. Domain Models & Entities"
  echo ""

  echo "### Entity/Model Files"
  echo '```'
  find . -type f \( -name "*.entity.ts" -o -name "*.model.ts" -o -name "*.model.py" -o -name "*Model.java" \) -not -path "*/node_modules/*" 2>/dev/null | head -20
  echo '```'
  echo ""

  echo "### Enums & Constants"
  echo '```'
  find . -type f \( -name "*enum*" -o -path "*/enums/*" -o -path "*/constants/*" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### DTOs & Schemas"
  echo '```'
  find . -type f \( -name "*.dto.ts" -o -name "*.schema.ts" -o -name "*.interface.ts" \) -not -path "*/node_modules/*" 2>/dev/null | head -15
  echo '```'
  echo ""

  # Section 5: Infrastructure Files
  echo "## 5. Infrastructure & Configuration"
  echo ""

  echo "### Entry Points"
  echo '```'
  find . -type f \( -name "main.ts" -o -name "main.py" -o -name "app.ts" -o -name "index.ts" -o -name "server.ts" -o -name "application.rb" -o -name "main.rs" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Configuration Files"
  echo '```'
  find . -type f \( -name "config.ts" -o -name "*config*.json" -o -name "*.env*" -o -name "settings.py" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Middleware/Interceptors/Guards"
  echo '```'
  find . -type f \( -name "*middleware*" -o -name "*interceptor*" -o -name "*filter*" -o -name "*guard*" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Workers/Jobs/Queue Processors"
  echo '```'
  find . -type f \( -name "*.worker.ts" -o -name "*queue*" -o -name "*job*" -o -name "*task.py" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  # Section 5.5: Routes & Endpoints
  echo "## 5.5 Routes & Endpoints (Framework Specific)"
  echo ""

  echo "### NestJS Controllers"
  echo '```'
  find . -name "*.controller.ts" -not -path "*/node_modules/*" 2>/dev/null | sort
  echo '```'
  echo ""

  if [ $(find . -name "*.controller.ts" -not -path "*/node_modules/*" 2>/dev/null | wc -l) -gt 0 ]; then
    echo "### NestJS Controller Routes"
    echo '```'
    for ctrl in $(find . -name "*.controller.ts" -not -path "*/node_modules/*" 2>/dev/null | head -5); do
      echo "File: $ctrl"
      grep -E "@Controller|@Get|@Post|@Put|@Delete|@Patch" "$ctrl" 2>/dev/null | head -10
      echo ""
    done
    echo '```'
    echo ""
  fi

  echo "### Express/Fastify Routes"
  echo '```'
  find . -type f \( -name "*route*" -o -name "*router*" \) -not -path "*/node_modules/*" 2>/dev/null | head -20
  echo '```'
  echo ""

  echo "### Django Views & URLs"
  echo '```'
  find . \( -name "views.py" -o -name "urls.py" \) -not -path "*/node_modules/*" 2>/dev/null | head -10
  echo '```'
  echo ""

  echo "### Flask/FastAPI Routes"
  echo '```'
  grep -rn "@app.route\|@router.get\|@router.post\|@app.get\|@app.post" --include="*.py" . 2>/dev/null | head -20
  echo '```'
  echo ""

  echo "### Rails Controllers"
  echo '```'
  find . -path "*/controllers/*_controller.rb" -not -path "*/node_modules/*" 2>/dev/null
  echo '```'
  echo ""

  # Section 7: All Projects (apps/ and libs/)
  echo "## 7. Project Structure"
  echo ""
  echo "### All Projects by Type"
  echo ""

  # Find all projects
  for proj_type in "apps" "libs" "services" "packages"; do
    if [ -d "$proj_type" ]; then
      echo "**$proj_type/**"
      for project in "$proj_type"/*; do
        if [ -d "$project" ] && [ -f "$project/package.json" ]; then
          PROJ_NAME=$(basename "$project")
          echo "- \`$PROJ_NAME\` ($(jq -r '.name' "$project/package.json" 2>/dev/null || echo 'unknown'))"
        fi
      done
      echo ""
    fi
  done

  # Section 8: Dependencies Summary
  echo "## 8. Dependencies (Major Packages)"
  echo ""
  echo "### Backend Frameworks"
  grep -h "nestjs\|express\|fastify\|hono" package.json */package.json 2>/dev/null | sed 's/^/- /' || echo "- (Not found)"
  echo ""

  echo "### Frontend Frameworks"
  grep -h "react\|vue\|angular\|next" package.json */package.json 2>/dev/null | sed 's/^/- /' || echo "- (Not found)"
  echo ""

  echo "### Database & ORM"
  grep -h "kysely\|typeorm\|drizzle\|prisma\|knex" package.json */package.json 2>/dev/null | sed 's/^/- /' || echo "- (Not found)"
  echo ""

  # Section 9: Environment Configuration
  echo "## 9. Environment Configuration"
  echo ""
  if [ -f ".env.example" ]; then
    echo "### .env.example"
    echo '```'
    cat .env.example | head -30
    if [ $(wc -l < .env.example) -gt 30 ]; then
      echo "... (and $(( $(wc -l < .env.example) - 30 )) more lines)"
    fi
    echo '```'
  else
    echo "No .env.example found"
  fi
  echo ""

  # Section 10: Important Files to Review
  echo "## 10. Important Files Detected"
  echo ""
  echo "### Entry Points"
  find . \( -name "main.ts" -o -name "main.hybrid.ts" -o -name "app.ts" \) -not -path '*/node_modules/*' 2>/dev/null | sed 's/^/- /' || echo "- (Not found)"
  echo ""

  echo "### Module Definitions"
  find . -name "*.module.ts" -not -path '*/node_modules/*' 2>/dev/null | wc -l | xargs echo "Total:"
  echo ""

  # Section 11: Summary Stats
  echo "## 11. Summary Statistics"
  echo ""
  echo "- **Total TypeScript files:** $(find . -name "*.ts" -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | wc -l)"
  echo "- **Total Controllers:** $(find . -name "*.controller.ts" -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
  echo "- **Total Services:** $(find . -name "*.service.ts" -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
  echo "- **Total Tests:** $(find . -name "*.spec.ts" -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
  echo ""
  echo "---"
  echo ""
  echo "**Document created at:** $(date)"
  echo "**This file is temporary and will be deleted after architecture analysis is complete.**"

} > "$DISCOVERY_FILE"

# Output status
echo -e "${GREEN}✅ Discovery complete!${NC}"
echo -e "${BLUE}📄 Document created:${NC} $DISCOVERY_FILE"
echo -e "${YELLOW}📊 Statistics:${NC}"
echo "   - Controllers: $(find . -name "*.controller.ts" -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
echo "   - Services: $(find . -name "*.service.ts" -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
echo "   - TypeScript files: $(find . -name "*.ts" -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | wc -l)"
echo ""
echo -e "${BLUE}👉 Next step: Read this discovery document in PRE-DISCOVERY CHECKPOINT${NC}"
echo "   \`cat $DISCOVERY_FILE\`"
echo ""

# Return the path for the coordinator
echo "$DISCOVERY_FILE"
