interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  timestamp: number;
  retryCount: number;
}

class ChannelErrorService {
  private static instance: ChannelErrorService;
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 seconde
    maxDelay: 10000, // 10 secondes
    backoffMultiplier: 2,
  };
  private errorHistory: Map<string, ErrorInfo[]> = new Map();

  private constructor() {}

  static getInstance(): ChannelErrorService {
    if (!ChannelErrorService.instance) {
      ChannelErrorService.instance = new ChannelErrorService();
    }
    return ChannelErrorService.instance;
  }

  /**
   * Exécute une fonction avec retry automatique
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Succès - nettoyer l'historique d'erreurs
        this.clearErrorHistory(operationId);
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Enregistrer l'erreur
        this.recordError(operationId, {
          message: lastError.message,
          code: this.extractErrorCode(lastError),
          status: this.extractStatusCode(lastError),
          timestamp: Date.now(),
          retryCount: attempt,
        });

        // Si c'est la dernière tentative, ne pas attendre
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculer le délai d'attente avec backoff exponentiel
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        console.warn(
          `⚠️ Tentative ${attempt}/${config.maxAttempts} échouée pour ${operationId}. ` +
          `Nouvelle tentative dans ${delay}ms. Erreur: ${lastError.message}`
        );

        await this.sleep(delay);
      }
    }

    // Toutes les tentatives ont échoué
    throw new Error(
      `Échec après ${config.maxAttempts} tentatives pour ${operationId}: ${lastError?.message}`
    );
  }

  /**
   * Détermine si une erreur est récupérable
   */
  isRecoverableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Erreurs récupérables
    const recoverablePatterns = [
      'network error',
      'timeout',
      'connection refused',
      'temporary failure',
      'rate limit',
      'server error',
      'bad gateway',
      'service unavailable',
    ];

    // Erreurs non récupérables
    const nonRecoverablePatterns = [
      'unauthorized',
      'forbidden',
      'not found',
      'invalid token',
      'permission denied',
    ];

    // Vérifier les erreurs non récupérables en premier
    if (nonRecoverablePatterns.some(pattern => message.includes(pattern))) {
      return false;
    }

    // Vérifier les erreurs récupérables
    return recoverablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Obtient un message d'erreur convivial pour l'utilisateur
   */
  getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes('unauthorized') || message.includes('invalid token')) {
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    }

    if (message.includes('forbidden') || message.includes('permission denied')) {
      return 'Vous n\'avez pas les permissions nécessaires pour accéder à ce serveur.';
    }

    if (message.includes('not found')) {
      return 'Le serveur ou le canal demandé n\'existe pas.';
    }

    if (message.includes('rate limit')) {
      return 'Trop de requêtes. Veuillez patienter quelques instants.';
    }

    if (message.includes('network') || message.includes('timeout')) {
      return 'Problème de connexion. Vérifiez votre connexion internet.';
    }

    if (message.includes('server error')) {
      return 'Erreur temporaire du serveur. Veuillez réessayer.';
    }

    return 'Une erreur inattendue s\'est produite. Veuillez réessayer.';
  }

  /**
   * Obtient l'historique des erreurs pour une opération
   */
  getErrorHistory(operationId: string): ErrorInfo[] {
    return this.errorHistory.get(operationId) || [];
  }

  /**
   * Obtient les statistiques d'erreurs
   */
  getErrorStats() {
    const stats = {
      totalOperations: this.errorHistory.size,
      operationsWithErrors: 0,
      totalErrors: 0,
      recentErrors: 0,
    };

    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const errors of this.errorHistory.values()) {
      if (errors.length > 0) {
        stats.operationsWithErrors++;
        stats.totalErrors += errors.length;
        stats.recentErrors += errors.filter(e => e.timestamp > oneHourAgo).length;
      }
    }

    return stats;
  }

  /**
   * Enregistre une erreur
   */
  private recordError(operationId: string, errorInfo: ErrorInfo): void {
    if (!this.errorHistory.has(operationId)) {
      this.errorHistory.set(operationId, []);
    }

    const errors = this.errorHistory.get(operationId)!;
    errors.push(errorInfo);

    // Garder seulement les 10 dernières erreurs par opération
    if (errors.length > 10) {
      errors.splice(0, errors.length - 10);
    }
  }

  /**
   * Nettoie l'historique d'erreurs pour une opération
   */
  private clearErrorHistory(operationId: string): void {
    this.errorHistory.delete(operationId);
  }

  /**
   * Extrait le code d'erreur d'un objet Error
   */
  private extractErrorCode(error: Error): string | undefined {
    if ('code' in error) {
      return (error as any).code;
    }
    return undefined;
  }

  /**
   * Extrait le code de statut HTTP d'un objet Error
   */
  private extractStatusCode(error: Error): number | undefined {
    if ('status' in error) {
      return (error as any).status;
    }
    if ('response' in error && (error as any).response?.status) {
      return (error as any).response.status;
    }
    return undefined;
  }

  /**
   * Utilitaire pour attendre un délai
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ChannelErrorService;
