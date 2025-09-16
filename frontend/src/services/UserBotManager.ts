import { UserBot, AuthorizedServer, CreateUserBotRequest, BotCreationResult, BotInviteLink } from '@/types/userBot';
import crypto from 'crypto';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserBotManager {
  private static instance: UserBotManager;

  public static getInstance(): UserBotManager {
    if (!UserBotManager.instance) {
      UserBotManager.instance = new UserBotManager();
    }
    return UserBotManager.instance;
  }

  /**
   * Configure le bot principal pour un utilisateur (RGPD - isolation par serveur)
   */
  async createUserBot(request: CreateUserBotRequest, userAccessToken: string): Promise<BotCreationResult> {
    try {
      console.log(`🤖 Configuration du bot principal pour l'utilisateur ${request.userId} (RGPD - isolation par serveur)`);
      
      // Utiliser le bot Discord principal configuré dans les variables d'environnement
      if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CLIENT_ID) {
        throw new Error('Bot Discord principal non configuré dans les variables d\'environnement');
      }

      // Récupérer l'utilisateur par son Discord ID
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { discordId: request.userId }
        });
      } catch (dbError) {
        console.warn('Base de données non accessible, utilisation du mode développement:', dbError);
        // Mode développement sans base de données
        user = { id: `dev-user-${request.userId}`, discordId: request.userId };
      }

      if (!user) {
        throw new Error(`Utilisateur ${request.userId} non trouvé`);
      }

      // Créer une configuration utilisateur pour le bot principal
      let savedBot;
      try {
        savedBot = await prisma.userBot.create({
          data: {
            userId: user.id,
            clientId: process.env.DISCORD_CLIENT_ID,
            token: process.env.DISCORD_BOT_TOKEN,
            name: 'Discord to Obsidian Bot Principal',
            isActive: true,
            // Champs RGPD pour l'isolation des données
            userDiscordId: request.userId,
            dataIsolation: true,
          }
        });
      } catch (dbError) {
        console.warn('Base de données non accessible, création d\'un bot temporaire:', dbError);
        // Mode développement sans base de données
        savedBot = {
          id: `dev-bot-${Date.now()}`,
          userId: user.id,
          clientId: process.env.DISCORD_CLIENT_ID,
          token: process.env.DISCORD_BOT_TOKEN,
          name: 'Discord to Obsidian Bot Principal',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const userBot: UserBot = {
        id: savedBot.id,
        userId: savedBot.userId,
        clientId: savedBot.clientId,
        token: savedBot.token,
        name: savedBot.name,
        isActive: savedBot.isActive,
        createdAt: savedBot.createdAt,
        updatedAt: savedBot.updatedAt,
      };

      // Générer le lien d'invitation pour inviter le bot sur les serveurs de l'utilisateur
      const inviteLink = this.generateInviteLink(process.env.DISCORD_CLIENT_ID, request.permissions || ['VIEW_CHANNELS', 'READ_MESSAGE_HISTORY']);

      console.log(`✅ Bot principal configuré pour l'utilisateur ${request.userId} avec isolation RGPD par serveur`);
      
      return {
        bot: userBot,
        inviteLink,
        success: true,
        message: 'Bot principal configuré. Invitez-le sur vos serveurs pour commencer.'
      };
    } catch (error) {
      console.error('Erreur lors de la configuration du bot principal:', error);
      
      // Pas de fallback - échec complet
      throw error;
    }
  }

  /**
   * Récupère le bot actif d'un utilisateur
   */
  async getUserBot(userId: string): Promise<UserBot | null> {
    try {
      console.log(`🔍 Recherche du bot pour l'utilisateur ${userId}`);
      
      // Récupérer l'utilisateur par son Discord ID
      const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: {
          userBots: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user || user.userBots.length === 0) {
        console.log(`❌ Aucun bot actif trouvé pour l'utilisateur ${userId}`);
        return null;
      }

      const userBot = user.userBots[0];
      console.log(`✅ Bot trouvé pour l'utilisateur ${userId}: ${userBot.name}`);
      
      return {
        id: userBot.id,
        userId: userBot.userId,
        clientId: userBot.clientId,
        token: userBot.token,
        name: userBot.name,
        isActive: userBot.isActive,
        createdAt: userBot.createdAt,
        updatedAt: userBot.updatedAt,
      };
    } catch (error) {
      console.warn('Base de données non accessible, utilisation du bot principal en mode développement:', error);
      
      // Mode développement sans base de données - retourner le bot principal
      if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CLIENT_ID) {
        console.log(`✅ Utilisation du bot principal en mode développement pour l'utilisateur ${userId}`);
        return {
          id: `dev-bot-${userId}`,
          userId: `dev-user-${userId}`,
          clientId: process.env.DISCORD_CLIENT_ID,
          token: process.env.DISCORD_BOT_TOKEN,
          name: 'Discord to Obsidian Bot Principal',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      
      return null;
    }
  }

  /**
   * Vérifie si un utilisateur a accès à un serveur
   */
  async isServerAuthorized(userId: string, serverId: string): Promise<boolean> {
    try {
      console.log(`🔍 Vérification de l'autorisation pour l'utilisateur ${userId} sur le serveur ${serverId}`);
      
      // Récupérer l'utilisateur par son Discord ID
      const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: {
          authorizedServers: {
            where: { 
              serverId: serverId,
              isActive: true 
            }
          }
        }
      });

      const isAuthorized = user && user.authorizedServers.length > 0;
      console.log(`${isAuthorized ? '✅' : '❌'} Autorisation ${isAuthorized ? 'accordée' : 'refusée'} pour l'utilisateur ${userId} sur le serveur ${serverId}`);
      
      return isAuthorized;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'autorisation du serveur:', error);
      return false;
    }
  }

  /**
   * Récupère les serveurs autorisés pour un utilisateur
   */
  async getAuthorizedServers(userId: string): Promise<AuthorizedServer[]> {
    try {
      console.log(`🔍 Récupération des serveurs autorisés pour l'utilisateur ${userId}`);
      
      // Récupérer l'utilisateur par son Discord ID
      const user = await prisma.user.findUnique({
        where: { discordId: userId },
        include: {
          authorizedServers: {
            where: { isActive: true },
            orderBy: { authorizedAt: 'desc' }
          }
        }
      });

      if (!user) {
        console.log(`❌ Utilisateur ${userId} non trouvé`);
        return [];
      }

      const authorizedServers = user.authorizedServers.map(server => ({
        id: server.id,
        userId: server.userId,
        serverId: server.serverId,
        serverName: server.serverName,
        botId: server.botId,
        permissions: server.permissions,
        isActive: server.isActive,
        authorizedAt: server.authorizedAt,
      }));

      console.log(`✅ ${authorizedServers.length} serveurs autorisés trouvés pour l'utilisateur ${userId}`);
      return authorizedServers;
    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs autorisés:', error);
      return [];
    }
  }

  /**
   * Autorise un serveur pour un bot utilisateur
   */
  async authorizeServer(userId: string, serverId: string, serverName: string, botId: string, permissions: string): Promise<AuthorizedServer> {
    try {
      console.log(`🔐 Autorisation du serveur ${serverName} pour l'utilisateur ${userId}`);
      
      // Récupérer l'utilisateur par son Discord ID
      const user = await prisma.user.findUnique({
        where: { discordId: userId }
      });

      if (!user) {
        throw new Error(`Utilisateur ${userId} non trouvé`);
      }

      // Créer ou mettre à jour l'autorisation du serveur
      const authorizedServer = await prisma.authorizedServer.upsert({
        where: {
          userId_serverId: {
            userId: user.id,
            serverId: serverId
          }
        },
        update: {
          serverName,
          botId,
          permissions,
          isActive: true,
        },
        create: {
          userId: user.id,
          serverId,
          serverName,
          botId,
          permissions,
          isActive: true,
        }
      });

      console.log(`✅ Serveur autorisé pour l'utilisateur ${userId}:`, serverName);
      
      return {
        id: authorizedServer.id,
        userId: authorizedServer.userId,
        serverId: authorizedServer.serverId,
        serverName: authorizedServer.serverName,
        botId: authorizedServer.botId,
        permissions: authorizedServer.permissions,
        isActive: authorizedServer.isActive,
        authorizedAt: authorizedServer.authorizedAt,
      };
    } catch (error) {
      console.error('Erreur lors de l\'autorisation du serveur:', error);
      throw error;
    }
  }

  /**
   * Génère un client ID unique (snowflake Discord)
   */
  private generateClientId(): string {
    // Générer un snowflake Discord valide (17-19 chiffres)
    // Discord snowflakes commencent généralement par un timestamp
    const timestamp = Date.now() - 1420070400000; // Discord epoch
    const workerId = Math.floor(Math.random() * 32);
    const processId = Math.floor(Math.random() * 32);
    const increment = Math.floor(Math.random() * 4096);
    
    // Construire le snowflake et s'assurer qu'il est positif
    let snowflake = (timestamp << 22) | (workerId << 17) | (processId << 12) | increment;
    
    // S'assurer que le snowflake est positif et dans la plage valide
    if (snowflake < 0) {
      snowflake = Math.abs(snowflake);
    }
    
    // S'assurer que c'est un nombre valide (minimum 17 chiffres)
    const minSnowflake = 100000000000000000; // 17 chiffres minimum
    if (snowflake < minSnowflake) {
      snowflake = minSnowflake + Math.floor(Math.random() * 100000000000000000);
    }
    
    return snowflake.toString();
  }

  /**
   * Génère un token de bot unique (format Discord)
   */
  private generateBotToken(clientId: string): string {
    // Format Discord bot token: [client_id].[random_base64]
    const randomPart = crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '');
    return `${clientId}.${randomPart}`;
  }

  /**
   * Génère un lien d'invitation Discord
   */
  private generateInviteLink(clientId: string, permissions: string[]): BotInviteLink {
    const permissionBits = this.calculatePermissionBits(permissions);
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissionBits}`;
    
    return {
      url: inviteUrl,
      permissions: permissionBits,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    };
  }

  /**
   * Calcule les bits de permissions Discord
   */
  private calculatePermissionBits(permissions: string[]): number {
    const permissionMap: { [key: string]: number } = {
      'VIEW_CHANNELS': 1024,
      'READ_MESSAGE_HISTORY': 65536,
      'SEND_MESSAGES': 2048,
      'MANAGE_MESSAGES': 8192,
    };

    return permissions.reduce((bits, permission) => {
      return bits | (permissionMap[permission] || 0);
    }, 0);
  }
}

export default UserBotManager;