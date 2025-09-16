# Guide de Contribution

Merci de votre intérêt à contribuer au projet Discord to Obsidian ! Ce guide vous aidera à comprendre comment contribuer de manière efficace.

## 🔒 Conformité RGPD

Ce projet respecte entièrement le RGPD. Toute contribution doit maintenir cette conformité :

- **Pas de données personnelles** dans les commits, issues ou pull requests
- **Respect des droits utilisateur** (accès, rectification, effacement, portabilité)
- **Transparence** sur l'utilisation des données
- **Consentement granulaire** pour toute nouvelle collecte de données

## 🚀 Comment contribuer

### 1. Fork et Clone
```bash
git clone https://github.com/votre-username/discord-to-obsidian.git
cd discord-to-obsidian
```

### 2. Installation
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

### 3. Créer une branche
```bash
git checkout -b feature/nom-de-votre-feature
```

### 4. Développement
- Suivez les conventions de code existantes
- Ajoutez des tests pour vos modifications
- Documentez vos changements
- Respectez la conformité RGPD

### 5. Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd ../backend
npm test
```

### 6. Commit
```bash
git add .
git commit -m "feat: description de votre feature"
```

### 7. Push et Pull Request
```bash
git push origin feature/nom-de-votre-feature
```

## 📝 Conventions de commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage, point-virgules manquants, etc.
- `refactor:` refactoring du code
- `test:` ajout de tests
- `chore:` maintenance

## 🧪 Tests

### Tests unitaires
```bash
npm test
```

### Tests d'intégration
```bash
npm run test:integration
```

### Tests E2E
```bash
npm run test:e2e
```

## 📋 Checklist avant Pull Request

- [ ] Code testé localement
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Conformité RGPD respectée
- [ ] Pas de données personnelles exposées
- [ ] Code review auto-effectué
- [ ] Messages de commit clairs

## 🐛 Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec le template de bug report
3. Incluez toutes les informations nécessaires
4. **Ne jamais inclure de données personnelles**

## 💡 Proposer une fonctionnalité

1. Créez une issue avec le template de feature request
2. Décrivez clairement la fonctionnalité
3. Expliquez l'impact RGPD
4. Attendez la validation avant de commencer le développement

## 🔍 Code Review

### Critères d'acceptation
- Code fonctionnel et testé
- Respect des conventions
- Conformité RGPD maintenue
- Documentation à jour
- Performance acceptable

### Processus
1. Au moins 2 approbations requises
2. Tous les tests doivent passer
3. Review de sécurité pour les changements sensibles
4. Validation RGPD pour les changements de données

## 📚 Ressources

- [Documentation RGPD](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Discord API Documentation](https://discord.com/developers/docs)

## 🤝 Support

- **Issues GitHub** : Pour les bugs et fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : support@discord-to-obsidian.com

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

---

**Merci de contribuer à Discord to Obsidian ! 🚀**
