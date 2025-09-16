import { EventEmitter } from 'events';
import axios from 'axios';

interface DiscordMessage {
  id: string;
  channel_id: string;
  author: {
    id: string;
    username: string;
  };
  content: string;
  timestamp: string;
  attachments: any[];
}

interface PollingConfig {
  interval: number; // en millisecondes
  batchSize: number; // nombre de messages par requête
  retryAttempts: number;
  retryDelay: number;
}

export class PollingService extends EventEmitter {
  private config: PollingConfig;
  private isRunning: boolean = false;
  private lastMessageIds: Map<string, string> = new Map(); // canalId -> dernier messageId
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<PollingConfig>) {
    super();
    this.config = {
      interval: 15 * 60 * 1000, // 15 minutes par défaut
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000,
      ...config
    };
  }

  /**
   * Démarrer le service de polling
   */
  start(): void {
    if (this.isRunning) {
      console.log('[PollingService] Service déjà en cours d\'exécution');
      return;
    }

    this.isRunning = true;
    this.pollingInterval = setInterval(async () => {
      await this.performPolling();
    }, this.config.interval);

    console.log(`[PollingService] Service démarré (intervalle: ${this.config.interval / 1000}s)`);
    this.emit('started');
  }

  /**
   * Arrêter le service de polling
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('[PollingService] Service déjà arrêté');
      return;
    }

    this.isRunning = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    console.log('[PollingService] Service arrêté');
    this.emit('stopped');
  }

  /**
   * Effectuer le polling des messages
   */
  private async performPolling(): Promise<void> {
    try {
      console.log('[PollingService] Début du polling...');
      
      // Récupérer les canaux surveillés
      const monitoredChannels = await this.getMonitoredChannels();
      
      if (monitoredChannels.length === 0) {
        console.log('[PollingService] Aucun canal surveillé');
        return;
      }

      // Poller chaque canal
      const pollingPromises = monitoredChannels.map(channel => 
        this.pollChannel(channel.id, channel.discordId)
      );

      await Promise.allSettled(pollingPromises);
      
      console.log('[PollingService] Polling terminé');
      this.emit('pollingCompleted');

    } catch (error) {
      console.error('[PollingService] Erreur lors du polling:', error);
      this.emit('error', error);
    }
  }

  /**
   * Poller un canal spécifique
   */
  private async pollChannel(channelId: string, discordChannelId: string): Promise<void> {
    try {
      const lastMessageId = this.lastMessageIds.get(channelId);
      const newMessages = await this.fetchMessages(discordChannelId, lastMessageId);

      if (newMessages.length === 0) {
        console.log(`[PollingService] Aucun nouveau message dans le canal ${channelId}`);
        return;
      }

      console.log(`[PollingService] ${newMessages.length} nouveaux messages dans le canal ${channelId}`);

      // Traiter chaque nouveau message
      for (const message of newMessages) {
        if (this.containsLinks(message.content)) {
          await this.processMessage(message, channelId);
        }
      }

      // Mettre à jour le dernier message ID
      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        this.lastMessageIds.set(channelId, latestMessage.id);
      }

    } catch (error) {
      console.error(`[PollingService] Erreur polling canal ${channelId}:`, error);
    }
  }

  /**
   * Récupérer les messages depuis l'API Discord
   */
  private async fetchMessages(channelId: string, after?: string): Promise<DiscordMessage[]> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN non configuré');
    }

    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    const params: any = {
      limit: this.config.batchSize
    };

    if (after) {
      params.after = after;
    }

    const response = await this.retryRequest(async () => {
      return axios.get(url, {
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json'
        },
        params
      });
    });

    return response.data;
  }

  /**
   * Effectuer une requête avec retry
   */
  private async retryRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.retryAttempts) {
          console.log(`[PollingService] Tentative ${attempt} échouée, retry dans ${this.config.retryDelay}ms`);
          await this.delay(this.config.retryDelay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Vérifier si le message contient des liens
   */
  private containsLinks(content: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(content);
  }

  /**
   * Traiter un message (extraction de liens, génération de note)
   */
  private async processMessage(message: DiscordMessage, channelId: string): Promise<void> {
    try {
      console.log(`[PollingService] Traitement message: ${message.id}`);

      const messageData = {
        discordId: message.id,
        channelId: channelId,
        authorId: message.author.id,
        authorName: message.author.username,
        content: message.content,
        timestamp: new Date(message.timestamp),
        attachments: message.attachments
      };

      // TODO: Envoyer à la queue de traitement
      // await this.queueMessageForProcessing(messageData);
      
      this.emit('messageProcessed', messageData);

    } catch (error) {
      console.error(`[PollingService] Erreur traitement message ${message.id}:`, error);
    }
  }

  /**
   * Récupérer les canaux surveillés depuis la base de données
   */
  private async getMonitoredChannels(): Promise<Array<{ id: string; discordId: string }>> {
    // TODO: Implémenter la récupération depuis la base de données
    // SELECT id, discord_id FROM monitored_channels WHERE is_active = true
    
    return [
      { id: '1', discordId: '123456789012345678' },
      { id: '2', discordId: '987654321098765432' }
    ];
  }

  /**
   * Définir le dernier message ID pour un canal
   */
  setLastMessageId(channelId: string, messageId: string): void {
    this.lastMessageIds.set(channelId, messageId);
  }

  /**
   * Obtenir le dernier message ID pour un canal
   */
  getLastMessageId(channelId: string): string | undefined {
    return this.lastMessageIds.get(channelId);
  }

  /**
   * Obtenir les statistiques du service
   */
  getStats(): {
    isRunning: boolean;
    interval: number;
    monitoredChannels: number;
    lastMessageIds: Record<string, string>;
  } {
    return {
      isRunning: this.isRunning,
      interval: this.config.interval,
      monitoredChannels: this.lastMessageIds.size,
      lastMessageIds: Object.fromEntries(this.lastMessageIds)
    };
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(newConfig: Partial<PollingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Délai utilitaire
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Nettoyer les ressources
   */
  destroy(): void {
    this.stop();
    this.lastMessageIds.clear();
    this.removeAllListeners();
  }
}
