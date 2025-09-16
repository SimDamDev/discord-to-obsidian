import { PrismaClient } from '@prisma/client';
import { UserBot, AuthorizedServer, CreateUserBotRequest, BotCreationResult, BotInviteLink } from '@/types/userBot';
import crypto from 'crypto';

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
   * Crée un nouveau bot pour un utilisateur
   */
  async createUserBot(request: CreateUserBotRequest): Promise<BotCreationResult> {
    try {
      // Vérifier si l'utilisateur a déjà un bot actif
      const existingBot = await prisma.userBot.findFirst({
        where: {
          userId: request.userId,
          isActive: true
        }
      });

      if (existingBot) {
        throw new Error('L\'utilisateur a déjà un bot actif');
      }

      // Générer un client ID et token unique
      const clientId = this.generateClientId();
      const token = this.generateBotToken();

      // Créer le bot en base
      const bot = await prisma.userBot.create({
        data: {
          userId: request.userId,
          clientId,
          token,
          name: request.botName,
          isActive: true
        }
      });

      // Générer le lien d'invitation
      const inviteLink = this.generateInviteLink(clientId, request.permissions || ['VIEW_CHANNELS', 'READ_MESSAGE_HISTORY']);

      return {
        bot: bot as UserBot,
        inviteLink
      };
    } catch (error) {
      console.error('Erreur lors de la création du bot utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère le bot actif d'un utilisateur
   */
  async getUserBot(userId: string): Promise<UserBot | null> {
    try {
      const bot = await prisma.userBot.findFirst({
        where: {
          userId,
          isActive: true
        }
      });

      return bot as UserBot | null;
    } catch (error) {
      console.error('Erreur lors de la récupération du bot utilisateur:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur a accès à un serveur
   */
  async isServerAuthorized(userId: string, serverId: string): Promise<boolean> {
    try {
      const authorizedServer = await prisma.authorizedServer.findFirst({
        where: {
          userId,
          serverId,
          isActive: true
        }
      });

      return !!authorizedServer;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'autorisation:', error);
      return false;
    }
  }

  /**
   * Ajoute un serveur autorisé pour un utilisateur
   */
  async authorizeServer(userId: string, serverId: string, serverName: string, botId: string, permissions: string[]): Promise<AuthorizedServer> {
    try {
      const authorizedServer = await prisma.authorizedServer.upsert({
        where: {
          userId_serverId: {
            userId,
            serverId
          }
        },
        update: {
          isActive: true,
          permissions: JSON.stringify(permissions),
          authorizedAt: new Date()
        },
        create: {
          userId,
          serverId,
          serverName,
          botId,
          permissions: JSON.stringify(permissions),
          isActive: true
        }
      });

      return authorizedServer as AuthorizedServer;
    } catch (error) {
      console.error('Erreur lors de l\'autorisation du serveur:', error);
      throw error;
    }
  }

  /**
   * Récupère les serveurs autorisés d'un utilisateur
   */
  async getAuthorizedServers(userId: string): Promise<AuthorizedServer[]> {
    try {
      const servers = await prisma.authorizedServer.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: {
          authorizedAt: 'desc'
        }
      });

      return servers.map(server => ({
        ...server,
        permissions: JSON.parse(server.permissions)
      })) as AuthorizedServer[];
    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs autorisés:', error);
      throw error;
    }
  }

  /**
   * Révoke l'accès à un serveur
   */
  async revokeServerAccess(userId: string, serverId: string): Promise<void> {
    try {
      await prisma.authorizedServer.updateMany({
        where: {
          userId,
          serverId
        },
        data: {
          isActive: false
        }
      });
    } catch (error) {
      console.error('Erreur lors de la révocation d\'accès:', error);
      throw error;
    }
  }

  /**
   * Désactive le bot d'un utilisateur
   */
  async deactivateUserBot(userId: string): Promise<void> {
    try {
      await prisma.userBot.updateMany({
        where: {
          userId
        },
        data: {
          isActive: false
        }
      });

      // Désactiver aussi tous les serveurs autorisés
      await prisma.authorizedServer.updateMany({
        where: {
          userId
        },
        data: {
          isActive: false
        }
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation du bot:', error);
      throw error;
    }
  }

  /**
   * Génère un client ID unique
   */
  private generateClientId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Génère un token de bot unique
   */
  private generateBotToken(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * Génère un lien d'invitation Discord
   */
  private generateInviteLink(clientId: string, permissions: string[]): BotInviteLink {
    const permissionBits = this.calculatePermissionBits(permissions);
    const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissionBits}`;
    
    return {
      url,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      permissions: permissionBits
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
      'EMBED_LINKS': 16384,
      'ATTACH_FILES': 32768,
      'USE_EXTERNAL_EMOJIS': 262144,
      'ADD_REACTIONS': 64
    };

    return permissions.reduce((bits, permission) => {
      return bits | (permissionMap[permission] || 0);
    }, 0);
  }
}

export default UserBotManager;
