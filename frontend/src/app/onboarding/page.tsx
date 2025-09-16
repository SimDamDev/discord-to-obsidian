'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { DiscordAuthStep } from '@/components/onboarding/steps/DiscordAuthStep';
import { PrivacyPolicyStep } from '@/components/onboarding/steps/PrivacyPolicyStep';
import { ConsentStep } from '@/components/onboarding/steps/ConsentStep';
import { BotCreationStep } from '@/components/onboarding/steps/BotCreationStep';
import { ServerSelectionStep } from '@/components/onboarding/steps/ServerSelectionStep';
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
      if (stepNumber >= 0 && stepNumber <= 7) {
        dispatch({ type: 'SET_STEP', payload: stepNumber });
      }
    }
    
    if (error) {
      // Afficher l'erreur (vous pouvez ajouter un système de notification ici)
      console.error('Erreur Discord:', decodeURIComponent(error));
    }
  }, [searchParams, dispatch]);

  // Rendu conditionnel basé sur l'étape actuelle
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <DiscordAuthStep />;
      case 1:
        return <PrivacyPolicyStep />;
      case 2:
        return <ConsentStep />;
      case 3:
        return <BotCreationStep />;
      case 4:
        return <ServerSelectionStep />;
      case 5:
        return <ChannelSelectionStep />;
      case 6:
        return <ObsidianConfigStep />;
      case 7:
        return <FinalizationStep />;
      default:
        return <DiscordAuthStep />;
    }
  };

  return (
    <div>
      {renderCurrentStep()}
    </div>
  );
}
