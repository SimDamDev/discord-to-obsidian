import { ServiceMetrics } from '../types/auth';
import { logMetric } from './logger';

export class MetricsCollector {
  private static instance: MetricsCollector;
  
  private connectionCount: number = 0;
  private modeChanges: number = 0;
  private messagesProcessed: number = 0;
  private responseTimes: number[] = [];
  private errorCount: number = 0;
  private totalRequests: number = 0;
  private startTime: number = Date.now();

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  incrementConnectionCount(): void {
    this.connectionCount++;
    logMetric('connection_count', this.connectionCount, { type: 'increment' });
  }

  decrementConnectionCount(): void {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
    logMetric('connection_count', this.connectionCount, { type: 'decrement' });
  }

  incrementModeChanges(): void {
    this.modeChanges++;
    logMetric('mode_changes', this.modeChanges, { type: 'increment' });
  }

  incrementMessagesProcessed(): void {
    this.messagesProcessed++;
    logMetric('messages_processed', this.messagesProcessed, { type: 'increment' });
  }

  recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    
    // Garder seulement les 100 derniers temps de réponse
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }
    
    logMetric('response_time', responseTime, { unit: 'ms' });
  }

  incrementErrorCount(): void {
    this.errorCount++;
    logMetric('error_count', this.errorCount, { type: 'increment' });
  }

  incrementRequestCount(): void {
    this.totalRequests++;
    logMetric('request_count', this.totalRequests, { type: 'increment' });
  }

  getMetrics(): ServiceMetrics {
    const uptime = (Date.now() - this.startTime) / 1000;
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;
    
    const errorRate = this.totalRequests > 0 
      ? (this.errorCount / this.totalRequests) * 100 
      : 0;

    return {
      connectionCount: this.connectionCount,
      modeChanges: this.modeChanges,
      messagesProcessed: this.messagesProcessed,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  reset(): void {
    this.connectionCount = 0;
    this.modeChanges = 0;
    this.messagesProcessed = 0;
    this.responseTimes = [];
    this.errorCount = 0;
    this.totalRequests = 0;
    this.startTime = Date.now();
    
    logMetric('metrics_reset', 1, { timestamp: new Date().toISOString() });
  }

  // Méthodes pour les métriques spécifiques aux services
  recordDiscordBotEvent(event: string, success: boolean): void {
    logMetric('discord_bot_event', success ? 1 : 0, { 
      event, 
      success,
      timestamp: new Date().toISOString()
    });
  }

  recordPollingEvent(event: string, success: boolean, duration?: number): void {
    logMetric('polling_event', success ? 1 : 0, { 
      event, 
      success,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  recordConnectionEvent(event: string, userId?: string): void {
    logMetric('connection_event', 1, { 
      event, 
      userId,
      timestamp: new Date().toISOString()
    });
  }

  recordAuthEvent(event: string, success: boolean, userId?: string): void {
    logMetric('auth_event', success ? 1 : 0, { 
      event, 
      success,
      userId,
      timestamp: new Date().toISOString()
    });
  }
}

// Instance globale
export const metrics = MetricsCollector.getInstance();


