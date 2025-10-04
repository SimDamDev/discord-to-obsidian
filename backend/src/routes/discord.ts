import { Router } from 'express';
import { authenticateToken } from './auth'; // Importer le middleware
import { DiscordCacheService } from '../services/DiscordCacheService';
import prisma from '../lib/prisma';

const router = Router();

// Appliquer le middleware à toutes les routes de ce routeur
router.use(authenticateToken);

/**
 * GET /api/discord/servers
 * Récupère les serveurs Discord de l'utilisateur authentifié
 */
router.get('/servers', async (req, res) => {
  try {
    const userId = req.user.id; // Obtenir l'ID de l'utilisateur depuis le token

    // Récupérer l'accessToken de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.accessToken) {
      return res.status(401).json({ error: 'Token d\'accès Discord non trouvé pour l\'utilisateur' });
    }

    const servers = await DiscordCacheService.getCachedServers(userId, user.accessToken);
    res.json({ guilds: servers });
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des serveurs' });
  }
});

/**
 * POST /api/discord/servers
 * Stocke les serveurs Discord sélectionnés par l'utilisateur authentifié
 */
router.post('/servers', async (req, res) => {
  try {
    const userId = req.user.id; // Obtenir l'ID de l'utilisateur depuis le token
    const { servers } = req.body;

    if (!servers) {
      return res.status(400).json({ error: 'La liste des serveurs est requise' });
    }

    // Stocker les serveurs en base de données
    await DiscordCacheService.storeServers(userId, servers);
    
    console.log(`💾 [Backend] ${servers.length} serveurs stockés pour l'utilisateur ${userId}`);
    
    res.json({ 
      success: true, 
      message: `${servers.length} serveurs stockés`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors du stockage des serveurs:', error);
    res.status(500).json({ error: 'Erreur lors du stockage des serveurs' });
  }
});

/**
 * GET /api/discord/servers/:serverId/channels
 * Récupère les canaux d'un serveur pour l'utilisateur authentifié
 */
router.get('/servers/:serverId/channels', async (req, res) => {
  try {
    const userId = req.user.id; // Obtenir l'ID de l'utilisateur depuis le token
    const { serverId } = req.params;

    // Récupérer l'accessToken de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.accessToken) {
      return res.status(401).json({ error: 'Token d\'accès Discord non trouvé pour l\'utilisateur' });
    }

    const channels = await DiscordCacheService.getCachedChannels(serverId, user.accessToken);
    res.json({ channels });
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des canaux' });
  }
});

export default router;