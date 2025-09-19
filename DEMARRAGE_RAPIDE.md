# 🚀 Démarrage Rapide - Discord to Obsidian

## Démarrage en une commande

```bash
npm run dev
```

C'est tout ! Cette commande va :
- ✅ Démarrer PostgreSQL et Redis
- ✅ Construire et démarrer l'API backend
- ✅ Construire et démarrer le frontend Next.js
- ✅ Construire et démarrer le worker
- ✅ Exécuter les migrations de base de données automatiquement

## Accès aux services

- **Frontend** : http://localhost:3000
- **API Backend** : http://localhost:3001
- **Base de données** : localhost:5432 (postgres/dev_password)
- **Redis** : localhost:6379

## Commandes utiles

```bash
# Arrêter tous les services
npm run stop

# Nettoyer complètement (supprime les volumes)
npm run clean

# Voir les logs
docker-compose logs -f

# Redémarrer un service spécifique
docker-compose restart api
```

## Configuration

Le fichier `.env.dev` contient toutes les variables de développement. Pour la production, utilisez `.env` avec vos vraies valeurs Discord.

## Problèmes courants

- **Port déjà utilisé** : `npm run kill-ports` puis `npm run dev`
- **Base de données corrompue** : `npm run clean` puis `npm run dev`
- **Erreur de build** : `docker-compose build --no-cache` puis `npm run dev`

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Worker        │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Node.js)     │
│   Port 3000     │    │   Port 3001     │    │   Background    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Port 5432     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   Port 6379     │
                    └─────────────────┘
```
