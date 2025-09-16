# Configuration des Secrets GitHub

Ce document liste tous les secrets nécessaires pour le déploiement et le fonctionnement de l'application Discord to Obsidian.

## 🔐 Secrets requis

### Application Discord
- `DISCORD_CLIENT_ID` - ID de l'application Discord
- `DISCORD_CLIENT_SECRET` - Secret de l'application Discord  
- `DISCORD_BOT_TOKEN` - Token du bot Discord

### Authentification NextAuth
- `NEXTAUTH_URL` - URL de l'application (ex: https://discord-to-obsidian.vercel.app)
- `NEXTAUTH_SECRET` - Secret pour signer les JWT (généré avec `openssl rand -base64 32`)

### Base de données
- `DATABASE_URL` - URL de connexion PostgreSQL (ex: postgresql://user:password@host:5432/database)

### Déploiement Vercel
- `VERCEL_TOKEN` - Token d'API Vercel
- `VERCEL_ORG_ID` - ID de l'organisation Vercel
- `VERCEL_PROJECT_ID` - ID du projet Vercel

### Déploiement Railway
- `RAILWAY_TOKEN` - Token d'API Railway

## 🛠️ Comment configurer les secrets

### 1. Via l'interface GitHub
1. Allez sur votre repository GitHub
2. Cliquez sur "Settings" → "Secrets and variables" → "Actions"
3. Cliquez sur "New repository secret"
4. Ajoutez chaque secret avec son nom et sa valeur

### 2. Via GitHub CLI
```bash
# Exemple pour ajouter un secret
gh secret set DISCORD_CLIENT_ID --body "votre-client-id-ici"
gh secret set DISCORD_CLIENT_SECRET --body "votre-client-secret-ici"
gh secret set DISCORD_BOT_TOKEN --body "votre-bot-token-ici"
gh secret set NEXTAUTH_URL --body "https://votre-domaine.com"
gh secret set NEXTAUTH_SECRET --body "$(openssl rand -base64 32)"
gh secret set DATABASE_URL --body "postgresql://user:password@host:5432/database"
```

## 🔒 Sécurité

### Bonnes pratiques
- **Ne jamais** commiter les secrets dans le code
- **Utiliser** des variables d'environnement pour tous les secrets
- **Régénérer** les tokens régulièrement
- **Limiter** les permissions des tokens API
- **Auditer** l'accès aux secrets régulièrement

### Rotation des secrets
- Changez les secrets tous les 90 jours
- Régénérez immédiatement en cas de compromission
- Mettez à jour tous les environnements simultanément

## 📋 Checklist de configuration

- [ ] `DISCORD_CLIENT_ID` configuré
- [ ] `DISCORD_CLIENT_SECRET` configuré
- [ ] `DISCORD_BOT_TOKEN` configuré
- [ ] `NEXTAUTH_URL` configuré
- [ ] `NEXTAUTH_SECRET` généré et configuré
- [ ] `DATABASE_URL` configuré
- [ ] `VERCEL_TOKEN` configuré (si déploiement Vercel)
- [ ] `VERCEL_ORG_ID` configuré (si déploiement Vercel)
- [ ] `VERCEL_PROJECT_ID` configuré (si déploiement Vercel)
- [ ] `RAILWAY_TOKEN` configuré (si déploiement Railway)

## 🚨 En cas de problème

### Secrets manquants
- Vérifiez que tous les secrets sont configurés
- Vérifiez l'orthographe des noms de secrets
- Vérifiez que les valeurs sont correctes

### Erreurs de déploiement
- Vérifiez les logs GitHub Actions
- Vérifiez que les services externes (Vercel, Railway) sont accessibles
- Vérifiez que les tokens ont les bonnes permissions

### Support
- Créez une issue GitHub pour les problèmes de configuration
- Contactez support@discord-to-obsidian.com pour l'aide

---

**⚠️ Important** : Ne partagez jamais vos secrets publiquement. Ce document ne contient que les noms des variables, pas leurs valeurs.
