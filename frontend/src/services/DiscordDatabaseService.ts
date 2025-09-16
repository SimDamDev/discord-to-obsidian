interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  owner: boolean;
  permissions: string;
  features: string[];
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  position?: number;
  parent_id?: string;
  topic?: string;
  nsfw: boolean;
}

class DiscordDatabaseService {
  private static instance: DiscordDatabaseService;

  static getInstance(): DiscordDatabaseService {
    if (!DiscordDatabaseService.instance) {
      DiscordDatabaseService.instance = new DiscordDatabaseService();
    }
    return DiscordDatabaseService.instance;
  }

  // Stocker ou mettre à jour les serveurs Discord (via API backend)
  async storeServers(userId: string, servers: DiscordGuild[]): Promise<void> {
    try {
      console.log(`💾 Stockage de ${servers.length} serveurs en base de données PostgreSQL pour l'utilisateur ${userId}`);
      
      // Appel vers l'API backend pour stocker les serveurs
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/discord/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          servers,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du stockage: ${response.statusText}`);
      }

      console.log(`✅ ${servers.length} serveurs stockés en base de données PostgreSQL`);
    } catch (error) {
      console.error('Erreur lors du stockage des serveurs:', error);
      // Ne pas faire échouer l'application si le stockage échoue
    }
  }

  // Récupérer les serveurs depuis la base de données (via API backend)
  async getServers(userId: string, accessToken: string): Promise<DiscordGuild[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/discord/servers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accessToken,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📦 Database hit: ${data.guilds?.length || 0} serveurs récupérés depuis la base de données PostgreSQL`);
      
      return data.guilds || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs:', error);
      return [];
    }
  }

  // Stocker les canaux d'un serveur (via API backend)
  async storeChannels(serverId: string, channels: DiscordChannel[]): Promise<void> {
    try {
      console.log(`💾 Stockage de ${channels.length} canaux en base de données pour le serveur ${serverId}`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/discord/channels/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverId,
          channels,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du stockage: ${response.statusText}`);
      }

      console.log(`✅ ${channels.length} canaux stockés en base de données`);
    } catch (error) {
      console.error('Erreur lors du stockage des canaux:', error);
      // Ne pas faire échouer l'application si le stockage échoue
    }
  }

  // Récupérer les canaux d'un serveur depuis la base de données (via API backend)
  async getChannels(serverId: string): Promise<DiscordChannel[]> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/discord/channels/cached?serverId=${serverId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📦 Database hit: ${data.channels?.length || 0} canaux récupérés depuis la base de données`);
      
      return data.channels || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des canaux:', error);
      return [];
    }
  }

  // Vérifier si les données sont récentes (moins de 15 minutes)
  async isDataRecent(userId: string, type: 'servers' | 'channels', serverId?: string): Promise<boolean> {
    try {
      // Pour l'instant, on considère que les données ne sont jamais récentes
      // pour forcer la récupération depuis l'API Discord et le stockage en DB
      // TODO: Implémenter une vraie vérification avec le backend
      console.log(`🔍 Vérification de la fraîcheur des données: ${type} pour ${userId} - Toujours false pour forcer la récupération`);
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de la fraîcheur des données:', error);
      return false;
    }
  }

  // Obtenir les statistiques de la base de données (via API backend)
  async getDatabaseStats() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/discord/database/stats`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des stats: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        users: 0,
        servers: 0,
        channels: 0,
        lastUpdate: new Date().toISOString(),
      };
    }
  }
}

export default DiscordDatabaseService;
