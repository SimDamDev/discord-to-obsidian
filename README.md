# Discord to Obsidian

[![CI/CD Pipeline](https://github.com/SimDamDev/discord-to-obsidian/actions/workflows/ci.yml/badge.svg)](https://github.com/SimDamDev/discord-to-obsidian/actions/workflows/ci.yml)
[![Deploy to Production](https://github.com/SimDamDev/discord-to-obsidian/actions/workflows/deploy.yml/badge.svg)](https://github.com/SimDamDev/discord-to-obsidian/actions/workflows/deploy.yml)
[![RGPD Compliant](https://img.shields.io/badge/RGPD-Compliant-green.svg)](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

Une application qui automatise la création de notes Obsidian à partir de messages Discord publics, avec une conformité RGPD complète.

## 🎯 Fonctionnalités

- **Surveillance automatique** des canaux Discord publics
- **Extraction intelligente** des liens et contenus
- **Création automatique** de notes Obsidian
- **Synchronisation GitHub** pour votre vault Obsidian
- **Conformité RGPD** complète avec consentement granulaire
- **Isolation des données** par utilisateur

## 🔒 Conformité RGPD

Cette application respecte entièrement le RGPD avec :

- ✅ **Consentement granulaire** par type de données
- ✅ **Base légale claire** (consentement Art. 6.1.a RGPD)
- ✅ **Droits utilisateur** (accès, rectification, effacement, portabilité)
- ✅ **Transparence totale** sur l'utilisation des données
- ✅ **Isolation des données** par utilisateur
- ✅ **Contact DPO** disponible

## 🏗️ Architecture

```
discord-to-obsidian/
├── frontend/          # Application Next.js
├── backend/           # API Node.js/Express
├── worker/            # Worker pour le traitement des messages
└── docs/              # Documentation
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL
- Compte Discord avec bot
- Compte GitHub (pour la synchronisation)

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/SimDamDev/discord-to-obsidian.git
cd discord-to-obsidian
```

2. **Installer les dépendances**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Worker
cd ../worker
npm install
```

3. **Configuration des variables d'environnement**

Créez un fichier `.env` dans chaque dossier en vous basant sur `env.example` :

**Frontend (.env)**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
DISCORD_BOT_TOKEN=your-discord-bot-token
DATABASE_URL=postgresql://user:password@localhost:5432/discord_obsidian
```

**Backend (.env)**
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/discord_obsidian
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_CLIENT_ID=your-discord-client-id
```

4. **Configuration de la base de données**
```bash
cd frontend
npx prisma migrate dev
npx prisma generate
```

## 🎮 Utilisation

### Démarrage en développement

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Worker
cd worker
npm run dev
```

### Onboarding utilisateur

1. **Connexion Discord** - Authentification OAuth2
2. **Politique de confidentialité** - Information RGPD
3. **Consentement granulaire** - Choix des données à partager
4. **Configuration du bot** - Invitation sur vos serveurs
5. **Sélection des serveurs** - Choix des serveurs à surveiller
6. **Sélection des canaux** - Choix des canaux spécifiques
7. **Configuration Obsidian** - Paramètres de synchronisation
8. **Finalisation** - Activation de la surveillance

## 🔧 Configuration Discord

### Création du bot Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans l'onglet "Bot", créez un bot
4. Copiez le token du bot
5. Activez les intents nécessaires :
   - `GUILDS`
   - `GUILD_MESSAGES`
   - `MESSAGE_CONTENT`

### Permissions du bot

Le bot nécessite les permissions suivantes :
- `View Channels` (6656)
- `Read Message History`
- `Send Messages` (optionnel)

### Lien d'invitation

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=6656
```

## 📊 Gestion des données

### Droits RGPD implémentés

- **Droit d'accès** : Voir toutes vos données collectées
- **Droit de rectification** : Corriger vos données
- **Droit d'effacement** : Supprimer toutes vos données
- **Droit de portabilité** : Exporter vos données en JSON
- **Droit d'opposition** : Arrêter le traitement
- **Retrait du consentement** : À tout moment

### Pages de gestion

- `/privacy` - Politique de confidentialité complète
- `/data-management` - Gestion de vos données personnelles
- `/developer` - Dashboard développeur (transparence)

## 🛡️ Sécurité

### Ce que l'application peut voir

✅ **Données accessibles :**
- Messages publics des canaux autorisés
- Métadonnées (auteur, date, liens)
- Informations des serveurs où le bot est invité
- Statistiques d'utilisation anonymisées

❌ **Données inaccessibles :**
- Messages privés (DM)
- Canaux privés sans permission
- Données d'autres utilisateurs
- Informations de connexion

### Isolation des données

- Chaque utilisateur a ses propres données isolées
- Aucun partage entre utilisateurs
- Chiffrement des données sensibles
- Logs d'audit pour la traçabilité

## 🚀 Déploiement

### Docker

```bash
# Développement
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

### Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

### Railway/Heroku (Backend)

```bash
cd backend
# Suivre les instructions de déploiement de votre plateforme
```

## 📝 API Documentation

### Endpoints principaux

- `GET /api/discord/servers` - Liste des serveurs
- `GET /api/discord/servers/[id]/channels` - Canaux d'un serveur
- `POST /api/user-bot/create` - Création de configuration bot
- `GET /api/data/export` - Export des données utilisateur
- `DELETE /api/data/delete` - Suppression des données

### Authentification

L'application utilise NextAuth.js avec Discord OAuth2.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

- **Email DPO** : dpo@discord-to-obsidian.com
- **Support technique** : support@discord-to-obsidian.com
- **Issues GitHub** : [Créer une issue](https://github.com/SimDamDev/discord-to-obsidian/issues)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [NextAuth.js](https://next-auth.js.org/) - Authentification
- [Prisma](https://www.prisma.io/) - ORM
- [Discord.js](https://discord.js.org/) - API Discord
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**⚠️ Important** : Cette application respecte entièrement le RGPD. Vos données sont protégées et vous gardez le contrôle total sur leur utilisation.

## 🔗 Liens utiles

- [Documentation RGPD](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)