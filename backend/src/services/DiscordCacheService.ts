import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export class DiscordCacheService {
  private static readonly CACHE_DURATION_SERVERS = 15 * 60 * 1000; // 15 minutes
  private static readonly CACHE_DURATION_CHANNELS = 30 * 60 * 1000; // 30 minutes

  /**
   * Récupère les serveurs Discord avec cache
   */
  static async getCachedServers(userId: string, accessToken: string) {
    try {
      // Vérifier si on a des serveurs en cache récents
      const cachedServers = await prisma.discordServer.findMany({
        where: {
          lastCached: {
            gte: new Date(Date.now() - this.CACHE_DURATION_SERVERS)
          }
        },
        include: {
          discordChannels: {
            where: {
              lastCached: {
                gte: new Date(Date.now() - this.CACHE_DURATION_CHANNELS)
              }
            }
          }
        }
      });

      // Si on a des serveurs en cache, les retourner
      if (cachedServers.length > 0) {
        console.log(`📦 Cache hit: ${cachedServers.length} serveurs récupérés depuis le cache`);
        return this.formatServersForAPI(cachedServers);
      }

      // Sinon, récupérer depuis l'API Discord et mettre en cache
      console.log('🔄 Cache miss: Récupération depuis l\'API Discord');
      return await this.fetchAndCacheServers(accessToken);
    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs:', error);
      throw error;
    }
  }

  /**
   * Récupère les canaux d'un serveur avec cache
   */
  static async getCachedChannels(serverDiscordId: string, accessToken: string) {
    try {
      // Trouver le serveur en base
      const server = await prisma.discordServer.findUnique({
        where: { discordId: serverDiscordId },
        include: {
          discordChannels: {
            where: {
              lastCached: {
                gte: new Date(Date.now() - this.CACHE_DURATION_CHANNELS)
              }
            }
          }
        }
      });

      // Si on a des canaux en cache récents, les retourner
      if (server && server.discordChannels.length > 0) {
        console.log(`📦 Cache hit: ${server.discordChannels.length} canaux récupérés depuis le cache`);
        return this.formatChannelsForAPI(server.discordChannels);
      }

      // Sinon, récupérer depuis l'API Discord et mettre en cache
      console.log('🔄 Cache miss: Récupération des canaux depuis l\'API Discord');
      return await this.fetchAndCacheChannels(serverDiscordId, accessToken);
    } catch (error) {
      console.error('Erreur lors de la récupération des canaux:', error);
      throw error;
    }
  }

  /**
   * Récupère les serveurs depuis l'API Discord et les met en cache
   */
  private static async fetchAndCacheServers(accessToken: string) {
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const guilds = response.data;
    console.log(`✅ ${guilds.length} serveurs récupérés depuis l'API Discord`);

    // Mettre en cache chaque serveur
    for (const guild of guilds) {
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

    // Récupérer les serveurs mis en cache pour les retourner
    const cachedServers = await prisma.discordServer.findMany({
      where: {
        discordId: {
          in: guilds.map((g: any) => g.id)
        }
      },
      include: {
        discordChannels: true
      }
    });

    return this.formatServersForAPI(cachedServers);
  }

  /**
   * Récupère les canaux d'un serveur depuis l'API Discord et les met en cache
   */
  private static async fetchAndCacheChannels(serverDiscordId: string, accessToken: string) {
    const response = await axios.get(`https://discord.com/api/guilds/${serverDiscordId}/channels`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const channels = response.data.filter((channel: any) => channel.type === 0); // Seulement les canaux textuels
    console.log(`✅ ${channels.length} canaux récupérés depuis l'API Discord`);

    // Trouver le serveur en base
    const server = await prisma.discordServer.findUnique({
      where: { discordId: serverDiscordId }
    });

    if (!server) {
      throw new Error('Serveur non trouvé en base de données');
    }

    // Mettre en cache chaque canal
    for (const channel of channels) {
      await prisma.discordChannel.upsert({
        where: { discordId: channel.id },
        update: {
          name: channel.name,
          type: channel.type,
          position: channel.position,
          parentId: channel.parent_id,
          topic: channel.topic,
          nsfw: channel.nsfw || false,
          lastCached: new Date(),
        },
        create: {
          discordId: channel.id,
          name: channel.name,
          type: channel.type,
          position: channel.position,
          parentId: channel.parent_id,
          topic: channel.topic,
          nsfw: channel.nsfw || false,
          serverId: server.id,
          lastCached: new Date(),
        },
      });
    }

    // Récupérer les canaux mis en cache pour les retourner
    const cachedChannels = await prisma.discordChannel.findMany({
      where: {
        serverId: server.id,
        discordId: {
          in: channels.map((c: any) => c.id)
        }
      }
    });

    return this.formatChannelsForAPI(cachedChannels);
  }

  /**
   * Formate les serveurs pour l'API
   */
  private static formatServersForAPI(servers: any[]) {
    return servers.map(server => ({
      id: server.discordId,
      name: server.name,
      icon: server.iconUrl,
      owner: server.ownerId === 'true',
      permissions: server.permissions ? JSON.parse(server.permissions) : null,
      features: server.features ? JSON.parse(server.features) : [],
    }));
  }

  /**
   * Formate les canaux pour l'API
   */
  private static formatChannelsForAPI(channels: any[]) {
    return channels.map(channel => ({
      id: channel.discordId,
      name: channel.name,
      type: channel.type,
      position: channel.position,
      parent_id: channel.parentId,
      topic: channel.topic,
      nsfw: channel.nsfw,
    }));
  }

  /**
   * Nettoie le cache expiré
   */
  static async cleanExpiredCache() {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 heures

    await prisma.discordChannel.deleteMany({
      where: {
        lastCached: {
          lt: expiredDate
        }
      }
    });

    await prisma.discordServer.deleteMany({
      where: {
        lastCached: {
          lt: expiredDate
        }
      }
    });

    console.log('🧹 Cache expiré nettoyé');
  }

  /**
   * Stocke les serveurs en base de données
   */
  static async storeServers(userId: string, servers: any[]) {
    try {
      console.log(`💾 Stockage de ${servers.length} serveurs en base de données PostgreSQL`);

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

      console.log(`✅ ${servers.length} serveurs stockés en base de données PostgreSQL`);
    } catch (error) {
      console.error('Erreur lors du stockage des serveurs:', error);
      throw error;
    }
  }
}

