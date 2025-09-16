import { Router } from 'express';
import { DiscordCacheService } from '../services/DiscordCacheService';

const router = Router();

/**
 * GET /api/cache/servers
 * Récupère les serveurs Discord avec cache
 */
router.get('/servers', async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({ error: 'userId et accessToken requis' });
    }

    const servers = await DiscordCacheService.getCachedServers(userId, accessToken);
    res.json({ servers });
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des serveurs' });
  }
});

/**
 * GET /api/cache/channels/:serverId
 * Récupère les canaux d'un serveur avec cache
 */
router.get('/channels/:serverId', async (req, res) => {
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

/**
 * POST /api/cache/clean
 * Nettoie le cache expiré
 */
router.post('/clean', async (req, res) => {
  try {
    await DiscordCacheService.cleanExpiredCache();
    res.json({ message: 'Cache nettoyé avec succès' });
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache:', error);
    res.status(500).json({ error: 'Erreur lors du nettoyage du cache' });
  }
});

export default router;

