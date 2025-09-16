import { DiscordGuild } from '@/types/auth';

export interface ServerBotStatus {
  serverId: string;
  serverName: string;
  botPresent: boolean;
  error?: string;
}

export class BotStatusService {
  private static cache = new Map<string, { status: ServerBotStatus; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Vérifie le statut du bot sur un serveur spécifique
   */
  static async checkBotStatus(serverId: string): Promise<ServerBotStatus> {
    // Vérifier le cache
    const cached = this.cache.get(serverId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📦 Cache hit pour le statut du bot sur le serveur ${serverId}`);
      return cached.status;
    }

    try {
      const response = await fetch(`/api/discord/servers/${serverId}/bot-status`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const status: ServerBotStatus = {
        serverId,
        serverName: '', // Sera rempli par l'appelant
        botPresent: data.botPresent || false,
        error: data.error
      };

      // Mettre en cache
      this.cache.set(serverId, { status, timestamp: Date.now() });
      
      console.log(`✅ Statut du bot vérifié pour le serveur ${serverId}: ${status.botPresent}`);
      return status;
    } catch (error) {
      console.error(`❌ Erreur lors de la vérification du bot pour le serveur ${serverId}:`, error);
      
      const status: ServerBotStatus = {
        serverId,
        serverName: '',
        botPresent: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };

      return status;
    }
  }

  /**
   * Vérifie le statut du bot sur tous les serveurs
   */
  static async checkAllServersBotStatus(servers: DiscordGuild[]): Promise<ServerBotStatus[]> {
    console.log(`🔍 Vérification du statut du bot sur ${servers.length} serveurs...`);
    
    const promises = servers.map(async (server) => {
      const status = await this.checkBotStatus(server.id);
      return {
        ...status,
        serverName: server.name
      };
    });

    const results = await Promise.all(promises);
    
    const botPresentCount = results.filter(r => r.botPresent).length;
    console.log(`🤖 Bot présent sur ${botPresentCount}/${servers.length} serveurs`);
    
    return results;
  }

  /**
   * Vide le cache
   */
  static clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache du statut des bots vidé');
  }

  /**
   * Obtient le statut depuis le cache sans faire d'appel API
   */
  static getCachedStatus(serverId: string): ServerBotStatus | null {
    const cached = this.cache.get(serverId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.status;
    }
    return null;
  }
}
