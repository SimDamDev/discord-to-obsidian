/**
 * Service de monitoring des métriques d'onboarding
 * Suit les performances et les points de friction du nouveau flux optimisé
 */

export interface OnboardingMetrics {
  // Métriques de progression
  stepStartTime: Record<number, number>;
  stepCompletionTime: Record<number, number>;
  totalOnboardingTime: number;
  
  // Métriques d'abandon
  abandonmentPoints: Record<number, number>;
  abandonmentReasons: Record<string, number>;
  
  // Métriques de succès
  completionRate: number;
  successRate: number;
  
  // Métriques d'erreur
  errorCount: Record<string, number>;
  retryCount: Record<number, number>;
  
  // Métriques utilisateur
  userType: 'technical' | 'non-technical' | 'unknown';
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browserType: string;
}

export interface StepMetrics {
  stepId: string;
  stepNumber: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  errors: string[];
  retries: number;
  completed: boolean;
  abandoned: boolean;
}

class OnboardingAnalytics {
  private metrics: OnboardingMetrics;
  private currentStep: number = 0;
  private stepStartTime: number = Date.now();
  private stepMetrics: StepMetrics[] = [];

  constructor() {
    this.metrics = {
      stepStartTime: {},
      stepCompletionTime: {},
      totalOnboardingTime: 0,
      abandonmentPoints: {},
      abandonmentReasons: {},
      completionRate: 0,
      successRate: 0,
      errorCount: {},
      retryCount: {},
      userType: 'unknown',
      deviceType: this.detectDeviceType(),
      browserType: this.detectBrowser(),
    };
  }

  /**
   * Démarrer le tracking d'une étape
   */
  startStep(stepNumber: number, stepId: string): void {
    this.currentStep = stepNumber;
    this.stepStartTime = Date.now();
    
    this.metrics.stepStartTime[stepNumber] = this.stepStartTime;
    
    // Créer un nouveau StepMetrics
    const stepMetric: StepMetrics = {
      stepId,
      stepNumber,
      startTime: this.stepStartTime,
      errors: [],
      retries: 0,
      completed: false,
      abandoned: false,
    };
    
    this.stepMetrics.push(stepMetric);
    
    // Envoyer l'événement de début d'étape
    this.trackEvent('step_started', {
      step_number: stepNumber,
      step_id: stepId,
      timestamp: this.stepStartTime,
    });
  }

  /**
   * Terminer le tracking d'une étape
   */
  completeStep(stepNumber: number, success: boolean = true): void {
    const endTime = Date.now();
    const duration = endTime - this.stepStartTime;
    
    this.metrics.stepCompletionTime[stepNumber] = endTime;
    
    // Mettre à jour le StepMetrics
    const stepMetric = this.stepMetrics.find(s => s.stepNumber === stepNumber);
    if (stepMetric) {
      stepMetric.endTime = endTime;
      stepMetric.duration = duration;
      stepMetric.completed = success;
    }
    
    // Envoyer l'événement de fin d'étape
    this.trackEvent('step_completed', {
      step_number: stepNumber,
      duration,
      success,
      timestamp: endTime,
    });
  }

  /**
   * Enregistrer un abandon d'étape
   */
  recordAbandonment(stepNumber: number, reason: string): void {
    this.metrics.abandonmentPoints[stepNumber] = (this.metrics.abandonmentPoints[stepNumber] || 0) + 1;
    this.metrics.abandonmentReasons[reason] = (this.metrics.abandonmentReasons[reason] || 0) + 1;
    
    // Mettre à jour le StepMetrics
    const stepMetric = this.stepMetrics.find(s => s.stepNumber === stepNumber);
    if (stepMetric) {
      stepMetric.abandoned = true;
    }
    
    // Envoyer l'événement d'abandon
    this.trackEvent('step_abandoned', {
      step_number: stepNumber,
      reason,
      timestamp: Date.now(),
    });
  }

  /**
   * Enregistrer une erreur
   */
  recordError(stepNumber: number, errorType: string, errorMessage: string): void {
    this.metrics.errorCount[errorType] = (this.metrics.errorCount[errorType] || 0) + 1;
    
    // Mettre à jour le StepMetrics
    const stepMetric = this.stepMetrics.find(s => s.stepNumber === stepNumber);
    if (stepMetric) {
      stepMetric.errors.push(errorMessage);
    }
    
    // Envoyer l'événement d'erreur
    this.trackEvent('step_error', {
      step_number: stepNumber,
      error_type: errorType,
      error_message: errorMessage,
      timestamp: Date.now(),
    });
  }

  /**
   * Enregistrer un retry
   */
  recordRetry(stepNumber: number): void {
    this.metrics.retryCount[stepNumber] = (this.metrics.retryCount[stepNumber] || 0) + 1;
    
    // Mettre à jour le StepMetrics
    const stepMetric = this.stepMetrics.find(s => s.stepNumber === stepNumber);
    if (stepMetric) {
      stepMetric.retries++;
    }
    
    // Envoyer l'événement de retry
    this.trackEvent('step_retry', {
      step_number: stepNumber,
      retry_count: this.metrics.retryCount[stepNumber],
      timestamp: Date.now(),
    });
  }

  /**
   * Terminer l'onboarding avec succès
   */
  completeOnboarding(): void {
    const endTime = Date.now();
    this.metrics.totalOnboardingTime = endTime - this.metrics.stepStartTime[0];
    this.metrics.completionRate = 1;
    this.metrics.successRate = 1;
    
    // Envoyer l'événement de completion
    this.trackEvent('onboarding_completed', {
      total_duration: this.metrics.totalOnboardingTime,
      steps_completed: this.stepMetrics.filter(s => s.completed).length,
      total_errors: Object.values(this.metrics.errorCount).reduce((a, b) => a + b, 0),
      timestamp: endTime,
    });
    
    // Envoyer les métriques complètes
    this.sendMetrics();
  }

  /**
   * Obtenir les métriques actuelles
   */
  getMetrics(): OnboardingMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtenir les métriques d'étape
   */
  getStepMetrics(): StepMetrics[] {
    return [...this.stepMetrics];
  }

  /**
   * Détecter le type d'appareil
   */
  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Détecter le navigateur
   */
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Envoyer un événement de tracking
   */
  private trackEvent(eventName: string, properties: Record<string, any>): void {
    // En production, envoyer vers votre service d'analytics
    console.log(`[Analytics] ${eventName}:`, properties);
    
    // Exemple d'intégration avec Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, properties);
    }
    
    // Exemple d'intégration avec Mixpanel
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track(eventName, properties);
    }
  }

  /**
   * Envoyer les métriques complètes
   */
  private sendMetrics(): void {
    const metricsData = {
      ...this.metrics,
      stepMetrics: this.stepMetrics,
      timestamp: Date.now(),
    };
    
    // Envoyer vers votre API de métriques
    fetch('/api/analytics/onboarding-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricsData),
    }).catch(error => {
      console.error('Erreur lors de l\'envoi des métriques:', error);
    });
  }
}

// Instance singleton
export const onboardingAnalytics = new OnboardingAnalytics();

// Hook React pour utiliser les analytics
export const useOnboardingAnalytics = () => {
  return onboardingAnalytics;
};
