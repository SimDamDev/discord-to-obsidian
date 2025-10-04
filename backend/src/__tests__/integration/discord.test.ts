import { vi } from 'vitest';

// Mock du client Prisma
vi.mock('../../lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    discordServer: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    discordChannel: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import prisma from '../../lib/prisma';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Discord Integration', () => {
  let validToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    const jwt = require('jsonwebtoken');
    validToken = jwt.sign(
      { id: 'db_user_id', discordId: '123456789' }, // Token corrigé avec l'ID de la DB
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('GET /api/discord/servers', () => {
    it('should return user guilds with valid token', async () => {
      // 1. Mock de la recherche utilisateur en DB
      (prisma.user.findUnique as vi.Mock).mockResolvedValue({ accessToken: 'mock_access_token' });

      // 2. Mock de la réponse de l'API Discord
      const mockApiGuilds = [{ id: 'guild1', name: 'Test Server 1', icon: null, owner: true, permissions: '0', features: [] }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockApiGuilds });

      // 3. Mock des opérations de la DB (avec le bon format)
      const mockDbGuilds = [{
        discordId: 'guild1',
        name: 'Test Server 1',
        iconUrl: null,
        ownerId: 'true',
        permissions: '"0"', // JSON stringified
        features: '[]',   // JSON stringified
      }];
      (prisma.discordServer.upsert as vi.Mock).mockResolvedValue(null);
      (prisma.discordServer.findMany as vi.Mock).mockResolvedValue(mockDbGuilds);

      // 4. Exécution et vérification
      const response = await request(app)
        .get('/api/discord/servers')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.guilds[0].id).toBe('guild1');
      expect(response.body.guilds[0].features).toEqual([]);
    });

    it('should return 401 if user has no access token', async () => {
      // Mock d'un utilisateur sans token
      (prisma.user.findUnique as vi.Mock).mockResolvedValue({ accessToken: null });

      const response = await request(app)
        .get('/api/discord/servers')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token d\'accès Discord non trouvé pour l\'utilisateur');
    });

    it('should handle Discord API errors', async () => {
      (prisma.user.findUnique as vi.Mock).mockResolvedValue({ accessToken: 'mock_access_token' });
      mockedAxios.get.mockRejectedValueOnce(new Error('Discord API Error'));

      await request(app)
        .get('/api/discord/servers')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500);
    });
  });

  // Les tests pour les routes de monitoring sont commentés car les routes n'existent pas encore.
  /*
  describe('POST /api/discord/channels/monitor', () => {
    it('should add channel to monitoring', async () => {
      // ...
    });
  });

  describe('DELETE /api/discord/channels/:id/monitor', () => {
    it('should remove channel from monitoring', async () => {
      // ...
    });
  });

  describe('GET /api/discord/channels/monitored', () => {
    it('should return monitored channels', async () => {
      // ...
    });
  });
  */
});
