import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

// Mock des appels externes
import axios from 'axios';
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Discord Integration', () => {
  let validToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Créer un token JWT valide pour les tests
    const jwt = require('jsonwebtoken');
    validToken = jwt.sign(
      {
        discordId: '123456789',
        username: 'testuser',
        email: 'test@example.com',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('GET /api/discord/servers', () => {
    it('should return user guilds with valid token', async () => {
      // Mock de la réponse des serveurs Discord
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: 'guild1',
            name: 'Test Server 1',
            icon: 'icon1',
            owner: true,
            permissions: '2147483647',
            features: ['COMMUNITY', 'NEWS'],
          },
          {
            id: 'guild2',
            name: 'Test Server 2',
            icon: null,
            owner: false,
            permissions: '1048576',
            features: [],
          },
        ]
      });

      const response = await request(app)
        .get('/api/discord/servers')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-discord-token', 'mock_discord_token')
        .expect(200);

      expect(response.body).toHaveProperty('guilds');
      expect(response.body.guilds).toHaveLength(2);
      expect(response.body.guilds[0]).toHaveProperty('id', 'guild1');
      expect(response.body.guilds[0]).toHaveProperty('name', 'Test Server 1');
      expect(response.body.guilds[0]).toHaveProperty('owner', true);
    });

    it('should handle missing Discord token', async () => {
      const response = await request(app)
        .get('/api/discord/servers')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Token Discord requis');
    });

    it('should handle Discord API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Discord API Error'));

      const response = await request(app)
        .get('/api/discord/servers')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-discord-token', 'mock_discord_token')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/discord/servers/:id/channels', () => {
    it('should return server channels', async () => {
      // Mock de la réponse des canaux Discord
      mockedAxios.get.mockResolvedValueOnce({
        data: [
          {
            id: 'channel1',
            name: 'general',
            type: 0, // Canal textuel
            position: 0,
            parent_id: null,
          },
          {
            id: 'channel2',
            name: 'announcements',
            type: 0, // Canal textuel
            position: 1,
            parent_id: 'category1',
          },
          {
            id: 'channel3',
            name: 'voice-channel',
            type: 2, // Canal vocal
            position: 2,
            parent_id: null,
          },
        ]
      });

      const response = await request(app)
        .get('/api/discord/servers/guild1/channels')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-discord-token', 'mock_discord_token')
        .expect(200);

      expect(response.body).toHaveProperty('channels');
      expect(response.body.channels).toHaveLength(2); // Seulement les canaux textuels
      expect(response.body.channels[0]).toHaveProperty('id', 'channel1');
      expect(response.body.channels[0]).toHaveProperty('name', 'general');
      expect(response.body.channels[0]).toHaveProperty('type', 0);
    });

    it('should handle server not found', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Guild not found'));

      const response = await request(app)
        .get('/api/discord/servers/invalid_guild/channels')
        .set('Authorization', `Bearer ${validToken}`)
        .set('x-discord-token', 'mock_discord_token')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/discord/channels/monitor', () => {
    it('should add channel to monitoring', async () => {
      const response = await request(app)
        .post('/api/discord/channels/monitor')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ channelId: 'channel1' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('channelId', 'channel1');
      expect(response.body).toHaveProperty('userId', '123456789');
    });

    it('should handle missing channel ID', async () => {
      const response = await request(app)
        .post('/api/discord/channels/monitor')
        .set('Authorization', `Bearer ${validToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('ID du canal requis');
    });
  });

  describe('DELETE /api/discord/channels/:id/monitor', () => {
    it('should remove channel from monitoring', async () => {
      const response = await request(app)
        .delete('/api/discord/channels/channel1/monitor')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('channelId', 'channel1');
      expect(response.body).toHaveProperty('userId', '123456789');
    });
  });

  describe('GET /api/discord/channels/monitored', () => {
    it('should return monitored channels', async () => {
      const response = await request(app)
        .get('/api/discord/channels/monitored')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('channels');
      expect(Array.isArray(response.body.channels)).toBe(true);
    });
  });
});
