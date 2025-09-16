// Type local pour éviter les problèmes d'import
export interface ActiveConnection {
  connectionId: string;
  userId: string;
  connectedAt: Date;
  lastActivity: Date;
}
import { metrics } from '../utils/metrics';
import { logInfo, logWarning } from '../utils/logger';

export class ConnectionManager {
  private connections: Map<string, ActiveConnection> = new Map();
  private mode: 'realtime' | 'polling' = 'polling';
  private transitionDelay: number = 30000; // 30 secondes
  private transitionTimer?: NodeJS.Timeout;

  async addConnection(connectionId: string, userId: string): Promise<void> {
    const connection: ActiveConnection = {
      connectionId,
      userId,
      connectedAt: new Date(),
      lastActivity: new Date(),
    };

    this.connections.set(connectionId, connection);
    metrics.incrementConnectionCount();
    metrics.recordConnectionEvent('connection_added', userId);
    logInfo('Connexion ajoutée', { connectionId, userId, totalConnections: this.connections.size });
    
    // Si c'est la première connexion, basculer vers le mode temps réel
    if (this.connections.size === 1) {
      await this.updateMode();
    }
  }

  async removeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    this.connections.delete(connectionId);
    metrics.decrementConnectionCount();
    metrics.recordConnectionEvent('connection_removed', connection?.userId);
    logInfo('Connexion supprimée', { connectionId, totalConnections: this.connections.size });
    
    // Si plus de connexions, basculer vers le mode polling
    if (this.connections.size === 0) {
      await this.updateMode();
    }
  }

  async updateMode(): Promise<void> {
    const newMode = this.connections.size > 0 ? 'realtime' : 'polling';
    
    if (newMode !== this.mode) {
      // Délai de transition pour éviter les basculements trop fréquents
      if (this.transitionTimer) {
        clearTimeout(this.transitionTimer);
      }

      this.transitionTimer = setTimeout(() => {
        this.mode = newMode;
        metrics.incrementModeChanges();
        logInfo('Mode basculé', { 
          oldMode: this.mode, 
          newMode, 
          connectionsCount: this.connections.size 
        });
      }, this.transitionDelay);
    }
  }

  async cleanupInactive(): Promise<void> {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [connectionId, connection] of this.connections.entries()) {
      if (now.getTime() - connection.lastActivity.getTime() > inactiveThreshold) {
        await this.removeConnection(connectionId);
      }
    }
  }

  getActiveConnectionsCount(): number {
    return this.connections.size;
  }

  getCurrentMode(): 'realtime' | 'polling' {
    return this.mode;
  }

  getConnections(): ActiveConnection[] {
    return Array.from(this.connections.values());
  }

  updateActivity(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastActivity = new Date();
    }
  }
}
