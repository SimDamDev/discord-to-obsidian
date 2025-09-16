# Discord-to-Obsidian

Application web pour connecter Discord à Obsidian et automatiser la création de notes à partir des messages Discord.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Docker et Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd discord-to-obsidian
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp env.example .env
   # Éditer .env avec vos valeurs
   ```

3. **Démarrer les services de développement**
   ```bash
   npm run dev
   ```

4. **Initialiser la base de données**
   ```bash
   npm run db:migrate
   ```

5. **Accéder à l'application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Structure du Projet

```
discord-to-obsidian/
├── frontend/          # Application Next.js
├── backend/           # API Express + Prisma
├── worker/            # Worker pour traitement en arrière-plan
├── docs/              # Documentation
└── docker-compose.yml # Configuration Docker
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Démarrer l'environnement de développement
- `npm run build` - Construire l'application
- `npm run start` - Démarrer en production
- `npm run db:migrate` - Exécuter les migrations
- `npm run lint` - Linter le code
- `npm run format` - Formater le code

## 🔧 Configuration

Voir le fichier `env.example` pour la liste complète des variables d'environnement requises.

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Development Guide](docs/DEVELOPMENT.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
