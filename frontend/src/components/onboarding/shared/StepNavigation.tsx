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
  const isLastStep = state.currentStep === 5;

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      {/* Bouton Précédent */}
      <div>
        {showPrevious && !isFirstStep && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={previousDisabled}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {previousText}
          </Button>
        )}
      </div>

      {/* Indicateur de progression */}
      <div className="text-center">
        <span className="text-sm text-gray-500">
          Étape {state.currentStep + 1} sur 6
        </span>
      </div>

      {/* Bouton Suivant */}
      <div>
        {showNext && (
          <Button
            onClick={handleNext}
            disabled={nextDisabled}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
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
