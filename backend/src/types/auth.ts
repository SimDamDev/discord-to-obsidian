export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string; // Nouveau champ remplaçant discriminator
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

export interface ActiveConnection {
  connectionId: string;
  userId: string;
  connectedAt: Date;
  lastActivity: Date;
}

export interface PollingConfig {
  interval: number;
  batchSize: number;
  retryAttempts: number;
}

export interface ServiceStats {
  activeConnections: number;
  currentMode: 'realtime' | 'polling';
  monitoredChannels: number;
  messagesProcessed: number;
  uptime: number;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    discordBot: boolean;
    pollingService: boolean;
    connectionManager: boolean;
  };
  lastCheck: Date;
  errors: string[];
}

export interface ServiceMetrics {
  connectionCount: number;
  modeChanges: number;
  messagesProcessed: number;
  averageResponseTime: number;
  errorRate: number;
}
