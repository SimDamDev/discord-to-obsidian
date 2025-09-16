# 🚀 Première Étape - Setup Initial du Projet

## 📋 Objectif
Créer la structure de base du projet Discord-to-Obsidian avec l'environnement de développement Docker et les configurations initiales.

## 🎯 Livrables Attendus
- Structure de dossiers complète
- Configuration Docker fonctionnelle
- Environnement de développement opérationnel
- Base de données PostgreSQL initialisée
- Configuration des variables d'environnement

## 📁 Structure de Projet à Créer

```
discord-to-obsidian/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.dev.yml
├── README.md
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── lib/
│   │   └── types/
│   └── Dockerfile
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── Dockerfile
├── worker/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── services/
│   │   └── jobs/
│   └── Dockerfile
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── DEVELOPMENT.md
```

## 🔧 Configuration Docker

### docker-compose.yml (Production)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: discord_obsidian
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/discord_obsidian
      REDIS_URL: redis://redis:6379
      DISCORD_CLIENT_ID: ${DISCORD_CLIENT_ID}
      DISCORD_CLIENT_SECRET: ${DISCORD_CLIENT_SECRET}
      DISCORD_BOT_TOKEN: ${DISCORD_BOT_TOKEN}
      GITHUB_TOKEN: ${GITHUB_TOKEN}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - api

  worker:
    build:
      context: ./worker
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/discord_obsidian
      REDIS_URL: redis://redis:6379
      DISCORD_BOT_TOKEN: ${DISCORD_BOT_TOKEN}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
  redis_data:
```

### docker-compose.dev.yml (Développement)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: discord_obsidian_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

volumes:
  postgres_dev_data:
  redis_dev_data:
```

## 📦 Configuration des Packages

### package.json (Root)
```json
{
  "name": "discord-to-obsidian",
  "version": "1.0.0",
  "description": "Application web pour connecter Discord à Obsidian",
  "scripts": {
    "dev": "docker-compose -f docker-compose.dev.yml up -d && npm run dev:all",
    "dev:all": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\" \"npm run dev:worker\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev:worker": "cd worker && npm run dev",
    "build": "docker-compose build",
    "start": "docker-compose up",
    "stop": "docker-compose down",
    "clean": "docker-compose down -v && docker system prune -f",
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:reset": "cd backend && npx prisma migrate reset",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest",
    "test:integration": "jest --config jest.integration.config.js",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### frontend/package.json
```json
{
  "name": "discord-to-obsidian-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next-auth": "^4.0.0",
    "@next-auth/prisma-adapter": "^1.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "@radix-ui/react-slot": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0",
    "socket.io-client": "^4.7.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### backend/package.json
```json
{
  "name": "discord-to-obsidian-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "redis": "^4.6.0",
    "bull": "^4.12.0",
    "discord.js": "^14.14.0",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "puppeteer": "^21.0.0",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "socket.io": "^4.7.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/morgan": "^1.9.0",
    "@types/compression": "^1.7.0",
    "@types/node": "^20.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

### worker/package.json
```json
{
  "name": "discord-to-obsidian-worker",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "discord.js": "^14.14.0",
    "redis": "^4.6.0",
    "bull": "^4.12.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "puppeteer": "^21.0.0",
    "winston": "^3.11.0",
    "dotenv": "^16.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

## 🗄️ Configuration Base de Données

### backend/prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  discordId     String    @unique
  username      String
  avatarUrl     String?
  accessToken   String?
  refreshToken  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  servers       DiscordServer[]
  channels      MonitoredChannel[]
  notes         ObsidianNote[]
  githubConfig  GitHubConfig?

  @@map("users")
}

model DiscordServer {
  id        String   @id @default(cuid())
  discordId String   @unique
  name      String
  iconUrl   String?
  ownerId   String
  createdAt DateTime @default(now())

  channels  MonitoredChannel[]

  @@map("discord_servers")
}

model MonitoredChannel {
  id        String   @id @default(cuid())
  discordId String
  name      String
  serverId  String
  userId    String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  server    DiscordServer @relation(fields: [serverId], references: [id])
  user      User          @relation(fields: [userId], references: [id])
  messages  DiscordMessage[]

  @@map("monitored_channels")
}

model DiscordMessage {
  id        String   @id @default(cuid())
  discordId String   @unique
  channelId String
  authorId  String
  content   String
  timestamp DateTime
  hasLinks  Boolean  @default(false)
  processed Boolean  @default(false)
  createdAt DateTime @default(now())

  channel   MonitoredChannel @relation(fields: [channelId], references: [id])
  links     ExtractedLink[]
  notes     ObsidianNote[]

  @@map("discord_messages")
}

model ExtractedLink {
  id                String   @id @default(cuid())
  messageId         String
  url               String
  title             String?
  description       String?
  content           String?
  domain            String?
  extractionMethod  String?
  status            String   @default("pending")
  createdAt         DateTime @default(now())

  message           DiscordMessage @relation(fields: [messageId], references: [id])
  notes             ObsidianNote[]

  @@map("extracted_links")
}

model ObsidianNote {
  id              String   @id @default(cuid())
  title           String
  content         String
  filePath        String
  messageId       String?
  linkId          String?
  tags            String[]
  githubCommitSha String?
  createdAt       DateTime @default(now())

  message         DiscordMessage? @relation(fields: [messageId], references: [id])
  link            ExtractedLink?  @relation(fields: [linkId], references: [id])
  user            User            @relation(fields: [userId], references: [id])
  userId          String

  @@map("obsidian_notes")
}

model GitHubConfig {
  id           String   @id @default(cuid())
  userId       String   @unique
  repository   String
  branch       String   @default("main")
  accessToken  String
  vaultPath    String   @default("notes/")
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id])

  @@map("github_configs")
}
```

## 🔧 Configuration TypeScript

### tsconfig.json (Root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### frontend/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🎨 Configuration Frontend

### frontend/next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['cdn.discordapp.com', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### frontend/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## 🔐 Variables d'Environnement

### .env.example
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/discord_obsidian"
DB_PASSWORD="your_secure_password"

# Redis
REDIS_URL="redis://localhost:6379"

# Discord
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"
DISCORD_BOT_TOKEN="your_discord_bot_token"

# GitHub
GITHUB_TOKEN="your_github_token"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# API
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Environment
NODE_ENV="development"
```

## 📝 Fichiers de Configuration

### .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# Database
*.db
*.sqlite

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Docker
.dockerignore

# Prisma
prisma/migrations/
```

### .eslintrc.js
```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
}
```

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 🚀 Instructions d'Exécution

1. **Créer la structure de dossiers** selon le schéma ci-dessus
2. **Créer tous les fichiers** avec le contenu fourni
3. **Installer les dépendances** dans chaque dossier (frontend, backend, worker)
4. **Configurer les variables d'environnement** en copiant .env.example vers .env
5. **Démarrer les services** avec `docker-compose -f docker-compose.dev.yml up -d`
6. **Initialiser la base de données** avec `npm run db:migrate`
7. **Vérifier que tout fonctionne** en accédant à http://localhost:3000

## ✅ Critères de Validation

- [x] Structure de dossiers créée
- [x] Docker Compose fonctionne
- [x] Base de données PostgreSQL accessible
- [x] Redis accessible
- [x] Frontend Next.js démarre sur port 3000
- [x] Backend Express démarre sur port 3001
- [x] Worker démarre sans erreur
- [x] Variables d'environnement configurées
- [x] Base de données initialisée avec Prisma
- [x] Linting et formatting configurés

## 🎯 Prochaine Étape

Une fois cette première étape terminée, nous passerons à l'implémentation de l'authentification Discord et de la surveillance des canaux.
