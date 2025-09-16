interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class DiscordCacheService {
  private static instance: DiscordCacheService;
  private cache: Map<string, CachedData<any>> = new Map();
  private readonly DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes

  static getInstance(): DiscordCacheService {
    if (!DiscordCacheService.instance) {
      DiscordCacheService.instance = new DiscordCacheService();
    }
    return DiscordCacheService.instance;
  }

  // Stocker des données dans le cache
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });

    console.log(`💾 Données mises en cache: ${key} (expire dans ${ttl}ms)`);
  }

  // Récupérer des données du cache
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }

    const now = Date.now();
    if (now > cached.expiresAt) {
      console.log(`⏰ Cache expiré: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`✅ Memory cache hit: ${key} (âge: ${now - cached.timestamp}ms)`);
    return cached.data;
  }

  // Vérifier si une clé existe et n'est pas expirée
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    if (now > cached.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Supprimer une clé du cache
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`🗑️ Cache supprimé: ${key}`);
  }

  // Nettoyer le cache expiré
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache nettoyé: ${cleaned} entrées expirées supprimées`);
    }
  }

  // Obtenir le statut du cache
  getStatus() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, cached]) => ({
      key,
      age: now - cached.timestamp,
      expiresIn: Math.max(0, cached.expiresAt - now),
      isExpired: now > cached.expiresAt
    }));

    return {
      totalEntries: this.cache.size,
      validEntries: entries.filter(e => !e.isExpired).length,
      expiredEntries: entries.filter(e => e.isExpired).length,
      entries
    };
  }

  // Clés de cache spécifiques
  static getServersKey(userId: string): string {
    return `servers:${userId}`;
  }

  static getChannelsKey(serverId: string): string {
    return `channels:${serverId}`;
  }

  static getServerKey(serverId: string): string {
    return `server:${serverId}`;
  }
}

export default DiscordCacheService;