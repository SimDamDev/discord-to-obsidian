import prisma from '../lib/prisma'; // Utiliser le client Prisma partagé
import axios from 'axios';

export class DiscordCacheService {
  /**
   * Récupère les serveurs Discord d'un utilisateur.
   * NOTE: La logique de lecture du cache a été désactivée temporairement pour corriger une faille de sécurité
   * où les données d'un utilisateur pouvaient être montrées à un autre.
   * Le service appelle maintenant directement l'API de Discord pour garantir l'isolation des données.
   */
  static async getCachedServers(userId: string, accessToken: string) {
    try {
      console.log(`🔄 Récupération des serveurs depuis l'API Discord pour l'utilisateur ${userId}`);
      // Appelle directement la fonction de fetch pour garantir que l'utilisateur ne voit que ses propres serveurs.
      return await this.fetchAndCacheServers(accessToken);
    } catch (error) {
      console.error(`Erreur lors de la récupération des serveurs pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les canaux d'un serveur.
   * NOTE: La logique de lecture du cache a été désactivée temporairement pour corriger une faille de sécurité.
   */
  static async getCachedChannels(serverDiscordId: string, accessToken: string) {
    try {
      console.log(`🔄 Récupération des canaux pour le serveur ${serverDiscordId} depuis l'API Discord`);
      // Appelle directement la fonction de fetch pour garantir des données à jour.
      return await this.fetchAndCacheChannels(serverDiscordId, accessToken);
    } catch (error) {
      console.error(`Erreur lors de la récupération des canaux pour le serveur ${serverDiscordId}:`, error);
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

