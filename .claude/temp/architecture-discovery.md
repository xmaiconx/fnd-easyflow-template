# Architecture Discovery Document

**Generated:** 2025-12-22T22:57:23Z
**Scope:** Automated initial codebase scan

---

## 1. Project Structure

### Directory Tree (depth 3)
```
.
./.claude
./.claude/commands
./.claude/scripts
./.claude/skills
./.claude/skills/api-testing
./.claude/skills/backend-development
./.claude/skills/code-review
./.claude/skills/database-development
./.claude/skills/documentation-style
./.claude/skills/frontend-development
./.claude/skills/health-check
./.claude/skills/security-audit
./.claude/skills/stripe
./.claude/skills/subagent-driven-development
./.claude/skills/updating-claude-documentation
./.claude/skills/using-git-worktrees
./.claude/skills/ux-design
./.claude/skills/write-skill
./.claude/temp
./.git
./.kilocode
./.turbo
./.turbo/cache
./.turbo/cookies
./.turbo/daemon
./.vscode
./.worktrees
./apps
./apps/backend
./apps/backend/.turbo
./apps/backend/dist
./apps/backend/src
./apps/frontend
./apps/frontend/.turbo
./apps/frontend/@
./apps/frontend/dist
./apps/frontend/node_modules
./apps/frontend/public
./apps/frontend/src
./apps/manager
./apps/manager/.turbo
./apps/manager/dist
./apps/manager/node_modules
./apps/manager/src
./docs
./docs/brainstorm
./docs/design-system
./docs/features
./docs/features/F0001-internal-auth-admin-panel
./docs/features/F0002-frontend-v2-rebuild
./docs/features/F0003-workspace-dropdown-loading-sidebar
./docs/features/F0004-account-admin-panel
./docs/features/F0005-admin-ux-restructure
./docs/features/F0006-manager-v2-rebuild
./docs/features/F0007-manager-metrics-dashboard
./docs/features/F0008-manager-plan-management
./docs/instructions
./docs/setup
./infra
./libs
./libs/app-database
./libs/app-database/.turbo
./libs/app-database/dist
./libs/app-database/migrations
./libs/app-database/seeds
./libs/app-database/src
./libs/backend
./libs/backend/.turbo
./libs/backend/dist
./libs/backend/src
./libs/domain
./libs/domain/.turbo
./libs/domain/dist
./libs/domain/src
./node_modules
./supabase
./supabase/.temp
```

## 2. Package Configuration

### All package.json files

#### 📦 ./apps/backend/package.json
```json
{
  "name": "@fnd/api",
  "version": "1.0.0",
  "description": "Backend API para FND MetaTemplate",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc --build",
    "clean": "rimraf dist tsconfig.tsbuildinfo",
    "dev": "nodemon",
    "start": "node dist/local.js"
  },
  "dependencies": {
    "@fnd/backend": "*",
    "@fnd/database": "*",
    "@fnd/domain": "*",
    "@nestjs/bullmq": "^10.0.0",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/cqrs": "^11.0.3",
    "@nestjs/platform-express": "^10.4.20",
    "@supabase/supabase-js": "^2.49.2",
    "bullmq": "^5.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.2",
    "ioredis": "^5.3.0",
    "reflect-metadata": "^0.1.13",
    "resend": "^2.0.0",
    "stripe": "^17.7.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@swc-node/register": "^1.11.1",
    "@swc/core": "^1.13.5",
    "@types/express": "^5.0.6",
    "@types/node": "^20.0.0",
    "nodemon": "^3.1.10",
    "ts-node": "^10.9.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.0.0"
  }
}
```

#### 📦 ./apps/frontend/package.json
```json
{
  "name": "@fnd/frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "vite build",
    "typecheck": "tsc -b",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^4.35.0",
    "@tanstack/react-table": "^8.20.5",
    "axios": "^1.5.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^2.30.0",
    "framer-motion": "^11.12.0",
    "lucide-react": "^0.460.0",
    "next-themes": "^0.4.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.69.0",
    "react-router-dom": "^6.15.0",
    "recharts": "^2.10.0",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.5.5",
    "vaul": "^1.1.2",
    "zod": "^3.25.76",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

#### 📦 ./apps/manager/package.json
```json
{
  "name": "@fnd/manager",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "vite build",
    "typecheck": "tsc -b",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^4.35.0",
    "@tanstack/react-table": "^8.20.5",
    "axios": "^1.5.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^2.30.0",
    "framer-motion": "^11.12.0",
    "lucide-react": "^0.460.0",
    "react": "^18.2.0",
    "react-day-picker": "^9.13.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.69.0",
    "react-router-dom": "^6.15.0",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.5.5",
    "vaul": "^1.1.2",
    "zod": "^3.25.76",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}
```

#### 📦 ./libs/app-database/package.json
```json
{
  "name": "@fnd/database",
  "version": "1.0.0",
  "description": "Database layer with Kysely",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc --build",
    "clean": "rimraf dist tsconfig.tsbuildinfo",
    "migrate": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "migrate:make": "knex migrate:make",
    "seed": "knex seed:run",
    "seed:make": "knex seed:make"
  },
  "dependencies": {
    "@fnd/domain": "*",
    "dotenv": "^16.4.5",
    "knex": "^3.0.0",
    "kysely": "^0.27.0",
    "pg": "^8.11.0",
    "pg-connection-string": "^2.6.2"
  },
  "devDependencies": {
    "@types/pg": "^8.10.0",
    "typescript": "^5.0.0"
  }
}
```

#### 📦 ./libs/backend/package.json
```json
{
  "name": "@fnd/backend",
  "version": "1.0.0",
  "description": "Backend core - CQRS, messaging, services interfaces",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc --build",
    "clean": "rimraf dist tsconfig.tsbuildinfo"
  },
  "dependencies": {
    "@fnd/domain": "*"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}```

#### 📦 ./libs/domain/package.json
```json
{
  "name": "@fnd/domain",
  "version": "1.0.0",
  "description": "Pure domain models and enums",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc --build",
    "clean": "rimraf dist tsconfig.tsbuildinfo"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

#### 📦 ./package.json
```json
{
  "name": "fnd-metatemplate",
  "version": "1.0.0",
  "description": "Template base para alunos FND construírem SaaS com IA",
  "private": true,
  "packageManager": "npm@9.0.0",
  "workspaces": [
    "apps/*",
    "libs/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "clean": "turbo run clean",
    "dev": "turbo run dev --parallel",
    "dev:api": "cd apps/backend && npm run dev:api",
    "dev:workers": "cd apps/backend && npm run dev:workers",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "migrate:latest": "cd libs/app-database && npx knex migrate:latest",
    "migrate:rollback": "cd libs/app-database && npx knex migrate:rollback",
    "seed:run": "cd libs/app-database && npx knex seed:run",
    "test:infra:start": "node .claude/scripts/start-test-infra.js",
    "test:infra:stop": "node .claude/scripts/stop-test-infra.js"
  },
  "devDependencies": {
    "@orangeopensource/hurl": "^7.1.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-local": "^1.0.38",
    "httpyac": "^6.16.7",
    "rimraf": "^5.0.0",
    "supabase": "^2.66.0",
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-select": "^2.2.6",
    "bcryptjs": "^3.0.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0"
  }
}
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"],
      "cache": true
    },
    "clean": {
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "dev:api": {
      "cache": false,
      "persistent": true
    },
    "dev:workers": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "lint": {
      "outputs": [],
```

### TypeScript Configuration
**tsconfig.json:** {
**tsconfig.base.json:** {
**tsconfig.base.json:** {

## 2.5 Stack Detection (Frameworks & Dependencies)

### Backend Frameworks
```
package.json:    "@nestjs/jwt": "^11.0.2",
package.json:    "@nestjs/passport": "^11.0.5",
```

### Frontend Frameworks
```
package.json:    "@radix-ui/react-checkbox": "^1.3.3",
package.json:    "@radix-ui/react-select": "^2.2.6",
```

### Database & ORM
```
package.json:    "migrate:latest": "cd libs/app-database && npx knex migrate:latest",
package.json:    "migrate:rollback": "cd libs/app-database && npx knex migrate:rollback",
package.json:    "seed:run": "cd libs/app-database && npx knex seed:run",
```

### Infrastructure & Services
```
package.json:    "supabase": "^2.66.0",
```

## 3. Architectural Patterns

### CQRS Pattern (commands/queries)
```
./.claude/commands
./apps/backend/dist/api/modules/account-admin/commands
./apps/backend/dist/api/modules/account-admin/commands/handlers
./apps/backend/dist/api/modules/account-admin/events/handlers
./apps/backend/dist/api/modules/auth/commands
./apps/backend/dist/api/modules/auth/events/handlers
./apps/backend/dist/api/modules/manager/commands
./apps/backend/dist/api/modules/manager/commands/handlers
./apps/backend/dist/api/modules/manager/handlers
./apps/backend/src/api/modules/account-admin/commands
```

### Repository/DAO Pattern
```
./libs/app-database/dist/interfaces/IAccountRepository.d.ts
./libs/app-database/dist/interfaces/IAccountRepository.d.ts.map
./libs/app-database/dist/interfaces/IAccountRepository.js
./libs/app-database/dist/interfaces/IAccountRepository.js.map
./libs/app-database/dist/interfaces/IAuditLogRepository.d.ts
./libs/app-database/dist/interfaces/IAuditLogRepository.d.ts.map
./libs/app-database/dist/interfaces/IAuditLogRepository.js
./libs/app-database/dist/interfaces/IAuditLogRepository.js.map
./libs/app-database/dist/interfaces/IInviteRepository.d.ts
./libs/app-database/dist/interfaces/IInviteRepository.d.ts.map
./libs/app-database/dist/interfaces/IInviteRepository.js
./libs/app-database/dist/interfaces/IInviteRepository.js.map
./libs/app-database/dist/interfaces/IPlanRepository.d.ts
./libs/app-database/dist/interfaces/IPlanRepository.d.ts.map
./libs/app-database/dist/interfaces/IPlanRepository.js
```

### Service/Use Case Pattern
```
./apps/backend/src/api/modules/account-admin/account-admin.service.ts
./apps/backend/src/api/modules/audit/audit.service.ts
./apps/backend/src/api/modules/auth/services/password.service.ts
./apps/backend/src/api/modules/auth/services/rate-limit.service.ts
./apps/backend/src/api/modules/auth/services/token.service.ts
./apps/backend/src/api/modules/billing/billing.service.ts
./apps/backend/src/api/modules/billing/plan.service.ts
./apps/backend/src/api/modules/billing/stripe-webhook.service.ts
./apps/backend/src/api/modules/billing/stripe.service.ts
./apps/backend/src/api/modules/manager/manager-plan.service.ts
./apps/backend/src/api/modules/manager/manager-subscription.service.ts
./apps/backend/src/api/modules/manager/manager.service.ts
./apps/backend/src/api/modules/workspace/workspace.service.ts
./apps/backend/src/shared/services/configuration.service.ts
./apps/backend/src/shared/services/email-queue.service.ts
```

### Dependency Injection
```
export interface InviteCreatedDto {
export interface InviteListItemDto {
export interface ImpersonateResponseDto {
  Injectable,
@Injectable()
import { Injectable } from '@nestjs/common';
@Injectable()
import { Injectable } from '@nestjs/common';
@Injectable()
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
```

## 4. Domain Models & Entities

### Entity/Model Files
```
```

### Enums & Constants
```
./libs/domain/dist/enums/EntityStatus.d.ts
./libs/domain/dist/enums/EntityStatus.d.ts.map
./libs/domain/dist/enums/EntityStatus.js
./libs/domain/dist/enums/EntityStatus.js.map
./libs/domain/dist/enums/index.d.ts
./libs/domain/dist/enums/index.d.ts.map
./libs/domain/dist/enums/index.js
./libs/domain/dist/enums/index.js.map
./libs/domain/dist/enums/InviteStatus.d.ts
./libs/domain/dist/enums/InviteStatus.d.ts.map
```

### DTOs & Schemas
```
```

## 5. Infrastructure & Configuration

### Entry Points
```
./apps/backend/src/api/main.ts
./apps/backend/src/api/modules/account-admin/commands/handlers/index.ts
./apps/backend/src/api/modules/account-admin/commands/index.ts
./apps/backend/src/api/modules/account-admin/dtos/index.ts
./apps/backend/src/api/modules/account-admin/events/handlers/index.ts
./apps/backend/src/api/modules/account-admin/events/index.ts
./apps/backend/src/api/modules/audit/dtos/index.ts
./apps/backend/src/api/modules/auth/commands/index.ts
./apps/backend/src/api/modules/auth/dtos/index.ts
./apps/backend/src/api/modules/auth/events/handlers/index.ts
```

### Configuration Files
```
./apps/backend/.env
./apps/backend/.env.example
./apps/backend/tsconfig.json
./apps/frontend/tsconfig.app.json
./apps/frontend/tsconfig.json
./apps/frontend/tsconfig.node.json
./apps/manager/.env.example
./apps/manager/tsconfig.app.json
./apps/manager/tsconfig.json
./apps/manager/tsconfig.node.json
```

### Middleware/Interceptors/Guards
```
./apps/backend/dist/api/guards/admin.guard.d.ts
./apps/backend/dist/api/guards/admin.guard.d.ts.map
./apps/backend/dist/api/guards/admin.guard.js
./apps/backend/dist/api/guards/admin.guard.js.map
./apps/backend/dist/api/guards/jwt-auth.guard.d.ts
./apps/backend/dist/api/guards/jwt-auth.guard.d.ts.map
./apps/backend/dist/api/guards/jwt-auth.guard.js
./apps/backend/dist/api/guards/jwt-auth.guard.js.map
./apps/backend/dist/api/guards/local-auth.guard.d.ts
./apps/backend/dist/api/guards/local-auth.guard.d.ts.map
```

### Workers/Jobs/Queue Processors
```
./apps/backend/dist/shared/adapters/bullmq-queue.adapter.d.ts
./apps/backend/dist/shared/adapters/bullmq-queue.adapter.d.ts.map
./apps/backend/dist/shared/adapters/bullmq-queue.adapter.js
./apps/backend/dist/shared/adapters/bullmq-queue.adapter.js.map
./apps/backend/dist/shared/services/email-queue.service.d.ts
./apps/backend/dist/shared/services/email-queue.service.d.ts.map
./apps/backend/dist/shared/services/email-queue.service.js
./apps/backend/dist/shared/services/email-queue.service.js.map
./apps/backend/src/shared/adapters/bullmq-queue.adapter.ts
./apps/backend/src/shared/services/email-queue.service.ts
```

## 5.5 Routes & Endpoints (Framework Specific)

### NestJS Controllers
```
./apps/backend/src/api/app.controller.ts
./apps/backend/src/api/modules/account-admin/account-admin.controller.ts
./apps/backend/src/api/modules/audit/audit.controller.ts
./apps/backend/src/api/modules/auth/auth.controller.ts
./apps/backend/src/api/modules/billing/billing.controller.ts
./apps/backend/src/api/modules/manager/manager.controller.ts
./apps/backend/src/api/modules/workspace/workspace.controller.ts
```

### NestJS Controller Routes
```
File: ./apps/backend/src/api/app.controller.ts
@Controller()
  @Get()

File: ./apps/backend/src/api/modules/account-admin/account-admin.controller.ts
@Controller('admin')
  @Get('users')
  @Get('users/:id')
  @Patch('users/:id/role')
  @Patch('users/:id/status')
  @Get('sessions')
  @Delete('sessions/:id')
  @Post('sessions/:userId/revoke-all')
  @Get('invites')
  @Post('invites')

File: ./apps/backend/src/api/modules/audit/audit.controller.ts
@Controller('audit-logs')
  @Get()
  @Get(':id')

File: ./apps/backend/src/api/modules/auth/auth.controller.ts
@Controller('auth')
  @Post('signup')
  @Get('invite/:token')
  @Post('signin')
  @Post('refresh')
  @Post('logout')
  @Post('forgot-password')
  @Post('reset-password')
  @Post('verify-email')
  @Post('resend-verification')

File: ./apps/backend/src/api/modules/billing/billing.controller.ts
@Controller('billing')
  @Post('checkout')
  @Post('portal')
  @Get('workspace/:workspaceId')
  @Get('plans')
  @Post('webhook')

```

### Express/Fastify Routes
```
./.claude/skills/ux-design/tanstack-router-docs.md
./apps/frontend/src/components/guards/admin-route.tsx
./apps/frontend/src/routes.tsx
./apps/manager/src/components/guards/protected-route.tsx
```

### Django Views & URLs
```
```

### Flask/FastAPI Routes
```
```

### Rails Controllers
```
```

## 7. Project Structure

### All Projects by Type

**apps/**
- `backend` (@fnd/api)
- `frontend` (@fnd/frontend)
- `manager` (@fnd/manager)

**libs/**
- `app-database` (@fnd/database)
- `backend` (@fnd/backend)
- `domain` (@fnd/domain)

## 8. Dependencies (Major Packages)

### Backend Frameworks
-     "@nestjs/jwt": "^11.0.2",
-     "@nestjs/passport": "^11.0.5",

### Frontend Frameworks
-     "@radix-ui/react-checkbox": "^1.3.3",
-     "@radix-ui/react-select": "^2.2.6",

### Database & ORM
-     "migrate:latest": "cd libs/app-database && npx knex migrate:latest",
-     "migrate:rollback": "cd libs/app-database && npx knex migrate:rollback",
-     "seed:run": "cd libs/app-database && npx knex seed:run",

## 9. Environment Configuration

No .env.example found

## 10. Important Files Detected

### Entry Points
- ./apps/backend/src/api/main.ts
- ./apps/backend/src/main.hybrid.ts
- ./apps/backend/src/main.ts

### Module Definitions
Total: 9

## 11. Summary Statistics

- **Total TypeScript files:** 368
- **Total Controllers:** 7
- **Total Services:** 19
- **Total Tests:** 0

---

**Document created at:** seg, 22 de dez de 2025 20:03:17
**This file is temporary and will be deleted after architecture analysis is complete.**
