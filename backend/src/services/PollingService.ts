import axios from 'axios';
// Type local pour éviter les problèmes d'import
export interface PollingConfig {
  interval: number;
  batchSize: number;
  retryAttempts: number;
}

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  channel_id: string;
  timestamp: string;
}

export class PollingService {
  private config: PollingConfig;
  private isRunning: boolean = false;
  private lastMessageIds: Map<string, string> = new Map();
  private intervalId?: NodeJS.Timeout;
  private monitoredChannels: Set<string> = new Set();

  constructor(config?: Partial<PollingConfig>) {
    this.config = {
      interval: parseInt(process.env.POLLING_INTERVAL || '900000'), // 15 minutes par défaut
      batchSize: parseInt(process.env.BATCH_SIZE || '50'),
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
      ...config,
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    console.log('Service de polling démarré');

    this.intervalId = setInterval(async () => {
      try {
        await this.performPolling();
      } catch (error) {
        console.error('Erreur lors du polling:', error);
      }
    }, this.config.interval);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Service de polling arrêté');
  }

  async performPolling(): Promise<void> {
    console.log('Exécution du polling...');
    
    for (const channelId of this.monitoredChannels) {
      try {
        await this.fetchMessages(channelId);
      } catch (error) {
        console.error(`Erreur lors du polling du canal ${channelId}:`, error);
      }
    }
  }

  async fetchMessages(channelId: string): Promise<Message[]> {
    const accessToken = process.env.DISCORD_BOT_TOKEN;
    if (!accessToken) {
      throw new Error('Token Discord non configuré');
    }

    const lastMessageId = this.lastMessageIds.get(channelId);
    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    
    const params: any = {
      limit: this.config.batchSize,
    };

    if (lastMessageId) {
      params.after = lastMessageId;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bot ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params,
    });

    const messages: Message[] = response.data;
    
    if (messages.length > 0) {
      // Mettre à jour le dernier message ID
      this.lastMessageIds.set(channelId, messages[0].id);
      
      // Traiter les nouveaux messages
      for (const message of messages) {
        await this.processMessage(message);
      }
    }

    return messages;
  }

  private async processMessage(message: Message): Promise<void> {
    try {
      console.log(`Nouveau message via polling: ${message.content}`);
      
      // Ici, on pourrait ajouter la logique pour traiter le message
      // et l'envoyer vers Obsidian
      
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
    }
  }

  async addMonitoredChannel(channelId: string): Promise<void> {
    this.monitoredChannels.add(channelId);
    console.log(`Canal ${channelId} ajouté au polling`);
  }

  async removeMonitoredChannel(channelId: string): Promise<void> {
    this.monitoredChannels.delete(channelId);
    this.lastMessageIds.delete(channelId);
    console.log(`Canal ${channelId} retiré du polling`);
  }

  getMonitoredChannels(): string[] {
    return Array.from(this.monitoredChannels);
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }

  getConfig(): PollingConfig {
    return { ...this.config };
  }
}

