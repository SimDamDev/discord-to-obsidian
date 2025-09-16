import { EventEmitter } from 'events';
import { ConnectionManager } from './ConnectionManager';
import { DiscordBotManager } from './DiscordBotManager';
import { PollingService } from './PollingService';

/**
 * Service principal qui orchestre les deux modes de réception des messages
 * Temps réel (Discord Bot) quand des utilisateurs sont connectés
 * Polling (API Discord) quand personne n'est connecté
 */
export class HybridMessageService extends EventEmitter {
  private connectionManager: ConnectionManager;
  private discordBot: DiscordBotManager;
  private pollingService: PollingService;
  private isInitialized: boolean = false;

  constructor() {
    super();
    
    // Initialiser les services
    this.connectionManager = new ConnectionManager();
    this.discordBot = new DiscordBotManager(this.connectionManager);
    this.pollingService = new PollingService({
      interval: 15 * 60 * 1000, // 15 minutes
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000
    });

    this.setupEventListeners();
  }

  /**
   * Configurer les écouteurs d'événements
   */
  private setupEventListeners(): void {
    // Écouter les changements de mode
    this.connectionManager.on('modeChanged', (mode: 'realtime' | 'polling') => {
      console.log(`[HybridService] Mode changé: ${mode}`);
      this.emit('modeChanged', mode);
    });

    // Écouter les messages du bot Discord
    this.discordBot.on('messageQueued', (messageData) => {
      this.emit('messageReceived', {
        source: 'realtime',
        data: messageData
      });
    });

    // Écouter les messages du polling
    this.pollingService.on('messageProcessed', (messageData) => {
      this.emit('messageReceived', {
        source: 'polling',
        data: messageData
      });
    });

    // Écouter les erreurs
    this.discordBot.on('error', (error) => {
      this.emit('error', { source: 'discordBot', error });
    });

    this.pollingService.on('error', (error) => {
      this.emit('error', { source: 'pollingService', error });
    });
  }

  /**
   * Initialiser le service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[HybridService] Service déjà initialisé');
      return;
    }

    try {
      console.log('[HybridService] Initialisation...');

      // Démarrer le polling par défaut (mode initial)
      this.pollingService.start();

      // Charger les canaux surveillés
      await this.loadMonitoredChannels();

      this.isInitialized = true;
      console.log('[HybridService] Service initialisé avec succès');

    } catch (error) {
      console.error('[HybridService] Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Charger les canaux surveillés depuis la base de données
   */
  private async loadMonitoredChannels(): Promise<void> {
    try {
      // TODO: Récupérer depuis la base de données
      const channels = await this.getMonitoredChannelsFromDB();
      
      // Ajouter les canaux au bot Discord
      for (const channel of channels) {
        this.discordBot.addMonitoredChannel(channel.discordId);
      }

      console.log(`[HybridService] ${channels.length} canaux surveillés chargés`);

    } catch (error) {
      console.error('[HybridService] Erreur chargement canaux:', error);
    }
  }

  /**
   * Récupérer les canaux surveillés depuis la base de données
   */
  private async getMonitoredChannelsFromDB(): Promise<Array<{ id: string; discordId: string }>> {
    // TODO: Implémenter la requête à la base de données
    // SELECT id, discord_id FROM monitored_channels WHERE is_active = true
    
    return [
      { id: '1', discordId: '123456789012345678' },
      { id: '2', discordId: '987654321098765432' }
    ];
  }

  /**
   * Ajouter une connexion WebSocket
   */
  addConnection(connectionId: string, userId: string, socket: any): void {
    this.connectionManager.addConnection(connectionId, userId, socket);
  }

  /**
   * Supprimer une connexion WebSocket
   */
  removeConnection(connectionId: string): void {
    this.connectionManager.removeConnection(connectionId);
  }

  /**
   * Mettre à jour le ping d'une connexion
   */
  updateConnectionPing(connectionId: string): void {
    this.connectionManager.updatePing(connectionId);
  }

  /**
   * Ajouter un canal à la surveillance
   */
  async addMonitoredChannel(channelId: string, discordChannelId: string): Promise<void> {
    try {
      // Ajouter au bot Discord
      this.discordBot.addMonitoredChannel(discordChannelId);

      // TODO: Sauvegarder en base de données
      await this.saveMonitoredChannelToDB(channelId, discordChannelId);

      console.log(`[HybridService] Canal ajouté à la surveillance: ${discordChannelId}`);

    } catch (error) {
      console.error('[HybridService] Erreur ajout canal:', error);
      throw error;
    }
  }

  /**
   * Supprimer un canal de la surveillance
   */
  async removeMonitoredChannel(channelId: string, discordChannelId: string): Promise<void> {
    try {
      // Supprimer du bot Discord
      this.discordBot.removeMonitoredChannel(discordChannelId);

      // TODO: Supprimer de la base de données
      await this.removeMonitoredChannelFromDB(channelId);

      console.log(`[HybridService] Canal supprimé de la surveillance: ${discordChannelId}`);

    } catch (error) {
      console.error('[HybridService] Erreur suppression canal:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder un canal surveillé en base de données
   */
  private async saveMonitoredChannelToDB(channelId: string, discordChannelId: string): Promise<void> {
    // TODO: Implémenter la sauvegarde
    console.log(`[HybridService] Sauvegarde canal ${discordChannelId} en base`);
  }

  /**
   * Supprimer un canal surveillé de la base de données
   */
  private async removeMonitoredChannelFromDB(channelId: string): Promise<void> {
    // TODO: Implémenter la suppression
    console.log(`[HybridService] Suppression canal ${channelId} de la base`);
  }

  /**
   * Forcer le passage en mode temps réel
   */
  async forceRealtimeMode(): Promise<void> {
    console.log('[HybridService] Forçage mode temps réel');
    this.pollingService.stop();
    await this.discordBot.startBot();
  }

  /**
   * Forcer le passage en mode polling
   */
  async forcePollingMode(): Promise<void> {
    console.log('[HybridService] Forçage mode polling');
    await this.discordBot.stopBot();
    this.pollingService.start();
  }

  /**
   * Effectuer un polling manuel
   */
  async performManualPolling(): Promise<void> {
    console.log('[HybridService] Polling manuel demandé');
    // TODO: Implémenter le polling manuel
  }

  /**
   * Obtenir les statistiques complètes
   */
  getStats(): {
    connectionManager: any;
    discordBot: any;
    pollingService: any;
    currentMode: 'realtime' | 'polling';
  } {
    return {
      connectionManager: this.connectionManager.getStats(),
      discordBot: this.discordBot.getStatus(),
      pollingService: this.pollingService.getStats(),
      currentMode: this.connectionManager.getCurrentMode()
    };
  }

  /**
   * Obtenir le statut de santé du service
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      connectionManager: boolean;
      discordBot: boolean;
      pollingService: boolean;
    };
  } {
    const connectionManagerHealthy = this.connectionManager.getActiveConnectionsCount() >= 0;
    const discordBotHealthy = this.discordBot.getStatus().isConnected;
    const pollingServiceHealthy = this.pollingService.getStats().isRunning;

    const healthyServices = [connectionManagerHealthy, discordBotHealthy, pollingServiceHealthy]
      .filter(Boolean).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === 3) {
      status = 'healthy';
    } else if (healthyServices >= 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      details: {
        connectionManager: connectionManagerHealthy,
        discordBot: discordBotHealthy,
        pollingService: pollingServiceHealthy
      }
    };
  }

  /**
   * Nettoyer les ressources
   */
  async destroy(): Promise<void> {
    console.log('[HybridService] Nettoyage des ressources...');

    await Promise.all([
      this.discordBot.destroy(),
      this.pollingService.destroy(),
      this.connectionManager.destroy()
    ]);

    this.removeAllListeners();
    this.isInitialized = false;

    console.log('[HybridService] Ressources nettoyées');
  }
}
