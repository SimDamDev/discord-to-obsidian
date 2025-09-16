import { DiscordChannel } from '@/types/auth';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ChannelCacheConfig {
  defaultTTL: number; // 15 minutes par défaut
  maxSize: number; // 100 entrées max
}

class ChannelCacheService {
  private static instance: ChannelCacheService;
  private cache = new Map<string, CacheEntry<DiscordChannel[]>>();
  private config: ChannelCacheConfig = {
    defaultTTL: 15 * 60 * 1000, // 15 minutes
    maxSize: 100,
  };

  private constructor() {
    // Nettoyer le cache périodiquement
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // Toutes les 5 minutes
  }

  static getInstance(): ChannelCacheService {
    if (!ChannelCacheService.instance) {
      ChannelCacheService.instance = new ChannelCacheService();
    }
    return ChannelCacheService.instance;
  }

  /**
   * Récupère les canaux depuis le cache
   */
  get(serverId: string): DiscordChannel[] | null {
    const entry = this.cache.get(serverId);
    
    if (!entry) {
      return null;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(serverId);
      return null;
    }

    return entry.data;
  }

  /**
   * Met en cache les canaux d'un serveur
   */
  set(serverId: string, channels: DiscordChannel[], ttl?: number): void {
    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<DiscordChannel[]> = {
      data: channels,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    };

    this.cache.set(serverId, entry);
  }

  /**
   * Supprime une entrée du cache
   */
  delete(serverId: string): void {
    this.cache.delete(serverId);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Vérifie si une entrée existe et est valide
   */
  has(serverId: string): boolean {
    const entry = this.cache.get(serverId);
    
    if (!entry) {
      return false;
    }

    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(serverId);
      return false;
    }

    return true;
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: this.calculateHitRate(),
    };
  }

  /**
   * Nettoie les entrées expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cache nettoyé: ${expiredKeys.length} entrées expirées supprimées`);
    }
  }

  /**
   * Supprime l'entrée la plus ancienne
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Cache éviction: entrée la plus ancienne supprimée (${oldestKey})`);
    }
  }

  /**
   * Calcule le taux de succès du cache (simplifié)
   */
  private calculateHitRate(): number {
    // Dans une implémentation complète, on trackerait les hits/misses
    // Pour l'instant, on retourne une estimation basée sur la taille du cache
    return Math.min(this.cache.size / this.config.maxSize, 1);
  }
}

export default ChannelCacheService;
