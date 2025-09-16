'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { OnboardingState, UserConfiguration, OnboardingContextType } from '@/types/onboarding';

// État initial
const initialState: OnboardingState = {
  currentStep: 0,
  isCompleted: false,
  steps: {
    discordAuth: {
      id: 'discordAuth',
      title: 'Connexion Discord',
      description: 'Connectez-vous avec votre compte Discord',
      completed: false,
    },
    privacyPolicy: {
      id: 'privacyPolicy',
      title: 'Politique de Confidentialité',
      description: 'Transparence sur l\'utilisation de vos données',
      completed: false,
    },
    consent: {
      id: 'consent',
      title: 'Consentement RGPD',
      description: 'Choisissez quelles données vous acceptez de partager',
      completed: false,
    },
    botCreation: {
      id: 'botCreation',
      title: 'Configuration du Bot',
      description: 'Configurez l\'accès au bot principal',
      completed: false,
    },
    serverSelection: {
      id: 'serverSelection',
      title: 'Sélection des Serveurs',
      description: 'Choisissez les serveurs à surveiller',
      completed: false,
    },
    channelSelection: {
      id: 'channelSelection',
      title: 'Sélection des Canaux',
      description: 'Sélectionnez les canaux spécifiques',
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
      title: 'Finalisation',
      description: 'Activez la surveillance',
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
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
      };

    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.stepIndex, 5)),
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

  // Charger l'état depuis le localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('onboarding-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Pour le développement, toujours commencer à l'étape 1
        console.log('🔄 Reset onboarding pour commencer à l\'étape 1');
        dispatch({ type: 'RESET_ONBOARDING' });
        localStorage.removeItem('onboarding-state');
      } catch (error) {
        console.error('Erreur lors du chargement de l\'état d\'onboarding:', error);
      }
    }
  }, []);

  // Sauvegarder l'état dans le localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-state', JSON.stringify(state));
  }, [state]);

  const updateStep = (stepId: string, data: any) => {
    dispatch({ type: 'UPDATE_STEP', stepId, data });
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const goToStep = (stepIndex: number) => {
    dispatch({ type: 'GO_TO_STEP', stepIndex });
  };

  const completeOnboarding = (config: UserConfiguration) => {
    setConfiguration(config);
    dispatch({ type: 'COMPLETE_ONBOARDING', config });
    // Nettoyer le localStorage
    localStorage.removeItem('onboarding-state');
  };

  const resetOnboarding = () => {
    setConfiguration(null);
    dispatch({ type: 'RESET_ONBOARDING' });
    localStorage.removeItem('onboarding-state');
  };

  const contextValue: OnboardingContextType = {
    state,
    configuration,
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
