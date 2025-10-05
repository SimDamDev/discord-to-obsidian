'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { OnboardingState, UserConfiguration, OnboardingContextType } from '@/types/onboarding';
import { onboardingAnalytics } from '@/services/OnboardingAnalytics';
import { abTestingService } from '@/services/ABTestingService';

// État initial - Flux simplifié (5 étapes)
const initialState: OnboardingState = {
  currentStep: 0,
  isCompleted: false,
  steps: {
    authAndConsent: {
      id: 'authAndConsent',
      title: 'Connexion & Consentement',
      description: 'Connectez-vous avec Discord et acceptez nos conditions',
      completed: false,
    },
    versionChoice: {
      id: 'versionChoice',
      title: 'Choix de Version',
      description: 'Choisissez entre version simplifiée ou confidentialité max',
      completed: false,
    },
    configuration: {
      id: 'configuration',
      title: 'Configuration',
      description: 'Configuration du bot et sélection des serveurs',
      completed: false,
    },
    channelSelection: {
      id: 'channelSelection',
      title: 'Sélection des Canaux',
      description: 'Choisissez les canaux à surveiller',
      completed: false,
    },
    obsidianConfig: {
      id: 'obsidianConfig',
      title: 'Configuration Obsidian',
      description: 'Configurez votre vault Obsidian',
      completed: false,
    },
    finalization: {
      id: 'finalization',
      title: 'Activation & Test',
      description: 'Activez la surveillance et testez le fonctionnement',
      completed: false,
    },
  },
};

// Actions
type OnboardingAction =
  | { type: 'UPDATE_STEP'; stepId: string; data: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; stepIndex: number }
  | { type: 'COMPLETE_ONBOARDING'; config: UserConfiguration }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null };

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'UPDATE_STEP':
      return {
        ...state,
        steps: {
          ...state.steps,
          [action.stepId]: {
            ...state.steps[action.stepId as keyof typeof state.steps],
            completed: true,
            data: action.data,
          },
        },
      };

    case 'NEXT_STEP':
      const newStep = Math.min(state.currentStep + 1, 5);
      console.log('🔄 Reducer NEXT_STEP - étape actuelle:', state.currentStep, '→ nouvelle étape:', newStep);
      return {
        ...state,
        currentStep: newStep, // 6 étapes (0-5)
      };

    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.stepIndex, 4)), // 5 étapes (0-4)
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isCompleted: true,
        steps: {
          ...state.steps,
          finalization: {
            ...state.steps.finalization,
            completed: true,
            data: action.config,
          },
        },
      };

    case 'RESET_ONBOARDING':
      return initialState;

    default:
      return state;
  }
}

// Context
const OnboardingContext = createContext<OnboardingContextType | null>(null);

// Provider
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const [configuration, setConfiguration] = React.useState<UserConfiguration | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initialiser l'A/B testing et les analytics
  useEffect(() => {
    const userId = 'user-' + Math.random().toString(36).substr(2, 9);
    const sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
    
    // Assigner une variante A/B
    const abTestResult = abTestingService.assignVariant(userId, sessionId);
    
    // Démarrer le tracking de l'onboarding
    onboardingAnalytics.startStep(0, 'authAndConsent');
    
    console.log('🧪 A/B Test assigné:', abTestResult.variant);
    console.log('📊 Analytics démarrées pour l\'onboarding');
  }, []);

  // Charger l'état depuis le localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedState = localStorage.getItem('onboarding-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Pour le développement, toujours commencer à l'étape 1
        console.log('🔄 Reset onboarding pour commencer à l\'étape 1');
        dispatch({ type: 'RESET_ONBOARDING' });
        if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding-state');
    }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'état d\'onboarding:', error);
      }
    }
  }, []);

  // Fonction pour sauvegarder en base de données
  const saveToDatabase = async (stepName: string, stepData: any) => {
    try {
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepName,
          stepData
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log(`💾 Données sauvegardées en base pour l'étape ${stepName}:`, result);
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de l'étape ${stepName}:`, error);
    }
  };

  // Sauvegarder l'état dans le localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding-state', JSON.stringify(state));
    }
  }, [state]);

  const updateStep = async (stepId: string, data: any) => {
    dispatch({ type: 'UPDATE_STEP', stepId, data });
    
    // Sauvegarder automatiquement en base de données
    await saveToDatabase(stepId, data);
  };

  const nextStep = () => {
    console.log('🔄 OnboardingProvider - nextStep() appelé, étape actuelle:', state.currentStep);
    
    // Terminer le tracking de l'étape actuelle
    onboardingAnalytics.completeStep(state.currentStep, true);
    
    // Passer à l'étape suivante
    dispatch({ type: 'NEXT_STEP' });
    
    console.log('🔄 OnboardingProvider - dispatch NEXT_STEP envoyé, prochaine étape:', state.currentStep + 1);
    
    // Démarrer le tracking de la nouvelle étape
    const stepIds = ['authAndConsent', 'versionChoice', 'configuration', 'channelSelection', 'obsidianConfig', 'finalization'];
    const nextStepId = stepIds[state.currentStep + 1];
    if (nextStepId) {
      onboardingAnalytics.startStep(state.currentStep + 1, nextStepId);
    }
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const goToStep = (stepIndex: number) => {
    dispatch({ type: 'GO_TO_STEP', stepIndex });
  };

  const completeOnboarding = async (config: UserConfiguration) => {
    setConfiguration(config);
    dispatch({ type: 'COMPLETE_ONBOARDING', config });
    
    // Sauvegarder la configuration finale en base de données
    await saveToDatabase('finalConfiguration', config);
    
    // Terminer le tracking de l'onboarding
    const completionTime = Date.now() - (onboardingAnalytics as any).stepStartTime[0];
    onboardingAnalytics.completeOnboarding();
    abTestingService.markCompleted(completionTime);
    
    // Nettoyer le localStorage
    if (typeof window !== 'undefined') {
      if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding-state');
    }
    }
    
    console.log('🎉 Onboarding complété avec succès!');
    console.log('📊 Métriques envoyées');
  };

  const resetOnboarding = () => {
    setConfiguration(null);
    dispatch({ type: 'RESET_ONBOARDING' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding-state');
    }
  };

  const contextValue: OnboardingContextType = {
    state,
    configuration,
    dispatch,
    updateStep,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    resetOnboarding,
    isLoading,
    error,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
