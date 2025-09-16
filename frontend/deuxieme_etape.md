# 🔐 Deuxième Étape - Authentification Discord & Services de Base

## 📋 Objectif
Implémenter l'authentification Discord OAuth2, les services de base de l'architecture hybride, et les premières fonctionnalités de surveillance des canaux Discord.

## 🎯 Livrables Attendus
- Authentification Discord OAuth2 fonctionnelle
- Services de base de l'architecture hybride implémentés
- API endpoints pour la gestion des serveurs et canaux Discord
- Interface utilisateur pour la configuration initiale
- Tests unitaires et d'intégration pour les services

## 🏗️ Architecture des Services

### 1. Services de Base à Implémenter

#### **ConnectionManager**
```typescript
// src/services/ConnectionManager.ts
export class ConnectionManager {
  private connections: Map<string, ActiveConnection> = new Map();
  private mode: 'realtime' | 'polling' = 'polling';
  private transitionDelay: number = 30000; // 30 secondes
  
  async addConnection(connectionId: string, userId: string): Promise<void>;
  async removeConnection(connectionId: string): Promise<void>;
  async updateMode(): Promise<void>;
  async cleanupInactive(): Promise<void>;
  getActiveConnectionsCount(): number;
  getCurrentMode(): 'realtime' | 'polling';
}
```

#### **DiscordBotManager**
```typescript
// src/services/DiscordBotManager.ts
export class DiscordBotManager {
  private client: Client;
  private isConnected: boolean = false;
  private monitoredChannels: Set<string> = new Set();
  
  async startBot(): Promise<void>;
  async stopBot(): Promise<void>;
  async handleMessage(message: Message): Promise<void>;
  async addMonitoredChannel(channelId: string): Promise<void>;
  async removeMonitoredChannel(channelId: string): Promise<void>;
  getConnectionStatus(): boolean;
  getMonitoredChannels(): string[];
}
```

#### **PollingService**
```typescript
// src/services/PollingService.ts
export class PollingService {
  private config: PollingConfig;
  private isRunning: boolean = false;
  private lastMessageIds: Map<string, string> = new Map();
  private intervalId?: NodeJS.Timeout;
  
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async performPolling(): Promise<void>;
  async fetchMessages(channelId: string): Promise<Message[]>;
  async addMonitoredChannel(channelId: string): Promise<void>;
  async removeMonitoredChannel(channelId: string): Promise<void>;
}
```

#### **HybridMessageService**
```typescript
// src/services/HybridMessageService.ts
export class HybridMessageService {
  private connectionManager: ConnectionManager;
  private discordBot: DiscordBotManager;
  private pollingService: PollingService;
  
  async initialize(): Promise<void>;
  async addConnection(connectionId: string, userId: string): Promise<void>;
  async removeConnection(connectionId: string): Promise<void>;
  async addMonitoredChannel(channelId: string, userId: string): Promise<void>;
  async removeMonitoredChannel(channelId: string, userId: string): Promise<void>;
  async getStats(): Promise<ServiceStats>;
  async getHealthStatus(): Promise<HealthStatus>;
}
```

## 🔐 Authentification Discord

### Configuration NextAuth.js
```typescript
// frontend/src/lib/auth.ts
import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = profile.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId = token.discordId;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

export default NextAuth(authOptions);
```

### Modèles de Données
```typescript
// frontend/src/types/auth.ts
export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
  verified?: boolean;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

export interface SessionUser {
  id: string;
  discordId: string;
  username: string;
  avatarUrl?: string;
  email?: string;
}
```

## 🛣️ API Routes Backend

### Authentification
```typescript
// backend/src/routes/auth.ts
router.post('/discord/login', async (req, res) => {
  // Initier le processus OAuth2 Discord
});

router.post('/discord/callback', async (req, res) => {
  // Traiter le callback OAuth2
});

router.get('/me', authenticateToken, async (req, res) => {
  // Récupérer le profil utilisateur
});
```

### Discord Integration
```typescript
// backend/src/routes/discord.ts
router.get('/servers', authenticateToken, async (req, res) => {
  // Récupérer les serveurs Discord de l'utilisateur
});

router.get('/servers/:id/channels', authenticateToken, async (req, res) => {
  // Récupérer les canaux d'un serveur
});

router.post('/channels/monitor', authenticateToken, async (req, res) => {
  // Ajouter un canal à la surveillance
});

router.delete('/channels/:id/monitor', authenticateToken, async (req, res) => {
  // Supprimer un canal de la surveillance
});
```

### Gestion des Connexions
```typescript
// backend/src/routes/connections.ts
router.get('/stats', authenticateToken, async (req, res) => {
  // Statistiques des connexions
});

router.get('/health', authenticateToken, async (req, res) => {
  // Santé du service hybride
});

router.post('/force-realtime', authenticateToken, async (req, res) => {
  // Forcer le mode temps réel
});

router.post('/force-polling', authenticateToken, async (req, res) => {
  // Forcer le mode polling
});
```

## 🎨 Interface Utilisateur

### Pages Principales
```typescript
// frontend/src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ServerList />
        <ChannelMonitor />
      </div>
      <div className="lg:col-span-1">
        <ConnectionStats />
        <ServiceHealth />
      </div>
    </div>
  );
}
```

### Composants UI
```typescript
// frontend/src/components/dashboard/ServerList.tsx
export function ServerList() {
  const { data: servers, isLoading } = useDiscordServers();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Serveurs Discord</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ServerListSkeleton />
        ) : (
          <div className="grid gap-4">
            {servers?.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Composants de Surveillance
```typescript
// frontend/src/components/dashboard/ChannelMonitor.tsx
export function ChannelMonitor() {
  const { data: channels, isLoading } = useMonitoredChannels();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canaux Surveillés</CardTitle>
        <CardDescription>
          Canaux actuellement surveillés pour les nouveaux messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChannelListSkeleton />
        ) : (
          <div className="space-y-4">
            {channels?.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## 🧪 Tests

### Tests Unitaires
```typescript
// backend/src/services/__tests__/ConnectionManager.test.ts
describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;
  
  beforeEach(() => {
    connectionManager = new ConnectionManager();
  });
  
  describe('addConnection', () => {
    it('should add a new connection and switch to realtime mode', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      expect(connectionManager.getActiveConnectionsCount()).toBe(1);
      expect(connectionManager.getCurrentMode()).toBe('realtime');
    });
  });
  
  describe('removeConnection', () => {
    it('should remove connection and switch to polling mode', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      await connectionManager.removeConnection('conn1');
      expect(connectionManager.getActiveConnectionsCount()).toBe(0);
      expect(connectionManager.getCurrentMode()).toBe('polling');
    });
  });
});
```

### Tests d'Intégration
```typescript
// backend/src/__tests__/integration/auth.test.ts
describe('Authentication Integration', () => {
  it('should complete Discord OAuth2 flow', async () => {
    const response = await request(app)
      .post('/api/auth/discord/login')
      .expect(302);
    
    expect(response.headers.location).toContain('discord.com/oauth2/authorize');
  });
  
  it('should handle Discord callback and create user', async () => {
    const mockDiscordUser = {
      id: '123456789',
      username: 'testuser',
      avatar: 'avatar_hash',
    };
    
    const response = await request(app)
      .post('/api/auth/discord/callback')
      .send({ code: 'mock_auth_code' })
      .expect(200);
    
    expect(response.body.user.discordId).toBe(mockDiscordUser.id);
  });
});
```

## 🔧 Configuration

### Variables d'Environnement
```bash
# .env.example (ajouts pour la deuxième étape)
# Discord OAuth2
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"
DISCORD_BOT_TOKEN="your_discord_bot_token"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Configuration Services
POLLING_INTERVAL=900000  # 15 minutes
TRANSITION_DELAY=30000   # 30 secondes
BATCH_SIZE=50           # Messages par requête
RETRY_ATTEMPTS=3        # Tentatives de retry
```

### Configuration Discord Bot
```typescript
// backend/src/config/discord.ts
export const discordConfig = {
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
  ],
};
```

## 📊 Monitoring et Logs

### Configuration Winston
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'discord-to-obsidian' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Métriques de Base
```typescript
// backend/src/utils/metrics.ts
export class MetricsCollector {
  private static instance: MetricsCollector;
  
  private connectionCount: number = 0;
  private modeChanges: number = 0;
  private messagesProcessed: number = 0;
  
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  incrementConnectionCount(): void;
  decrementConnectionCount(): void;
  incrementModeChanges(): void;
  incrementMessagesProcessed(): void;
  getMetrics(): ServiceMetrics;
}
```

## 🚀 Scripts de Développement

### Commandes NPM
```json
{
  "scripts": {
    "dev:auth": "cd frontend && npm run dev",
    "dev:services": "cd backend && npm run dev",
    "test:services": "jest src/services",
    "test:integration": "jest src/__tests__/integration",
    "test:auth": "jest src/__tests__/auth",
    "db:seed:users": "cd backend && npx prisma db seed",
    "discord:setup": "node scripts/setup-discord-bot.js",
    "monitor:connections": "node scripts/monitor-connections.js"
  }
}
```

### Scripts Utilitaires
```typescript
// scripts/setup-discord-bot.js
// Script pour configurer le bot Discord avec les permissions nécessaires

// scripts/monitor-connections.js
// Script pour monitorer les connexions en temps réel
```

## ✅ Critères de Validation

### Fonctionnels
- [x] Authentification Discord OAuth2 fonctionnelle
- [x] Récupération des serveurs Discord de l'utilisateur
- [ ] Affichage des canaux par serveur
- [ ] Ajout/suppression de canaux surveillés
- [ ] Basculement automatique entre modes temps réel/polling
- [ ] Interface utilisateur responsive et intuitive

### Techniques
- [x] Services de base implémentés selon l'architecture hybride
- [x] Tests unitaires avec couverture > 80%
- [x] Tests d'intégration pour l'authentification
- [x] Logs structurés avec Winston
- [x] Métriques de base collectées
- [x] Gestion d'erreurs robuste

### Sécurité
- [ ] Tokens Discord sécurisés et chiffrés
- [ ] Validation stricte des inputs
- [ ] Rate limiting sur les endpoints
- [ ] CORS configuré correctement
- [ ] Headers de sécurité implémentés

## 🎯 Prochaine Étape

Une fois cette deuxième étape terminée, nous passerons à l'implémentation de l'extraction de contenu des liens et de la génération des notes Obsidian (Troisième étape).

## 📚 Ressources

### Documentation Discord
- [Discord OAuabout:blank#blockedth2 Guide](https://discord.com/developers/docs/topics/oauth2)
- [Discord.js Documentation](https://discord.js.org/#/docs)
- [Discord API Reference](https://discord.com/developers/docs/reference)

### Documentation NextAuth
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Discord Provider](https://next-auth.js.org/providers/discord)

### Architecture Hybride
- Voir `ARCHITECTURE_HYBRIDE.md` pour les détails complets
- Voir `AVANT_PROJET.md` pour la vision globale du projet

---

**Date de création** : $(date)  
**Version** : 1.0.0  
**Auteur** : Assistant IA Claude  
**Statut** : Deuxième étape définie ✅
