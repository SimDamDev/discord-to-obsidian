// Configuration globale pour les tests Vitest
import dotenv from 'dotenv';
import { vi } from 'vitest';

// Charger les variables d'environnement pour les tests
dotenv.config();

// Variables d'environnement par défaut pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DISCORD_CLIENT_ID = 'test-client-id';
process.env.DISCORD_CLIENT_SECRET = 'test-client-secret';
process.env.DISCORD_BOT_TOKEN = 'test-bot-token';
process.env.DISCORD_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/discord';
process.env.POLLING_INTERVAL = '1000';
process.env.TRANSITION_DELAY = '100';
process.env.BATCH_SIZE = '10';
process.env.RETRY_ATTEMPTS = '1';
process.env.LOG_LEVEL = 'error';

// Mock des logs pour éviter le spam dans les tests
vi.mock('../utils/logger', () => ({
  logInfo: vi.fn(),
  logWarning: vi.fn(),
  logError: vi.fn(),
  logDebug: vi.fn(),
  logMetric: vi.fn(),
  logAudit: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  metricsLogger: {
    info: vi.fn(),
  },
  auditLogger: {
    info: vi.fn(),
  },
}));

// Mock des métriques
vi.mock('../utils/metrics', () => ({
  metrics: {
    incrementConnectionCount: vi.fn(),
    decrementConnectionCount: vi.fn(),
    incrementModeChanges: vi.fn(),
    incrementMessagesProcessed: vi.fn(),
    recordResponseTime: vi.fn(),
    incrementErrorCount: vi.fn(),
    incrementRequestCount: vi.fn(),
    recordDiscordBotEvent: vi.fn(),
    recordPollingEvent: vi.fn(),
    recordConnectionEvent: vi.fn(),
    recordAuthEvent: vi.fn(),
    getMetrics: vi.fn(() => ({
      connectionCount: 0,
      modeChanges: 0,
      messagesProcessed: 0,
      averageResponseTime: 0,
      errorRate: 0,
    })),
  },
}));
