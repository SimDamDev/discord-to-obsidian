import { vi } from 'vitest';

// Mock du client Prisma DOIT être au sommet
vi.mock('../../lib/prisma', () => {
  const prismaMock = {
    user: {
      upsert: vi.fn(),
    },
  };
  return { default: prismaMock };
});

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma'; // Importer le mock
import axios from 'axios';

// Mock des appels externes (axios)
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/discord/login', () => {
    it('should initiate Discord OAuth2 flow', async () => {
      const response = await request(app)
        .post('/api/auth/discord/login')
        .expect(200);

      expect(response.body).toHaveProperty('authUrl');
    });
  });

  describe('POST /api/auth/discord/callback', () => {
    it('should handle Discord callback, create/update user, and return token', async () => {
      // 1. Mock des réponses externes
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'mock_access_token', refresh_token: 'mock_refresh_token' }
      });
      const mockDiscordUser = { id: '123456789', username: 'testuser', avatar: 'avatar_hash' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockDiscordUser });

      // 2. Mock de la réponse de la base de données
      const mockDbUser = { id: 'db_user_id', discordId: '123456789', username: 'testuser', avatarUrl: 'https://cdn.discordapp.com/avatars/123456789/avatar_hash.png' };
      (prisma.user.upsert as vi.Mock).mockResolvedValue(mockDbUser);

      // 3. Exécution de la requête
      const response = await request(app)
        .post('/api/auth/discord/callback')
        .send({ code: 'mock_auth_code' })
        .expect(200);

      // 4. Vérification de l'appel à la base de données
      expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { discordId: '123456789' },
        update: expect.any(Object),
        create: expect.objectContaining({
          discordId: '123456789',
          username: 'testuser',
        }),
      });

      // 5. Vérification de la réponse de l'API
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.id).toBe('db_user_id');
      expect(response.body.user.discordId).toBe('123456789');
      // Les tokens ne doivent plus être renvoyés
      expect(response.body).not.toHaveProperty('accessToken');
      expect(response.body).not.toHaveProperty('refreshToken');
    });

    it('should handle missing authorization code', async () => {
      const response = await request(app)
        .post('/api/auth/discord/callback')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Code d\'autorisation requis');
    });

    it('should handle Discord API errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Discord API Error'));

      const response = await request(app)
        .post('/api/auth/discord/callback')
        .send({ code: 'invalid_code' })
        .expect(500);

      expect(response.body.error).toBe('Erreur lors de l\'authentification');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      // Créer un token JWT valide pour le test
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        {
          discordId: '123456789',
          username: 'testuser',
          email: 'test@example.com',
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.discordId).toBe('123456789');
      expect(response.body.user.username).toBe('testuser');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token d\'accès requis');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token invalide');
    });
  });
});
