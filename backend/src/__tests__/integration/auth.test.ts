import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

// Mock des appels externes
import axios from 'axios';
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
      expect(response.body.authUrl).toContain('discord.com/oauth2/authorize');
      expect(response.body.authUrl).toContain('client_id=');
      expect(response.body.authUrl).toContain('scope=identify%20email%20guilds');
    });
  });

  describe('POST /api/auth/discord/callback', () => {
    it('should handle Discord callback and create user', async () => {
      // Mock de la réponse du token Discord
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          token_type: 'Bearer',
          expires_in: 604800,
        }
      });

      // Mock de la réponse des informations utilisateur Discord
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          id: '123456789',
          username: 'testuser',
          global_name: 'Test User',
          avatar: 'avatar_hash',
          email: 'test@example.com',
          verified: true,
        }
      });

      const response = await request(app)
        .post('/api/auth/discord/callback')
        .send({ code: 'mock_auth_code' })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      expect(response.body.user.discordId).toBe('123456789');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should handle missing authorization code', async () => {
      const response = await request(app)
        .post('/api/auth/discord/callback')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Code d\'autorisation requis');
    });

    it('should handle Discord API errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Discord API Error'));

      const response = await request(app)
        .post('/api/auth/discord/callback')
        .send({ code: 'invalid_code' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
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
