/**
 * Service d'A/B Testing pour l'onboarding
 * Permet de comparer l'ancien flux (8 étapes) vs le nouveau flux optimisé (5 étapes)
 */

export interface ABTestConfig {
  testName: string;
  variants: {
    control: {
      name: string;
      weight: number;
      config: any;
    };
    treatment: {
      name: string;
      weight: number;
      config: any;
    };
  };
  isActive: boolean;
  startDate: string;
  endDate: string;
  targetAudience?: string[];
}

export interface ABTestResult {
  variant: 'control' | 'treatment';
  userId: string;
  sessionId: string;
  assignedAt: number;
  completed: boolean;
  completionTime?: number;
  abandonedAt?: number;
  abandonmentReason?: string;
}

class ABTestingService {
  private currentTest: ABTestResult | null = null;
  private testConfig: ABTestConfig;

  constructor() {
    this.testConfig = {
      testName: 'onboarding_flow_optimization',
      variants: {
        control: {
          name: 'Ancien Flux (8 étapes)',
          weight: 50, // 50% des utilisateurs
          config: {
            steps: 8,
            flow: 'original',
            features: {
              separatePrivacyConsent: true,
              manualBotCreation: true,
              manualServerSelection: true,
            }
          }
        },
        treatment: {
          name: 'Nouveau Flux Optimisé (5 étapes)',
          weight: 50, // 50% des utilisateurs
          config: {
            steps: 5,
            flow: 'optimized',
            features: {
              mergedAuthConsent: true,
              autoBotSetup: true,
              autoServerDetection: true,
              mobileOptimized: true,
              contextualHelp: true,
            }
          }
        }
      },
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
    };
  }

  /**
   * Assigner un utilisateur à une variante
   */
  assignVariant(userId: string, sessionId: string): ABTestResult {
    // Vérifier si l'utilisateur est déjà assigné
    const existingAssignment = this.getExistingAssignment(userId);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Générer un hash basé sur l'userId pour une assignation déterministe
    const hash = this.hashString(userId);
    const randomValue = hash % 100;

    // Déterminer la variante basée sur le poids
    let variant: 'control' | 'treatment';
    if (randomValue < this.testConfig.variants.control.weight) {
      variant = 'control';
    } else {
      variant = 'treatment';
    }

    const result: ABTestResult = {
      variant,
      userId,
      sessionId,
      assignedAt: Date.now(),
      completed: false,
    };

    // Sauvegarder l'assignation
    this.saveAssignment(result);
    this.currentTest = result;

    // Envoyer l'événement d'assignation
    this.trackAssignment(result);

    return result;
  }

  /**
   * Obtenir la configuration de la variante actuelle
   */
  getCurrentVariantConfig(): any {
    if (!this.currentTest) {
      return this.testConfig.variants.treatment.config; // Par défaut, nouveau flux
    }

    return this.testConfig.variants[this.currentTest.variant].config;
  }

  /**
   * Vérifier si l'utilisateur utilise le nouveau flux optimisé
   */
  isUsingOptimizedFlow(): boolean {
    return this.currentTest?.variant === 'treatment';
  }

  /**
   * Marquer l'onboarding comme complété
   */
  markCompleted(completionTime: number): void {
    if (!this.currentTest) return;

    this.currentTest.completed = true;
    this.currentTest.completionTime = completionTime;

    this.updateAssignment(this.currentTest);
    this.trackCompletion(this.currentTest);
  }

  /**
   * Marquer l'onboarding comme abandonné
   */
  markAbandoned(abandonmentReason: string): void {
    if (!this.currentTest) return;

    this.currentTest.abandonedAt = Date.now();
    this.currentTest.abandonmentReason = abandonmentReason;

    this.updateAssignment(this.currentTest);
    this.trackAbandonment(this.currentTest);
  }

  /**
   * Obtenir les statistiques du test A/B
   */
  getTestStatistics(): any {
    // En production, récupérer depuis votre base de données
    return {
      totalUsers: 0,
      controlUsers: 0,
      treatmentUsers: 0,
      controlCompletionRate: 0,
      treatmentCompletionRate: 0,
      controlAverageTime: 0,
      treatmentAverageTime: 0,
      statisticalSignificance: 0,
    };
  }

  /**
   * Générer un hash simple pour l'assignation déterministe
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Récupérer une assignation existante
   */
  private getExistingAssignment(userId: string): ABTestResult | null {
    const key = `ab_test_${this.testConfig.testName}_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'assignation A/B:', error);
      }
    }
    
    return null;
  }

  /**
   * Sauvegarder une assignation
   */
  private saveAssignment(result: ABTestResult): void {
    const key = `ab_test_${this.testConfig.testName}_${result.userId}`;
    localStorage.setItem(key, JSON.stringify(result));
  }

  /**
   * Mettre à jour une assignation
   */
  private updateAssignment(result: ABTestResult): void {
    this.saveAssignment(result);
  }

  /**
   * Envoyer l'événement d'assignation
   */
  private trackAssignment(result: ABTestResult): void {
    this.trackEvent('ab_test_assigned', {
      test_name: this.testConfig.testName,
      variant: result.variant,
      user_id: result.userId,
      session_id: result.sessionId,
      timestamp: result.assignedAt,
    });
  }

  /**
   * Envoyer l'événement de completion
   */
  private trackCompletion(result: ABTestResult): void {
    this.trackEvent('ab_test_completed', {
      test_name: this.testConfig.testName,
      variant: result.variant,
      user_id: result.userId,
      session_id: result.sessionId,
      completion_time: result.completionTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Envoyer l'événement d'abandon
   */
  private trackAbandonment(result: ABTestResult): void {
    this.trackEvent('ab_test_abandoned', {
      test_name: this.testConfig.testName,
      variant: result.variant,
      user_id: result.userId,
      session_id: result.sessionId,
      abandonment_reason: result.abandonmentReason,
      timestamp: result.abandonedAt,
    });
  }

  /**
   * Envoyer un événement de tracking
   */
  private trackEvent(eventName: string, properties: Record<string, any>): void {
    console.log(`[A/B Test] ${eventName}:`, properties);
    
    // Envoyer vers votre service d'analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
    
    // Envoyer vers votre API
    fetch('/api/analytics/ab-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: Date.now(),
      }),
    }).catch(error => {
      console.error('Erreur lors de l\'envoi de l\'événement A/B:', error);
    });
  }
}

// Instance singleton
export const abTestingService = new ABTestingService();

// Hook React pour utiliser l'A/B testing
export const useABTesting = () => {
  return abTestingService;
};
