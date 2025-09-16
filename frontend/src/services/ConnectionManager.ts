import { WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface ActiveConnection {
  id: string;
  userId: string;
  socket: WebSocket;
  connectedAt: Date;
  lastPing: Date;
}

export class ConnectionManager extends EventEmitter {
  private connections: Map<string, ActiveConnection> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private mode: 'realtime' | 'polling' = 'polling';
  private transitionDelay = 30000; // 30 secondes avant de passer en polling
  private transitionTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startPollingService();
  }

  /**
   * Ajouter une nouvelle connexion WebSocket
   */
  addConnection(connectionId: string, userId: string, socket: WebSocket): void {
    const connection: ActiveConnection = {
      id: connectionId,
      userId,
      socket,
      connectedAt: new Date(),
      lastPing: new Date()
    };

    this.connections.set(connectionId, connection);
    this.updateMode();
    
    console.log(`[ConnectionManager] Nouvelle connexion: ${connectionId} (Total: ${this.connections.size})`);
  }

  /**
   * Supprimer une connexion WebSocket
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      this.connections.delete(connectionId);
      this.updateMode();
      
      console.log(`[ConnectionManager] Connexion fermée: ${connectionId} (Total: ${this.connections.size})`);
    }
  }

  /**
   * Mettre à jour le ping d'une connexion
   */
  updatePing(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastPing = new Date();
    }
  }

  /**
   * Obtenir le nombre de connexions actives
   */
  getActiveConnectionsCount(): number {
    return this.connections.size;
  }

  /**
   * Obtenir le mode actuel
   */
  getCurrentMode(): 'realtime' | 'polling' {
    return this.mode;
  }

  /**
   * Mettre à jour le mode selon les connexions actives
   */
  private updateMode(): void {
    const activeConnections = this.getActiveConnectionsCount();
    const newMode = activeConnections > 0 ? 'realtime' : 'polling';

    if (newMode !== this.mode) {
      console.log(`[ConnectionManager] Basculement: ${this.mode} → ${newMode} (Connexions: ${activeConnections})`);
      
      if (newMode === 'polling') {
        // Délai avant de passer en mode polling pour éviter les basculements fréquents
        this.scheduleModeTransition('polling');
      } else {
        // Passage immédiat en mode temps réel
        this.cancelModeTransition();
        this.switchToRealtime();
      }
    }
  }

  /**
   * Programmer une transition de mode
   */
  private scheduleModeTransition(mode: 'polling'): void {
    this.cancelModeTransition();
    
    this.transitionTimeout = setTimeout(() => {
      this.switchToPolling();
    }, this.transitionDelay);
    
    console.log(`[ConnectionManager] Transition vers ${mode} programmée dans ${this.transitionDelay}ms`);
  }

  /**
   * Annuler une transition programmée
   */
  private cancelModeTransition(): void {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }
  }

  /**
   * Basculer en mode temps réel
   */
  private switchToRealtime(): void {
    this.mode = 'realtime';
    this.stopPollingService();
    this.emit('modeChanged', 'realtime');
    
    console.log('[ConnectionManager] Mode temps réel activé - Bot Discord démarré');
  }

  /**
   * Basculer en mode polling
   */
  private switchToPolling(): void {
    this.mode = 'polling';
    this.startPollingService();
    this.emit('modeChanged', 'polling');
    
    console.log('[ConnectionManager] Mode polling activé - Scraping toutes les 15min');
  }

  /**
   * Démarrer le service de polling
   */
  private startPollingService(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      if (this.mode === 'polling') {
        await this.performPolling();
      }
    }, 15 * 60 * 1000); // 15 minutes

    console.log('[ConnectionManager] Service de polling démarré (intervalle: 15min)');
  }

  /**
   * Arrêter le service de polling
   */
  private stopPollingService(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('[ConnectionManager] Service de polling arrêté');
    }
  }

  /**
   * Effectuer le polling des messages Discord
   */
  private async performPolling(): Promise<void> {
    try {
      console.log('[ConnectionManager] Début du polling des messages Discord...');
      
      // Récupérer les canaux surveillés
      const monitoredChannels = await this.getMonitoredChannels();
      
      for (const channel of monitoredChannels) {
        await this.pollChannelMessages(channel);
      }
      
      console.log('[ConnectionManager] Polling terminé');
    } catch (error) {
      console.error('[ConnectionManager] Erreur lors du polling:', error);
    }
  }

  /**
   * Récupérer les canaux surveillés
   */
  private async getMonitoredChannels(): Promise<any[]> {
    // TODO: Implémenter la récupération depuis la base de données
    return [];
  }

  /**
   * Poller les messages d'un canal spécifique
   */
  private async pollChannelMessages(channel: any): Promise<void> {
    try {
      // Récupérer le dernier message traité
      const lastMessage = await this.getLastProcessedMessage(channel.id);
      
      // Récupérer les nouveaux messages depuis l'API Discord
      const newMessages = await this.fetchNewMessages(channel.discordId, lastMessage?.discordId);
      
      // Traiter chaque nouveau message
      for (const message of newMessages) {
        await this.processMessage(message, channel);
      }
      
    } catch (error) {
      console.error(`[ConnectionManager] Erreur polling canal ${channel.id}:`, error);
    }
  }

  /**
   * Récupérer le dernier message traité pour un canal
   */
  private async getLastProcessedMessage(channelId: string): Promise<any> {
    // TODO: Implémenter la récupération depuis la base de données
    return null;
  }

  /**
   * Récupérer les nouveaux messages depuis l'API Discord
   */
  private async fetchNewMessages(channelDiscordId: string, lastMessageId?: string): Promise<any[]> {
    // TODO: Implémenter l'appel à l'API Discord
    return [];
  }

  /**
   * Traiter un message (extraction de liens, génération de note)
   */
  private async processMessage(message: any, channel: any): Promise<void> {
    // TODO: Implémenter le traitement du message
    console.log(`[ConnectionManager] Traitement message: ${message.id}`);
  }

  /**
   * Nettoyer les connexions inactives
   */
  cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [connectionId, connection] of this.connections) {
      const timeSinceLastPing = now.getTime() - connection.lastPing.getTime();
      
      if (timeSinceLastPing > inactiveThreshold) {
        console.log(`[ConnectionManager] Nettoyage connexion inactive: ${connectionId}`);
        this.removeConnection(connectionId);
      }
    }
  }

  /**
   * Obtenir les statistiques des connexions
   */
  getStats(): {
    activeConnections: number;
    currentMode: 'realtime' | 'polling';
    uptime: number;
  } {
    return {
      activeConnections: this.connections.size,
      currentMode: this.mode,
      uptime: process.uptime()
    };
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    this.cancelModeTransition();
    this.stopPollingService();
    this.connections.clear();
    this.removeAllListeners();
  }
}
