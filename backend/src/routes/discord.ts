import { Router } from 'express';
import { DiscordCacheService } from '../services/DiscordCacheService';

const router = Router();

/**
 * GET /api/discord/servers
 * Récupère les serveurs Discord avec cache
 */
router.get('/servers', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'userId et accessToken requis' });
    }

    const servers = await DiscordCacheService.getCachedServers(userId, accessToken);
    res.json({ guilds: servers });
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des serveurs' });
  }
});

/**
 * POST /api/discord/servers
 * Stocke les serveurs Discord en base de données
 */
router.post('/servers', async (req, res) => {
  try {
    const { userId, servers } = req.body;

    if (!userId || !servers) {
      return res.status(400).json({ error: 'userId et servers requis' });
    }

    // Stocker les serveurs en base de données
    await DiscordCacheService.storeServers(userId, servers);
    
    console.log(`💾 [Backend] ${servers.length} serveurs stockés en base de données PostgreSQL pour l'utilisateur ${userId}`);
    
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
 * Récupère les canaux d'un serveur avec cache
 */
router.get('/servers/:serverId/channels', async (req, res) => {
  try {
    const { serverId } = req.params;
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken requis' });
    }

    const channels = await DiscordCacheService.getCachedChannels(serverId, accessToken);
    res.json({ channels });
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des canaux' });
  }
});

export default router;