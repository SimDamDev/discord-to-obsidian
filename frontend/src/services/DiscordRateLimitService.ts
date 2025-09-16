interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

class DiscordRateLimitService {
  private static instance: DiscordRateLimitService;
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  static getInstance(): DiscordRateLimitService {
    if (!DiscordRateLimitService.instance) {
      DiscordRateLimitService.instance = new DiscordRateLimitService();
    }
    return DiscordRateLimitService.instance;
  }

  // Mettre à jour les informations de rate limit depuis les headers Discord
  updateRateLimit(endpoint: string, headers: any) {
    const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
    const resetTime = parseInt(headers['x-ratelimit-reset'] || '0') * 1000;
    const limit = parseInt(headers['x-ratelimit-limit'] || '50');

    this.rateLimits.set(endpoint, {
      remaining,
      resetTime,
      limit
    });

    console.log(`📊 Rate limit mis à jour pour ${endpoint}:`, {
      remaining,
      limit,
      resetIn: Math.max(0, resetTime - Date.now())
    });
  }

  // Vérifier si on peut faire un appel
  canMakeRequest(endpoint: string): boolean {
    const rateLimit = this.rateLimits.get(endpoint);
    if (!rateLimit) return true;

    const now = Date.now();
    if (now >= rateLimit.resetTime) {
      // Reset time passé, on peut refaire des appels
      this.rateLimits.delete(endpoint);
      return true;
    }

    return rateLimit.remaining > 0;
  }

  // Obtenir le temps d'attente avant le prochain appel possible
  getWaitTime(endpoint: string): number {
    const rateLimit = this.rateLimits.get(endpoint);
    if (!rateLimit) return 0;

    const now = Date.now();
    if (now >= rateLimit.resetTime) return 0;

    return Math.max(0, rateLimit.resetTime - now);
  }

  // Ajouter une requête à la queue
  async queueRequest<T>(endpoint: string, requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Attendre si nécessaire
          const waitTime = this.getWaitTime(endpoint);
          if (waitTime > 0) {
            console.log(`⏳ Attente de ${waitTime}ms avant l'appel à ${endpoint}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }

          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  // Traiter la queue
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Erreur dans la queue:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  // Obtenir le statut de la queue
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      rateLimits: Object.fromEntries(this.rateLimits)
    };
  }
}

export default DiscordRateLimitService;

