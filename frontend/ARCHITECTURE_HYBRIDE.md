# 🔄 Architecture Hybride Discord-to-Obsidian

## 📋 Vue d'Ensemble

L'architecture hybride combine intelligemment deux modes de réception des messages Discord :

- **Mode Temps Réel** : Bot Discord + WebSocket (quand des utilisateurs sont connectés)
- **Mode Polling** : API Discord + Scraping périodique (quand personne n'est connecté)

## 🎯 Objectifs de l'Architecture Hybride

### Avantages
✅ **Économie de ressources** : Pas de bot actif quand inutile  
✅ **Expérience temps réel** : Messages instantanés quand nécessaire  
✅ **Fiabilité** : Fallback automatique entre les modes  
✅ **Scalabilité** : Adaptation automatique à la charge  
✅ **Monitoring** : Visibilité complète sur les deux modes  

### Logique de Basculement
```
Utilisateurs Connectés ≥ 1  →  Mode Temps Réel (Bot Discord)
Utilisateurs Connectés = 0  →  Mode Polling (API toutes les 15min)
```

## 🏗️ Architecture Détaillée

### **1. ConnectionManager**
```typescript
// Gestionnaire des connexions WebSocket
class ConnectionManager {
  - connections: Map<string, ActiveConnection>
  - mode: 'realtime' | 'polling'
  - transitionDelay: 30000ms
  
  + addConnection()     // Nouvelle connexion WebSocket
  + removeConnection()  // Suppression connexion
  + updateMode()        // Basculement automatique
  + cleanupInactive()   // Nettoyage connexions inactives
}
```

**Responsabilités** :
- Tracker les connexions WebSocket actives
- Détecter les changements de mode
- Gérer la transition avec délai (éviter basculements fréquents)
- Nettoyer les connexions inactives

### **2. DiscordBotManager**
```typescript
// Gestionnaire du bot Discord
class DiscordBotManager {
  - client: Client
  - isConnected: boolean
  - monitoredChannels: Set<string>
  
  + startBot()           // Démarrer le bot
  + stopBot()            // Arrêter le bot
  + handleMessage()      // Traiter les messages
  + addMonitoredChannel() // Ajouter canal
}
```

**Responsabilités** :
- Connexion au Gateway Discord
- Écoute des événements `MESSAGE_CREATE`
- Filtrage par canaux surveillés
- Détection des liens dans les messages
- Mise en queue pour traitement

### **3. PollingService**
```typescript
// Service de polling API Discord
class PollingService {
  - config: PollingConfig
  - isRunning: boolean
  - lastMessageIds: Map<string, string>
  
  + start()              // Démarrer le polling
  + stop()               // Arrêter le polling
  + performPolling()     // Effectuer le polling
  + fetchMessages()      // Récupérer messages API
}
```

**Responsabilités** :
- Polling périodique (15 minutes par défaut)
- Récupération des nouveaux messages via API REST
- Gestion des retry et erreurs
- Tracking des derniers messages par canal
- Traitement des messages avec liens

### **4. HybridMessageService**
```typescript
// Orchestrateur principal
class HybridMessageService {
  - connectionManager: ConnectionManager
  - discordBot: DiscordBotManager
  - pollingService: PollingService
  
  + initialize()         // Initialisation
  + addConnection()      // Gestion connexions
  + addMonitoredChannel() // Gestion canaux
  + getStats()           // Statistiques
  + getHealthStatus()    // Santé du service
}
```

**Responsabilités** :
- Orchestration des trois services
- Gestion des événements inter-services
- API unifiée pour l'application
- Monitoring et santé du système

## 🔄 Flux de Données

### **Mode Temps Réel**
```
Discord Gateway ──► DiscordBotManager ──► Message Queue ──► Processing
                                    │
                                    ▼
                              WebSocket ──► Frontend (Real-time)
```

### **Mode Polling**
```
API Discord ──► PollingService ──► Message Queue ──► Processing
                                    │
                                    ▼
                              Database ──► Frontend (On-demand)
```

### **Transition de Mode**
```
Connexion WebSocket ──► ConnectionManager ──► Mode Switch
    │                                           │
    ▼                                           ▼
Frontend Connecté                        Bot Discord Start
    │                                           │
    ▼                                           ▼
Mode: Temps Réel ◄─────────────────────────────┘

Déconnexion WebSocket ──► ConnectionManager ──► Mode Switch
    │                                           │
    ▼                                           ▼
Frontend Déconnecté                      Polling Service Start
    │                                           │
    ▼                                           ▼
Mode: Polling ◄─────────────────────────────────┘
```

## ⚙️ Configuration

### **Variables d'Environnement**
```bash
# Discord
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# Base de données
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Configuration
POLLING_INTERVAL=900000  # 15 minutes
TRANSITION_DELAY=30000   # 30 secondes
BATCH_SIZE=50           # Messages par requête
RETRY_ATTEMPTS=3        # Tentatives de retry
```

### **Configuration Polling**
```typescript
interface PollingConfig {
  interval: number;        // 15 * 60 * 1000 (15 minutes)
  batchSize: number;       // 50 messages par requête
  retryAttempts: number;   // 3 tentatives
  retryDelay: number;      // 5000ms entre tentatives
}
```

## 📊 Monitoring et Métriques

### **Statistiques Disponibles**
```typescript
interface ServiceStats {
  connectionManager: {
    activeConnections: number;
    currentMode: 'realtime' | 'polling';
    uptime: number;
  };
  discordBot: {
    isConnected: boolean;
    monitoredChannels: string[];
    uptime: number;
  };
  pollingService: {
    isRunning: boolean;
    interval: number;
    monitoredChannels: number;
    lastMessageIds: Record<string, string>;
  };
}
```

### **Santé du Service**
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: {
    connectionManager: boolean;
    discordBot: boolean;
    pollingService: boolean;
  };
}
```

### **Métriques Prometheus**
```typescript
// Métriques personnalisées
discord_messages_received_total{source="realtime|polling"}
discord_messages_processed_total{status="success|error"}
discord_mode_changes_total{from="realtime|polling", to="realtime|polling"}
discord_active_connections_gauge
discord_polling_interval_seconds
```

## 🚀 API Endpoints

### **Gestion des Connexions**
```typescript
GET    /api/connections/stats        // Statistiques connexions
GET    /api/connections/health       // Santé du service
POST   /api/connections/force-realtime // Forcer mode temps réel
POST   /api/connections/force-polling  // Forcer mode polling
```

### **Gestion des Canaux**
```typescript
GET    /api/channels/monitored       // Canaux surveillés
POST   /api/channels/monitor         // Ajouter canal
DELETE /api/channels/:id/monitor     // Supprimer canal
```

### **Polling Manuel**
```typescript
POST   /api/polling/manual           // Polling manuel
GET    /api/polling/stats            // Statistiques polling
PUT    /api/polling/config           // Modifier configuration
```

## 🔧 Scripts de Développement

### **Commandes Utiles**
```bash
# Démarrer en mode développement
npm run dev:hybrid

# Tests spécifiques
npm run test:connection-manager
npm run test:discord-bot
npm run test:polling-service
npm run test:hybrid-service

# Monitoring
npm run monitor:connections
npm run monitor:discord-bot
npm run monitor:polling

# Debug
npm run debug:mode-switching
npm run debug:message-flow
```

### **Tests d'Intégration**
```typescript
// Tests de basculement de mode
describe('Mode Switching', () => {
  it('should switch to realtime when user connects');
  it('should switch to polling when user disconnects');
  it('should handle transition delay correctly');
  it('should not switch modes too frequently');
});

// Tests de traitement des messages
describe('Message Processing', () => {
  it('should process messages from Discord Bot');
  it('should process messages from Polling Service');
  it('should handle duplicate messages correctly');
  it('should extract links from messages');
});
```

## 🎯 Optimisations

### **Performance**
- **Cache Redis** : Messages récents en cache
- **Batch Processing** : Traitement par lots
- **Connection Pooling** : Pool de connexions DB
- **Lazy Loading** : Chargement à la demande

### **Fiabilité**
- **Retry Logic** : Retry automatique avec backoff
- **Circuit Breaker** : Protection contre les pannes
- **Health Checks** : Vérifications de santé
- **Graceful Degradation** : Dégradation gracieuse

### **Monitoring**
- **Logs Structurés** : Winston avec contexte
- **Métriques Temps Réel** : Prometheus + Grafana
- **Alertes** : Notifications automatiques
- **Dashboards** : Visualisation des métriques

## 🔒 Sécurité

### **Authentification**
- **OAuth2 Discord** : Authentification sécurisée
- **JWT Tokens** : Tokens avec expiration
- **Rate Limiting** : Limitation des requêtes
- **CORS** : Configuration sécurisée

### **Données**
- **Chiffrement** : Tokens sensibles chiffrés
- **Validation** : Validation stricte des inputs
- **Sanitization** : Nettoyage des données
- **Audit Logs** : Logs d'audit complets

---

**Date de création** : $(date)  
**Version** : 1.0.0  
**Auteur** : Assistant IA Claude  
**Statut** : Architecture hybride implémentée ✅
