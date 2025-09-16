import { Client, GatewayIntentBits, Partials, Message, Events } from 'discord.js';

export class DiscordBotManager {
  private client: Client;
  private isConnected: boolean = false;
  private monitoredChannels: Set<string> = new Set();

  constructor() {
    this.client = new Client({
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
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.once(Events.ClientReady, () => {
      console.log(`Bot Discord connecté: ${this.client.user?.displayName || this.client.user?.username}`);
      this.isConnected = true;
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (this.monitoredChannels.has(message.channel.id)) {
        await this.handleMessage(message);
      }
    });

    this.client.on(Events.Error, (error) => {
      console.error('Erreur Discord Bot:', error);
      this.isConnected = false;
    });

    this.client.on(Events.ShardDisconnect, () => {
      console.log('Bot Discord déconnecté');
      this.isConnected = false;
    });
  }

  async startBot(): Promise<void> {
    if (!this.isConnected) {
      const token = process.env.DISCORD_BOT_TOKEN;
      if (!token) {
        throw new Error('DISCORD_BOT_TOKEN non configuré');
      }
      
      await this.client.login(token);
    }
  }

  async stopBot(): Promise<void> {
    if (this.isConnected) {
      await this.client.destroy();
      this.isConnected = false;
    }
  }

  async handleMessage(message: Message): Promise<void> {
    try {
      // Logique de traitement des messages
      const channelName = 'name' in message.channel ? message.channel.name : 'DM';
      console.log(`Nouveau message dans ${channelName}: ${message.content}`);
      
      // Ici, on pourrait ajouter la logique pour traiter le message
      // et l'envoyer vers Obsidian
      
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
    }
  }

  async addMonitoredChannel(channelId: string): Promise<void> {
    this.monitoredChannels.add(channelId);
    console.log(`Canal ${channelId} ajouté à la surveillance`);
  }

  async removeMonitoredChannel(channelId: string): Promise<void> {
    this.monitoredChannels.delete(channelId);
    console.log(`Canal ${channelId} retiré de la surveillance`);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getMonitoredChannels(): string[] {
    return Array.from(this.monitoredChannels);
  }

  getClient(): Client {
    return this.client;
  }
}
