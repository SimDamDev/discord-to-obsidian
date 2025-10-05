import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();

// Étendre l'interface Request pour inclure la propriété user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware d'authentification
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Initier le processus OAuth2 Discord
router.post('/discord/login', async (req: Request, res: Response) => {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/discord';
    
    const authUrl = `https://discord.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=identify%20email%20guilds`;

    res.json({ authUrl });
  } catch (error) {
    console.error('Erreur lors de l\'initiation OAuth2:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Traiter le callback OAuth2
router.post('/discord/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code d\'autorisation requis' });
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', {
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/discord',
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Récupérer les informations utilisateur depuis Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    const discordUser = userResponse.data;
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    // Sauvegarder ou mettre à jour l'utilisateur dans la base de données
    const user = await prisma.user.upsert({
      where: { discordId: discordUser.id },
      update: {
        username: discordUser.username,
        avatarUrl: avatarUrl,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
      create: {
        discordId: discordUser.id,
        username: discordUser.username,
        avatarUrl: avatarUrl,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
    });

    // Créer un token JWT pour l'utilisateur
    const jwtToken = jwt.sign(
      {
        id: user.id, // ID de notre base de données
        discordId: user.discordId,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        discordId: user.discordId,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error('Erreur lors du callback OAuth2:', error);
    res.status(500).json({ error: 'Erreur lors de l\'authentification' });
  }
});

// Récupérer le profil utilisateur
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

export default router;

