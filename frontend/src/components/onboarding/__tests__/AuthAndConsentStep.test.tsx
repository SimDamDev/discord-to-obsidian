import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthAndConsentStep } from '../steps/AuthAndConsentStep';
import { OnboardingProvider } from '../OnboardingProvider';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock des composants UI
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/help-tooltip', () => ({
  HelpTooltip: ({ children, content }: any) => (
    <div title={content}>{children}</div>
  ),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <OnboardingProvider>
      {component}
    </OnboardingProvider>
  );
};

describe('AuthAndConsentStep - Étape Fusionnée', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('devrait afficher le titre et la description corrects', () => {
    renderWithProvider(<AuthAndConsentStep />);
    
    expect(screen.getByText('Connexion & Consentement')).toBeInTheDocument();
    expect(screen.getByText('Connectez-vous avec Discord et acceptez nos conditions d\'utilisation')).toBeInTheDocument();
  });

  it('devrait afficher le bouton de connexion Discord quand non connecté', () => {
    renderWithProvider(<AuthAndConsentStep />);
    
    expect(screen.getByText('Se connecter avec Discord')).toBeInTheDocument();
  });

  it('devrait afficher la section RGPD avec checkbox', () => {
    renderWithProvider(<AuthAndConsentStep />);
    
    expect(screen.getByText('🛡️ Consentement RGPD')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('devrait afficher les tooltips d\'aide', () => {
    renderWithProvider(<AuthAndConsentStep />);
    
    // Vérifier que les tooltips sont présents
    const tooltips = screen.getAllByTitle(/.*/);
    expect(tooltips.length).toBeGreaterThan(0);
  });

  it('devrait permettre de cocher la checkbox de consentement', () => {
    renderWithProvider(<AuthAndConsentStep />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('devrait afficher l\'état connecté quand l\'utilisateur est connecté', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          discordId: '123456789',
        },
      },
      status: 'authenticated',
    });

    renderWithProvider(<AuthAndConsentStep />);
    
    expect(screen.getByText('Connecté avec succès !')).toBeInTheDocument();
    expect(screen.getByText('Bonjour Test User !')).toBeInTheDocument();
  });

  it('devrait activer le bouton Continuer quand connecté et consentement donné', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          discordId: '123456789',
        },
      },
      status: 'authenticated',
    });

    renderWithProvider(<AuthAndConsentStep />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      const continueButton = screen.getByText('Continuer');
      expect(continueButton).not.toBeDisabled();
    });
  });

  it('devrait afficher les informations sur les permissions', () => {
    renderWithProvider(<AuthAndConsentStep />);
    
    expect(screen.getByText('📋 Permissions requises')).toBeInTheDocument();
    expect(screen.getByText('✅ Ce que nous pouvons faire :')).toBeInTheDocument();
    expect(screen.getByText('❌ Ce que nous ne pouvons pas faire :')).toBeInTheDocument();
  });

  it('devrait afficher l\'état de chargement pendant la connexion', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    renderWithProvider(<AuthAndConsentStep />);
    
    expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
  });
});
