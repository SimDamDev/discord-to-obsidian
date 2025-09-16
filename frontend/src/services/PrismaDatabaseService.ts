import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

class PrismaDatabaseService {
  private static instance: PrismaDatabaseService;

  static getInstance(): PrismaDatabaseService {
    if (!PrismaDatabaseService.instance) {
      PrismaDatabaseService.instance = new PrismaDatabaseService();
    }
    return PrismaDatabaseService.instance;
  }

  // Stocker les serveurs Discord en base de données PostgreSQL
  async storeServers(userId: string, servers: DiscordGuild[]): Promise<void> {
    try {
      console.log(`💾 [Prisma] Stockage de ${servers.length} serveurs en base de données PostgreSQL pour l'utilisateur ${userId}`);

      // Mettre en cache chaque serveur
      for (const guild of servers) {
        await prisma.discordServer.upsert({
          where: { discordId: guild.id },
          update: {
            name: guild.name,
            iconUrl: guild.icon ? 
              `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 
              null,
            ownerId: guild.owner ? 'true' : 'false',
            permissions: JSON.stringify(guild.permissions),
            features: JSON.stringify(guild.features),
            lastCached: new Date(),
          },
          create: {
            discordId: guild.id,
            name: guild.name,
            iconUrl: guild.icon ? 
              `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : 
              null,
            ownerId: guild.owner ? 'true' : 'false',
            permissions: JSON.stringify(guild.permissions),
            features: JSON.stringify(guild.features),
            lastCached: new Date(),
          },
        });
      }

      console.log(`✅ [Prisma] ${servers.length} serveurs stockés en base de données PostgreSQL`);
    } catch (error) {
      console.error('Erreur lors du stockage des serveurs:', error);
      throw error;
    }
  }

  // Récupérer les serveurs depuis la base de données PostgreSQL
  async getServers(userId: string): Promise<DiscordGuild[]> {
    try {
      const servers = await prisma.discordServer.findMany({
        where: {
          lastCached: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
          }
        }
      });

      const formattedServers = servers.map(server => ({
        id: server.discordId,
        name: server.name,
        icon: server.iconUrl ? server.iconUrl.split('/').pop()?.split('.')[0] : undefined,
        owner: server.ownerId === 'true',
        permissions: server.permissions ? JSON.parse(server.permissions) : '0',
        features: server.features ? JSON.parse(server.features) : []
      }));

      console.log(`📦 [Prisma] ${formattedServers.length} serveurs récupérés depuis la base de données PostgreSQL`);
      return formattedServers;
    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs:', error);
      return [];
    }
  }

  // Vérifier si les données sont récentes (moins de 15 minutes)
  async isDataRecent(userId: string, type: 'servers' | 'channels', serverId?: string): Promise<boolean> {
    try {
      if (type === 'servers') {
        const recentServers = await prisma.discordServer.findFirst({
          where: {
            lastCached: {
              gte: new Date(Date.now() - 15 * 60 * 1000)
            }
          }
        });
        return !!recentServers;
      } else {
        const recentChannels = await prisma.discordChannel.findFirst({
          where: {
            serverId: serverId,
            lastCached: {
              gte: new Date(Date.now() - 15 * 60 * 1000)
            }
          }
        });
        return !!recentChannels;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la fraîcheur des données:', error);
      return false;
    }
  }

  // Obtenir les statistiques de la base de données
  async getDatabaseStats() {
    try {
      const [users, servers, channels] = await Promise.all([
        prisma.user.count(),
        prisma.discordServer.count(),
        prisma.discordChannel.count()
      ]);

      return {
        users,
        servers,
        channels,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        users: 0,
        servers: 0,
        channels: 0,
        lastUpdate: new Date().toISOString()
      };
    }
  }
}

export default PrismaDatabaseService;
