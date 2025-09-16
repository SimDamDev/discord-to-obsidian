import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth';

// Étendre l'interface Request pour inclure la propriété user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { HybridMessageService } from '../services/HybridMessageService';

const router = Router();

// Instance globale du service hybride (dans un vrai projet, utiliser un conteneur DI)
let hybridService: HybridMessageService;

// Initialiser le service hybride
const initializeHybridService = async () => {
  if (!hybridService) {
    hybridService = new HybridMessageService();
    await hybridService.initialize();
  }
  return hybridService;
};

// Statistiques des connexions
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const service = await initializeHybridService();
    const stats = await service.getStats();

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Santé du service hybride
router.get('/health', authenticateToken, async (req: Request, res: Response) => {
  try {
    const service = await initializeHybridService();
    const health = await service.getHealthStatus();

    res.json(health);
  } catch (error) {
    console.error('Erreur lors de la vérification de la santé:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification de la santé' });
  }
});

// Forcer le mode temps réel
router.post('/force-realtime', authenticateToken, async (req: Request, res: Response) => {
  try {
    const service = await initializeHybridService();
    const connectionId = `force-realtime-${Date.now()}`;
    const userId = req.user.discordId;

    await service.addConnection(connectionId, userId);

    res.json({ 
      message: 'Mode temps réel activé',
      connectionId,
      mode: 'realtime',
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation du mode temps réel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'activation du mode temps réel' });
  }
});

// Forcer le mode polling
router.post('/force-polling', authenticateToken, async (req: Request, res: Response) => {
  try {
    const service = await initializeHybridService();
    const connectionManager = service.getConnectionManager();
    
    // Supprimer toutes les connexions pour forcer le mode polling
    const connections = connectionManager.getConnections();
    for (const connection of connections) {
      await connectionManager.removeConnection(connection.connectionId);
    }

    res.json({ 
      message: 'Mode polling activé',
      mode: 'polling',
    });
  } catch (error) {
    console.error('Erreur lors de l\'activation du mode polling:', error);
    res.status(500).json({ error: 'Erreur lors de l\'activation du mode polling' });
  }
});

// Ajouter une connexion WebSocket
router.post('/websocket', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    const userId = req.user.discordId;

    if (!connectionId) {
      return res.status(400).json({ error: 'ID de connexion requis' });
    }

    const service = await initializeHybridService();
    await service.addConnection(connectionId, userId);

    res.json({ 
      message: 'Connexion WebSocket ajoutée',
      connectionId,
      userId,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la connexion WebSocket:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la connexion WebSocket' });
  }
});

// Supprimer une connexion WebSocket
router.delete('/websocket/:connectionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;

    const service = await initializeHybridService();
    await service.removeConnection(connectionId);

    res.json({ 
      message: 'Connexion WebSocket supprimée',
      connectionId,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la connexion WebSocket:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la connexion WebSocket' });
  }
});

// Mettre à jour l'activité d'une connexion
router.post('/websocket/:connectionId/activity', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;

    const service = await initializeHybridService();
    const connectionManager = service.getConnectionManager();
    connectionManager.updateActivity(connectionId);

    res.json({ 
      message: 'Activité mise à jour',
      connectionId,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'activité' });
  }
});

export default router;

