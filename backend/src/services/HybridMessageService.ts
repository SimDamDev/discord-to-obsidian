import { ConnectionManager } from './ConnectionManager';
import { DiscordBotManager } from './DiscordBotManager';
import { PollingService } from './PollingService';

// Types locaux pour éviter les problèmes d'import
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

export class HybridMessageService {
  private connectionManager: ConnectionManager;
  private discordBot: DiscordBotManager;
  private pollingService: PollingService;
  private isInitialized: boolean = false;

  constructor() {
    this.connectionManager = new ConnectionManager();
    this.discordBot = new DiscordBotManager();
    this.pollingService = new PollingService();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Démarrer le service de polling par défaut
      await this.pollingService.start();
      
      console.log('Service hybride initialisé');
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service hybride:', error);
      throw error;
    }
  }

  async addConnection(connectionId: string, userId: string): Promise<void> {
    await this.connectionManager.addConnection(connectionId, userId);
    
    // Si on passe en mode temps réel, démarrer le bot Discord
    if (this.connectionManager.getCurrentMode() === 'realtime') {
      await this.discordBot.startBot();
    }
  }

  async removeConnection(connectionId: string): Promise<void> {
    await this.connectionManager.removeConnection(connectionId);
    
    // Si on passe en mode polling, arrêter le bot Discord
    if (this.connectionManager.getCurrentMode() === 'polling') {
      await this.discordBot.stopBot();
    }
  }

  async addMonitoredChannel(channelId: string, userId: string): Promise<void> {
    const currentMode = this.connectionManager.getCurrentMode();
    
    if (currentMode === 'realtime') {
      await this.discordBot.addMonitoredChannel(channelId);
    } else {
      await this.pollingService.addMonitoredChannel(channelId);
    }
  }

  async removeMonitoredChannel(channelId: string, userId: string): Promise<void> {
    const currentMode = this.connectionManager.getCurrentMode();
    
    if (currentMode === 'realtime') {
      await this.discordBot.removeMonitoredChannel(channelId);
    } else {
      await this.pollingService.removeMonitoredChannel(channelId);
    }
  }

  async getStats(): Promise<ServiceStats> {
    const activeConnections = this.connectionManager.getActiveConnectionsCount();
    const currentMode = this.connectionManager.getCurrentMode();
    
    let monitoredChannels = 0;
    if (currentMode === 'realtime') {
      monitoredChannels = this.discordBot.getMonitoredChannels().length;
    } else {
      monitoredChannels = this.pollingService.getMonitoredChannels().length;
    }

    return {
      activeConnections,
      currentMode,
      monitoredChannels,
      messagesProcessed: 0, // À implémenter avec un compteur
      uptime: process.uptime(),
    };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const discordBotStatus = this.discordBot.getConnectionStatus();
    const pollingServiceStatus = this.pollingService.isServiceRunning();
    const connectionManagerStatus = true; // Le ConnectionManager est toujours fonctionnel

    const services = {
      discordBot: discordBotStatus,
      pollingService: pollingServiceStatus,
      connectionManager: connectionManagerStatus,
    };

    const healthyServices = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === totalServices) {
      status = 'healthy';
    } else if (healthyServices > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    const errors: string[] = [];
    if (!discordBotStatus) {
      errors.push('Bot Discord non connecté');
    }
    if (!pollingServiceStatus) {
      errors.push('Service de polling arrêté');
    }

    return {
      status,
      services,
      lastCheck: new Date(),
      errors,
    };
  }

  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  getDiscordBot(): DiscordBotManager {
    return this.discordBot;
  }

  getPollingService(): PollingService {
    return this.pollingService;
  }
}

