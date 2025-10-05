import { Router } from 'express';
import { authenticateToken } from './auth';

const router = Router();
router.use(authenticateToken);

/**
 * GET /api/user-bot/status
 * Renvoie un statut simulé pour le bot de l'utilisateur.
 */
router.get('/status', async (req, res) => {
  // Pour le développement du frontend, on simule que le bot existe.
  res.json({ hasBot: true });
});

export default router;