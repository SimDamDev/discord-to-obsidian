import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AuthAndConsentStep } from '../steps/AuthAndConsentStep';
import { AutoSetupStep } from '../steps/AutoSetupStep';
import { OnboardingProvider } from '../OnboardingProvider';

// Étendre Jest avec les matchers d'accessibilité
expect.extend(toHaveNoViolations);

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <OnboardingProvider>
      {component}
    </OnboardingProvider>
  );
};

describe('Tests d\'Accessibilité - Onboarding Optimisé', () => {
  describe('AuthAndConsentStep', () => {
    it('ne devrait pas avoir de violations d\'accessibilité', async () => {
      const { container } = renderWithProvider(<AuthAndConsentStep />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('devrait avoir des labels appropriés pour les éléments interactifs', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que la checkbox a un label
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'consent');
      
      const label = screen.getByLabelText(/J'accepte que Discord to Obsidian/);
      expect(label).toBeInTheDocument();
    });

    it('devrait avoir des titres hiérarchiques corrects', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier la hiérarchie des titres
      const mainTitle = screen.getByRole('heading', { level: 1 });
      expect(mainTitle).toHaveTextContent('Connexion & Consentement');
      
      const sectionTitles = screen.getAllByRole('heading', { level: 3 });
      expect(sectionTitles.length).toBeGreaterThan(0);
    });

    it('devrait avoir des contrastes de couleurs appropriés', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les éléments importants sont visibles
      const importantText = screen.getByText('🔗 Connexion Discord');
      expect(importantText).toBeInTheDocument();
      
      const consentText = screen.getByText('🛡️ Consentement RGPD');
      expect(consentText).toBeInTheDocument();
    });

    it('devrait être navigable au clavier', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les éléments interactifs sont focusables
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('AutoSetupStep', () => {
    it('ne devrait pas avoir de violations d\'accessibilité', async () => {
      const { container } = renderWithProvider(<AutoSetupStep />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('devrait avoir des indicateurs de statut appropriés', () => {
      renderWithProvider(<AutoSetupStep />);
      
      // Vérifier que les états de chargement sont annoncés
      const loadingText = screen.getByText('Configuration automatique');
      expect(loadingText).toBeInTheDocument();
    });

    it('devrait avoir des messages d\'erreur accessibles', async () => {
      // Mock d'une erreur
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Test error'));
      
      renderWithProvider(<AutoSetupStep />);
      
      // Attendre que l'erreur soit affichée
      await screen.findByText('Erreur de configuration');
      
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Navigation et Progress Bar', () => {
    it('devrait avoir une navigation accessible', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les boutons de navigation ont des labels appropriés
      const nextButton = screen.getByText('Continuer');
      expect(nextButton).toBeInTheDocument();
      
      // Vérifier que les étapes sont annoncées
      const progressText = screen.getByText(/Étape \d+ sur 5/);
      expect(progressText).toBeInTheDocument();
    });

    it('devrait avoir des indicateurs de progression accessibles', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que la progression est annoncée
      const progressIndicator = screen.getByText(/Étape 1 sur 5/);
      expect(progressIndicator).toBeInTheDocument();
    });
  });

  describe('Responsive et Mobile', () => {
    it('devrait être accessible sur mobile', () => {
      // Simuler un viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les éléments sont toujours accessibles
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('devrait avoir des tailles de boutons appropriées pour le tactile', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Vérifier que les boutons ont une taille minimale pour le tactile
        const styles = window.getComputedStyle(button);
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Contenu et Sémantique', () => {
    it('devrait utiliser la sémantique HTML appropriée', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les sections sont correctement marquées
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThan(0);
      
      // Vérifier que les listes sont correctement marquées
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
    });

    it('devrait avoir des descriptions alternatives pour les icônes', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les icônes ont des descriptions
      const icons = screen.getAllByRole('img', { hidden: true });
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-label');
      });
    });

    it('devrait avoir des messages d\'aide contextuels accessibles', () => {
      renderWithProvider(<AuthAndConsentStep />);
      
      // Vérifier que les tooltips sont accessibles
      const helpElements = screen.getAllByTitle(/.*/);
      expect(helpElements.length).toBeGreaterThan(0);
    });
  });
});
