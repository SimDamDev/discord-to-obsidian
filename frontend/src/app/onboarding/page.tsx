'use client';

// Désactiver le prerendering pour cette page qui utilise des APIs client
export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { AuthAndConsentStep } from '@/components/onboarding/steps/AuthAndConsentStep';
import { VersionChoiceStep } from '@/components/onboarding/steps/VersionChoiceStep';
import { ConfigurationStep } from '@/components/onboarding/steps/ConfigurationStep';
import { ChannelSelectionStep } from '@/components/onboarding/steps/ChannelSelectionStep';
import { ObsidianConfigStep } from '@/components/onboarding/steps/ObsidianConfigStep';
import { FinalizationStep } from '@/components/onboarding/steps/FinalizationStep';

export default function OnboardingPage() {
  const { state, dispatch } = useOnboarding();
  const router = useRouter();

  // Gérer les paramètres d'URL côté client uniquement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');
    const error = urlParams.get('error');
    
    if (step) {
      const stepNumber = parseInt(step);
      if (stepNumber >= 0 && stepNumber <= 5) {
        dispatch({ type: 'SET_STEP', payload: stepNumber });
      }
    }
    
    if (error) {
      dispatch({ type: 'SET_ERROR', payload: decodeURIComponent(error) });
    }
  }, [dispatch]);

  const renderCurrentStep = () => {
    console.log('📱 OnboardingPage - Rendu étape:', state.currentStep);
    switch (state.currentStep) {
      case 0:
        return <AuthAndConsentStep />;
      case 1:
        return <VersionChoiceStep />;
      case 2:
        return <ConfigurationStep />;
      case 3:
        return <ChannelSelectionStep />;
      case 4:
        return <ObsidianConfigStep />;
      case 5:
        return <FinalizationStep />;
      default:
        return <AuthAndConsentStep />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      {renderCurrentStep()}
    </div>
  );
}
