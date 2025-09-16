import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { ServerList } from '../ServerList';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockSession = {
  user: {
    id: 'user123',
    discordId: 'discord123',
    username: 'testuser',
  },
  accessToken: 'mock_access_token',
};

const mockServers = [
  {
    id: 'server1',
    name: 'Test Server 1',
    icon: 'icon1',
    owner: true,
    features: ['COMMUNITY', 'NEWS'],
  },
  {
    id: 'server2',
    name: 'Test Server 2',
    icon: null,
    owner: false,
    features: [],
  },
];

const mockChannels = [
  {
    id: 'channel1',
    name: 'general',
    type: 0,
    topic: 'Canal général du serveur',
    position: 0,
  },
  {
    id: 'channel2',
    name: 'dev',
    type: 0,
    topic: 'Canal de développement',
    position: 1,
  },
];

describe('ServerList', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Affichage des serveurs', () => {
    it('devrait afficher la liste des serveurs Discord', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      render(<ServerList />);

      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
        expect(screen.getByText('Test Server 2')).toBeInTheDocument();
      });
    });

    it('devrait afficher un indicateur de chargement', () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<ServerList />);

      expect(screen.getByText('Chargement des serveurs...')).toBeInTheDocument();
    });

    it('devrait afficher un message d\'erreur en cas d\'échec', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Erreur réseau'));

      render(<ServerList />);

      await waitFor(() => {
        expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
      });
    });
  });

  describe('Affichage des canaux par serveur', () => {
    it('devrait afficher les canaux quand on clique sur "Voir les canaux"', async () => {
      // Mock pour les serveurs
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      // Mock pour les canaux
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Voir les canaux"
      const viewChannelsButton = screen.getAllByText('Voir les canaux')[0];
      fireEvent.click(viewChannelsButton);

      // Vérifier que les canaux s'affichent
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
        expect(screen.getByText('dev')).toBeInTheDocument();
      });
    });

    it('devrait masquer les canaux quand on clique sur "Masquer"', async () => {
      // Mock pour les serveurs
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      // Mock pour les canaux
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Voir les canaux"
      const viewChannelsButton = screen.getAllByText('Voir les canaux')[0];
      fireEvent.click(viewChannelsButton);

      // Attendre que les canaux s'affichent
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
      });

      // Cliquer sur "Masquer"
      const hideChannelsButton = screen.getByText('Masquer');
      fireEvent.click(hideChannelsButton);

      // Vérifier que les canaux sont masqués
      expect(screen.queryByText('general')).not.toBeInTheDocument();
    });

    it('devrait afficher un message quand aucun canal textuel n\'est trouvé', async () => {
      // Mock pour les serveurs
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      // Mock pour les canaux vides
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: [] }),
      });

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Voir les canaux"
      const viewChannelsButton = screen.getAllByText('Voir les canaux')[0];
      fireEvent.click(viewChannelsButton);

      // Vérifier le message d'absence de canaux
      await waitFor(() => {
        expect(screen.getByText('Aucun canal textuel trouvé')).toBeInTheDocument();
      });
    });

    it('devrait gérer les erreurs lors de la récupération des canaux', async () => {
      // Mock pour les serveurs
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      // Mock pour l'erreur des canaux
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Erreur API'));

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Voir les canaux"
      const viewChannelsButton = screen.getAllByText('Voir les canaux')[0];
      fireEvent.click(viewChannelsButton);

      // Vérifier que l'erreur est gérée silencieusement (pas d'affichage d'erreur)
      await waitFor(() => {
        expect(screen.queryByText('Aucun canal textuel trouvé')).toBeInTheDocument();
      });
    });
  });

  describe('Gestion de la surveillance des canaux', () => {
    it('devrait permettre d\'activer la surveillance d\'un canal', async () => {
      // Mock pour les serveurs
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      // Mock pour les canaux
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      // Mock pour l'activation de la surveillance
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Voir les canaux"
      const viewChannelsButton = screen.getAllByText('Voir les canaux')[0];
      fireEvent.click(viewChannelsButton);

      // Attendre que les canaux s'affichent
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
      });

      // Cliquer sur "Surveiller" pour le premier canal
      const monitorButton = screen.getAllByText('Surveiller')[0];
      fireEvent.click(monitorButton);

      // Vérifier que l'appel API a été fait
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/discord/channels/monitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channelId: 'channel1' }),
        });
      });
    });

    it('devrait permettre de désactiver la surveillance d\'un canal', async () => {
      // Mock pour les serveurs
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      // Mock pour les canaux
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      // Mock pour la désactivation de la surveillance
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Voir les canaux"
      const viewChannelsButton = screen.getAllByText('Voir les canaux')[0];
      fireEvent.click(viewChannelsButton);

      // Attendre que les canaux s'affichent
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
      });

      // Cliquer sur "Surveiller" puis sur "Arrêter"
      const monitorButton = screen.getAllByText('Surveiller')[0];
      fireEvent.click(monitorButton);

      // Attendre que le bouton change
      await waitFor(() => {
        expect(screen.getByText('Arrêter')).toBeInTheDocument();
      });

      // Cliquer sur "Arrêter"
      const stopButton = screen.getByText('Arrêter');
      fireEvent.click(stopButton);

      // Vérifier que l'appel API a été fait
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/discord/channels/channel1/monitor', {
          method: 'DELETE',
        });
      });
    });
  });

  describe('Actualisation des données', () => {
    it('devrait permettre d\'actualiser la liste des serveurs', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ guilds: mockServers }),
      });

      render(<ServerList />);

      // Attendre que les serveurs se chargent
      await waitFor(() => {
        expect(screen.getByText('Test Server 1')).toBeInTheDocument();
      });

      // Cliquer sur "Actualiser"
      const refreshButton = screen.getByText('Actualiser');
      fireEvent.click(refreshButton);

      // Vérifier que l'appel API a été refait
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
