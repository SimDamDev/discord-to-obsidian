'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { AuthAndConsentStep } from '@/components/onboarding/steps/AuthAndConsentStep';
import { AutoSetupStep } from '@/components/onboarding/steps/AutoSetupStep';
import { ChannelSelectionStep } from '@/components/onboarding/steps/ChannelSelectionStep';
import { ObsidianConfigStep } from '@/components/onboarding/steps/ObsidianConfigStep';
import { FinalizationStep } from '@/components/onboarding/steps/FinalizationStep';

export default function OnboardingPage() {
  const { state, dispatch } = useOnboarding();
  const searchParams = useSearchParams();

  // Gérer les paramètres d'URL
  useEffect(() => {
    const step = searchParams.get('step');
    const error = searchParams.get('error');
    
    if (step) {
      const stepNumber = parseInt(step);
      if (stepNumber >= 0 && stepNumber <= 4) { // 5 étapes (0-4)
        dispatch({ type: 'GO_TO_STEP', stepIndex: stepNumber });
      }
    }
    
    if (error) {
      // Afficher l'erreur (vous pouvez ajouter un système de notification ici)
      console.error('Erreur Discord:', decodeURIComponent(error));
    }
  }, [searchParams, dispatch]);

  // Rendu conditionnel basé sur l'étape actuelle - Flux simplifié
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <AuthAndConsentStep />;
      case 1:
        return <AutoSetupStep />;
      case 2:
        return <ChannelSelectionStep />;
      case 3:
        return <ObsidianConfigStep />;
      case 4:
        return <FinalizationStep />;
      default:
        return <AuthAndConsentStep />;
    }
  };

  return (
    <div>
      {renderCurrentStep()}
    </div>
  );
}
