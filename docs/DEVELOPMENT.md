# Development Guide

## Setup de l'environnement de développement

### Prérequis

- Node.js 18+
- Docker et Docker Compose
- Git

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd discord-to-obsidian
   ```

2. **Installer les dépendances**
   ```bash
   # Root dependencies
   npm install
   
   # Frontend dependencies
   cd frontend && npm install && cd ..
   
   # Backend dependencies
   cd backend && npm install && cd ..
   
   # Worker dependencies
   cd worker && npm install && cd ..
   ```

3. **Configurer l'environnement**
   ```bash
   cp env.example .env
   # Éditer .env avec vos valeurs de développement
   ```

4. **Démarrer les services de base**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

5. **Initialiser la base de données**
   ```bash
   cd backend
   npx prisma migrate dev
   cd ..
   ```

6. **Démarrer le développement**
   ```bash
   npm run dev
   ```

## Structure du code

### Frontend (Next.js)

- `src/app/` - Pages et layouts
- `src/components/` - Composants réutilisables
- `src/lib/` - Utilitaires et configurations
- `src/types/` - Types TypeScript

### Backend (Express + Prisma)

- `src/routes/` - Routes API
- `src/services/` - Logique métier
- `src/models/` - Modèles de données
- `src/utils/` - Utilitaires
- `prisma/` - Schéma et migrations

### Worker

- `src/services/` - Services de traitement
- `src/jobs/` - Jobs en arrière-plan

## Scripts de développement

```bash
# Démarrer tout l'environnement
npm run dev

# Démarrer seulement le frontend
npm run dev:frontend

# Démarrer seulement le backend
npm run dev:backend

# Démarrer seulement le worker
npm run dev:worker

# Linter le code
npm run lint

# Formater le code
npm run format

# Vérifier les types
npm run type-check

# Tests
npm run test
```

## Base de données

### Prisma

```bash
# Créer une migration
cd backend
npx prisma migrate dev --name migration_name

# Réinitialiser la base
npx prisma migrate reset

# Visualiser la base
npx prisma studio
```

### Modèles principaux

- `User` - Utilisateurs Discord
- `DiscordServer` - Serveurs Discord
- `MonitoredChannel` - Canaux surveillés
- `DiscordMessage` - Messages Discord
- `ExtractedLink` - Liens extraits
- `ObsidianNote` - Notes créées
- `GitHubConfig` - Configuration GitHub

## Tests

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests avec couverture
npm run test:coverage
```

## Debugging

### Frontend
- Utiliser les DevTools du navigateur
- Logs dans la console

### Backend
- Logs dans la console
- Utiliser `console.log()` pour le debug

### Worker
- Logs dans la console
- Surveiller les jobs Redis

## Contribution

1. Créer une branche feature
2. Implémenter les changements
3. Ajouter des tests
4. Vérifier le linting
5. Créer une Pull Request

## Standards de code

- TypeScript strict mode
- ESLint + Prettier
- Tests unitaires pour la logique métier
- Documentation des APIs
- Messages de commit conventionnels
