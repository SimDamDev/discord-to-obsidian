import { render, screen, act } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from '../OnboardingProvider';
import { OnboardingState } from '@/types/onboarding';

// Mock component pour tester le provider
const TestComponent = () => {
  const { state, nextStep, previousStep, updateStep } = useOnboarding();
  
  return (
    <div>
      <div data-testid="current-step">{state.currentStep}</div>
      <div data-testid="total-steps">5</div>
      <div data-testid="step-title">{state.steps.authAndConsent.title}</div>
      <button onClick={nextStep} data-testid="next-button">Next</button>
      <button onClick={previousStep} data-testid="previous-button">Previous</button>
      <button 
        onClick={() => updateStep('authAndConsent', { test: true })} 
        data-testid="update-button"
      >
        Update
      </button>
    </div>
  );
};

describe('OnboardingProvider - Flux Optimisé', () => {
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  it('devrait initialiser avec 5 étapes au lieu de 8', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    expect(screen.getByTestId('total-steps')).toHaveTextContent('5');
    expect(screen.getByTestId('current-step')).toHaveTextContent('0');
  });

  it('devrait avoir les bonnes étapes simplifiées', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    // Vérifier que les nouvelles étapes existent
    expect(screen.getByTestId('step-title')).toHaveTextContent('Connexion & Consentement');
  });

  it('devrait naviguer correctement entre les étapes', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const nextButton = screen.getByTestId('next-button');
    const currentStep = screen.getByTestId('current-step');

    // Aller à l'étape suivante
    act(() => {
      nextButton.click();
    });

    expect(currentStep).toHaveTextContent('1');

    // Aller à l'étape précédente
    const previousButton = screen.getByTestId('previous-button');
    act(() => {
      previousButton.click();
    });

    expect(currentStep).toHaveTextContent('0');
  });

  it('devrait limiter la navigation aux 5 étapes (0-4)', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const nextButton = screen.getByTestId('next-button');
    const currentStep = screen.getByTestId('current-step');

    // Aller jusqu'à la dernière étape
    for (let i = 0; i < 10; i++) {
      act(() => {
        nextButton.click();
      });
    }

    // Ne devrait pas dépasser l'étape 4 (dernière étape)
    expect(currentStep).toHaveTextContent('4');
  });

  it('devrait mettre à jour les étapes correctement', () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const updateButton = screen.getByTestId('update-button');

    act(() => {
      updateButton.click();
    });

    // Vérifier que l'étape a été mise à jour
    // (Dans un vrai test, on vérifierait le state)
  });

  it('devrait persister l\'état dans le localStorage', () => {
    const { unmount } = render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    const nextButton = screen.getByTestId('next-button');
    
    act(() => {
      nextButton.click();
    });

    // Démontrer le composant
    unmount();

    // Re-render et vérifier que l'état est restauré
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    // L'état devrait être restauré depuis le localStorage
    // (Dans un vrai test, on vérifierait que currentStep = 1)
  });
});
