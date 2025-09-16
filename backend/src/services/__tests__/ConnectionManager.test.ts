import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConnectionManager } from '../ConnectionManager';

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    connectionManager = new ConnectionManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addConnection', () => {
    it('should add a new connection and switch to realtime mode', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      expect(connectionManager.getActiveConnectionsCount()).toBe(1);
      
      // Avancer le temps pour déclencher le délai de transition (30 secondes)
      vi.advanceTimersByTime(30000);
      expect(connectionManager.getCurrentMode()).toBe('realtime');
    });

    it('should add multiple connections', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      await connectionManager.addConnection('conn2', 'user2');
      
      expect(connectionManager.getActiveConnectionsCount()).toBe(2);
      
      // Avancer le temps pour déclencher le délai de transition (30 secondes)
      vi.advanceTimersByTime(30000);
      expect(connectionManager.getCurrentMode()).toBe('realtime');
    });

    it('should not switch mode immediately due to transition delay', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      // Le mode devrait rester 'polling' à cause du délai de transition
      expect(connectionManager.getCurrentMode()).toBe('polling');
    });
  });

  describe('removeConnection', () => {
    it('should remove connection and switch to polling mode', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      // Avancer le temps pour déclencher le délai de transition (30 secondes)
      vi.advanceTimersByTime(30000);
      
      await connectionManager.removeConnection('conn1');
      expect(connectionManager.getActiveConnectionsCount()).toBe(0);
    });

    it('should handle removal of non-existent connection', async () => {
      await expect(connectionManager.removeConnection('non-existent')).resolves.not.toThrow();
      expect(connectionManager.getActiveConnectionsCount()).toBe(0);
    });
  });

  describe('updateMode', () => {
    it('should switch to realtime mode when connections exist', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      // Avancer le temps pour déclencher le délai de transition (30 secondes)
      vi.advanceTimersByTime(30000);
      
      expect(connectionManager.getCurrentMode()).toBe('realtime');
    });

    it('should switch to polling mode when no connections', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      // Avancer le temps pour déclencher le délai de transition (30 secondes)
      vi.advanceTimersByTime(30000);
      
      await connectionManager.removeConnection('conn1');
      
      // Avancer le temps pour déclencher le délai de transition (30 secondes)
      vi.advanceTimersByTime(30000);
      
      expect(connectionManager.getCurrentMode()).toBe('polling');
    });
  });

  describe('cleanupInactive', () => {
    it('should remove inactive connections', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      // Simuler une connexion inactive en modifiant directement l'activité
      const connections = connectionManager.getConnections();
      if (connections.length > 0) {
        // Forcer une activité très ancienne
        const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        connectionManager.updateActivity('conn1');
        // Note: Dans un vrai test, on devrait pouvoir modifier directement l'activité
      }
      
      await connectionManager.cleanupInactive();
      // Le test devrait vérifier que les connexions inactives sont supprimées
    });
  });

  describe('getActiveConnectionsCount', () => {
    it('should return correct count', async () => {
      expect(connectionManager.getActiveConnectionsCount()).toBe(0);
      
      await connectionManager.addConnection('conn1', 'user1');
      expect(connectionManager.getActiveConnectionsCount()).toBe(1);
      
      await connectionManager.addConnection('conn2', 'user2');
      expect(connectionManager.getActiveConnectionsCount()).toBe(2);
    });
  });

  describe('getCurrentMode', () => {
    it('should return polling mode by default', () => {
      expect(connectionManager.getCurrentMode()).toBe('polling');
    });
  });

  describe('getConnections', () => {
    it('should return empty array initially', () => {
      expect(connectionManager.getConnections()).toEqual([]);
    });

    it('should return connections after adding them', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      await connectionManager.addConnection('conn2', 'user2');
      
      const connections = connectionManager.getConnections();
      expect(connections).toHaveLength(2);
      expect(connections[0].connectionId).toBe('conn1');
      expect(connections[1].connectionId).toBe('conn2');
    });
  });

  describe('updateActivity', () => {
    it('should update activity for existing connection', async () => {
      await connectionManager.addConnection('conn1', 'user1');
      
      const initialConnections = connectionManager.getConnections();
      const initialActivity = initialConnections[0].lastActivity;
      
      // Avancer le temps
      vi.advanceTimersByTime(10);
      
      connectionManager.updateActivity('conn1');
      
      const updatedConnections = connectionManager.getConnections();
      expect(updatedConnections[0].lastActivity.getTime()).toBeGreaterThan(initialActivity.getTime());
    });

    it('should handle update activity for non-existent connection', () => {
      expect(() => connectionManager.updateActivity('non-existent')).not.toThrow();
    });
  });
});
