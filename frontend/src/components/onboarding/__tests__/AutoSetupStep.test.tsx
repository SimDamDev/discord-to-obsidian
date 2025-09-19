import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AutoSetupStep } from '../steps/AutoSetupStep';
import { OnboardingProvider } from '../OnboardingProvider';
import { useSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock fetch
global.fetch = jest.fn();

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

jest.mock('@/components/ui/error-message', () => ({
  ErrorMessage: ({ title, message, suggestion, onRetry }: any) => (
    <div data-testid="error-message">
      <h4>{title}</h4>
      <p>{message}</p>
      {suggestion && <p>{suggestion}</p>}
      {onRetry && <button onClick={onRetry}>Réessayer</button>}
    </div>
  ),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <OnboardingProvider>
      {component}
    </OnboardingProvider>
  );
};

describe('AutoSetupStep - Configuration Automatique', () => {
  beforeEach(() => {
    // Reset mocks
    mockUseSession.mockReturnValue({
      data: { accessToken: 'test-token' },
      status: 'authenticated',
    });
    
    (global.fetch as jest.Mock).mockClear();
  });

  it('devrait afficher le titre et la description corrects', () => {
    renderWithProvider(<AutoSetupStep />);
    
    expect(screen.getByText('Configuration Automatique')).toBeInTheDocument();
    expect(screen.getByText('Configuration automatique du bot et détection de vos serveurs Discord')).toBeInTheDocument();
  });

  it('devrait démarrer automatiquement la configuration', async () => {
    // Mock de la réponse API
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        server: {
          id: '123',
          name: 'Test Server',
        },
      }),
    });

    renderWithProvider(<AutoSetupStep />);
    
    // Vérifier que la configuration a démarré
    await waitFor(() => {
      expect(screen.getByText('Configuration du bot')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'état de chargement pendant la configuration', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithProvider(<AutoSetupStep />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration automatique du bot principal...')).toBeInTheDocument();
    });
  });

  it('devrait afficher l\'état de détection des serveurs', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        server: { id: '123', name: 'Test Server' },
      }),
    });

    renderWithProvider(<AutoSetupStep />);
    
    await waitFor(() => {
      expect(screen.getByText('Recherche des serveurs où le bot est invité...')).toBeInTheDocument();
    });
  });

  it('devrait afficher le succès quand la configuration est terminée', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        server: { id: '123', name: 'Test Server' },
      }),
    });

    renderWithProvider(<AutoSetupStep />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration terminée !')).toBeInTheDocument();
      expect(screen.getByText('Test Server')).toBeInTheDocument();
    });
  });

  it('devrait afficher une erreur si la configuration échoue', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Aucun serveur trouvé',
      }),
    });

    renderWithProvider(<AutoSetupStep />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Erreur de configuration')).toBeInTheDocument();
    });
  });

  it('devrait permettre de réessayer en cas d\'erreur', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithProvider(<AutoSetupStep />);
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Réessayer');
    expect(retryButton).toBeInTheDocument();
  });

  it('devrait afficher le bouton d\'invitation manuelle en cas d\'erreur', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderWithProvider(<AutoSetupStep />);
    
    await waitFor(() => {
      expect(screen.getByText('Inviter manuellement le bot')).toBeInTheDocument();
    });
  });

  it('devrait afficher les étapes du processus automatique', () => {
    renderWithProvider(<AutoSetupStep />);
    
    expect(screen.getByText('🔧 Ce qui se passe automatiquement')).toBeInTheDocument();
    expect(screen.getByText('Configuration du bot principal')).toBeInTheDocument();
    expect(screen.getByText('Détection des serveurs avec bot')).toBeInTheDocument();
    expect(screen.getByText('Validation des permissions')).toBeInTheDocument();
  });

  it('devrait afficher l\'aide contextuelle', () => {
    renderWithProvider(<AutoSetupStep />);
    
    expect(screen.getByText('💡 Besoin d\'aide ?')).toBeInTheDocument();
    expect(screen.getByText(/Si la configuration automatique échoue/)).toBeInTheDocument();
  });
});
