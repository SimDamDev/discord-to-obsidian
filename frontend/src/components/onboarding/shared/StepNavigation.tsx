'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '../OnboardingProvider';

interface StepNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  nextText?: string;
  previousText?: string;
  showNext?: boolean;
  showPrevious?: boolean;
}

export function StepNavigation({
  onNext,
  onPrevious,
  nextDisabled = false,
  previousDisabled = false,
  nextText = 'Suivant',
  previousText = 'Précédent',
  showNext = true,
  showPrevious = true,
}: StepNavigationProps) {
  const { state, nextStep, previousStep } = useOnboarding();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      previousStep();
    }
  };

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === 5; // 6 étapes (0-5)

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 space-y-4 md:space-y-0">
      {/* Bouton Précédent */}
      <div className="w-full md:w-auto">
        {showPrevious && !isFirstStep && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={previousDisabled}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {previousText}
          </Button>
        )}
      </div>

      {/* Indicateur de progression */}
      <div className="text-center order-first md:order-none">
        <span className="text-sm text-gray-500">
          Étape {state.currentStep + 1} sur 6
        </span>
      </div>

      {/* Bouton Suivant */}
      <div className="w-full md:w-auto">
        {showNext && (
          <Button
            onClick={handleNext}
            disabled={nextDisabled}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            {isLastStep ? 'Terminer' : nextText}
            {!isLastStep && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
