import { Client, GatewayIntentBits, Events, Message } from 'discord.js';
import { EventEmitter } from 'events';
import { ConnectionManager } from './ConnectionManager';

export class DiscordBotManager extends EventEmitter {
  private client: Client;
  private connectionManager: ConnectionManager;
  private isConnected: boolean = false;
  private monitoredChannels: Set<string> = new Set();

  constructor(connectionManager: ConnectionManager) {
    super();
    this.connectionManager = connectionManager;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.setupEventListeners();
    this.setupConnectionManagerListeners();
  }

  /**
   * Configurer les écouteurs d'événements Discord
   */
  private setupEventListeners(): void {
    this.client.once(Events.ClientReady, () => {
      console.log(`[DiscordBot] Bot connecté: ${this.client.user?.tag}`);
      this.isConnected = true;
      this.emit('ready');
    });

    this.client.on(Events.MessageCreate, async (message: Message) => {
      await this.handleMessage(message);
    });

    this.client.on(Events.Error, (error) => {
      console.error('[DiscordBot] Erreur:', error);
      this.emit('error', error);
    });

    this.client.on(Events.ClientReady, () => {
      console.log('[DiscordBot] Bot connecté');
      this.isConnected = true;
      this.emit('connect');
    });
  }

  /**
   * Configurer les écouteurs du ConnectionManager
   */
  private setupConnectionManagerListeners(): void {
    this.connectionManager.on('modeChanged', (mode: 'realtime' | 'polling') => {
      if (mode === 'realtime') {
        this.startBot();
      } else {
        this.stopBot();
      }
    });
  }

  /**
   * Démarrer le bot Discord
   */
  async startBot(): Promise<void> {
    if (this.isConnected) {
      console.log('[DiscordBot] Bot déjà connecté');
      return;
    }

    try {
      const token = process.env.DISCORD_BOT_TOKEN;
      if (!token) {
        throw new Error('DISCORD_BOT_TOKEN non configuré');
      }

      await this.client.login(token);
      console.log('[DiscordBot] Tentative de connexion...');
    } catch (error) {
      console.error('[DiscordBot] Erreur de connexion:', error);
      this.emit('error', error);
    }
  }

  /**
   * Arrêter le bot Discord
   */
  async stopBot(): Promise<void> {
    if (!this.isConnected) {
      console.log('[DiscordBot] Bot déjà déconnecté');
      return;
    }

    try {
      await this.client.destroy();
      this.isConnected = false;
      console.log('[DiscordBot] Bot arrêté');
      this.emit('disconnect');
    } catch (error) {
      console.error('[DiscordBot] Erreur lors de l\'arrêt:', error);
    }
  }

  /**
   * Gérer un nouveau message Discord
   */
  private async handleMessage(message: Message): Promise<void> {
    try {
      // Vérifier si le canal est surveillé
      if (!this.isChannelMonitored(message.channelId)) {
        return;
      }

      // Vérifier si le message contient des liens
      if (!this.containsLinks(message.content)) {
        return;
      }

      console.log(`[DiscordBot] Nouveau message avec liens: ${message.id} dans ${message.channelId}`);

      // Envoyer le message à la queue de traitement
      await this.queueMessageForProcessing(message);

    } catch (error) {
      console.error('[DiscordBot] Erreur traitement message:', error);
    }
  }

  /**
   * Vérifier si un canal est surveillé
   */
  private isChannelMonitored(channelId: string): boolean {
    return this.monitoredChannels.has(channelId);
  }

  /**
   * Vérifier si le message contient des liens
   */
  private containsLinks(content: string): boolean {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(content);
  }

  /**
   * Mettre en queue le message pour traitement
   */
  private async queueMessageForProcessing(message: Message): Promise<void> {
    const messageData = {
      discordId: message.id,
      channelId: message.channelId,
      channelName: (message.channel as any).name || 'Unknown',
      authorId: message.author.id,
      authorName: message.author.username,
      content: message.content,
      timestamp: message.createdAt,
      attachments: message.attachments.map(att => ({
        id: att.id,
        url: att.url,
        filename: att.name,
        size: att.size
      }))
    };

    // TODO: Envoyer à la queue Redis
    console.log('[DiscordBot] Message mis en queue:', messageData);
    
    this.emit('messageQueued', messageData);
  }

  /**
   * Ajouter un canal à la surveillance
   */
  addMonitoredChannel(channelId: string): void {
    this.monitoredChannels.add(channelId);
    console.log(`[DiscordBot] Canal ajouté à la surveillance: ${channelId}`);
  }

  /**
   * Supprimer un canal de la surveillance
   */
  removeMonitoredChannel(channelId: string): void {
    this.monitoredChannels.delete(channelId);
    console.log(`[DiscordBot] Canal supprimé de la surveillance: ${channelId}`);
  }

  /**
   * Obtenir la liste des canaux surveillés
   */
  getMonitoredChannels(): string[] {
    return Array.from(this.monitoredChannels);
  }

  /**
   * Obtenir le statut du bot
   */
  getStatus(): {
    isConnected: boolean;
    monitoredChannels: string[];
    uptime: number;
  } {
    return {
      isConnected: this.isConnected,
      monitoredChannels: this.getMonitoredChannels(),
      uptime: this.isConnected ? process.uptime() : 0
    };
  }

  /**
   * Nettoyer les ressources
   */
  async destroy(): Promise<void> {
    await this.stopBot();
    this.removeAllListeners();
  }
}
