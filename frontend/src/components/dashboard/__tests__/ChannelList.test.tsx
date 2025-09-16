import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChannelList } from '../ChannelList';
import { DiscordChannel } from '@/types/auth';

// Mock des services
jest.mock('@/services/ChannelCacheService', () => ({
  getInstance: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

jest.mock('@/services/ChannelErrorService', () => ({
  getInstance: () => ({
    executeWithRetry: jest.fn(),
    getUserFriendlyMessage: jest.fn((error) => error.message),
  }),
}));

jest.mock('@/services/ChannelMonitoringService', () => ({
  getInstance: () => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    syncWithServer: jest.fn(),
    setChannelMonitored: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockChannels: DiscordChannel[] = [
  {
    id: 'channel1',
    name: 'general',
    type: 0,
    position: 0,
    topic: 'Canal général',
  },
  {
    id: 'channel2',
    name: 'dev',
    type: 0,
    position: 1,
    topic: 'Canal de développement',
  },
];

describe('ChannelList', () => {
  const defaultProps = {
    serverId: 'server1',
    serverName: 'Test Server',
    isExpanded: false,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  describe('Affichage initial', () => {
    it('devrait afficher le bouton pour voir les canaux', () => {
      render(<ChannelList {...defaultProps} />);
      
      expect(screen.getByText('Voir les canaux')).toBeInTheDocument();
    });

    it('devrait afficher le nom du serveur dans l\'en-tête', () => {
      render(<ChannelList {...defaultProps} />);
      
      expect(screen.getByText('Canaux textuels')).toBeInTheDocument();
    });
  });

  describe('Chargement des canaux', () => {
    it('devrait charger les canaux quand on clique sur "Voir les canaux"', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
        expect(screen.getByText('dev')).toBeInTheDocument();
      });
    });

    it('devrait afficher un indicateur de chargement', async () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });

    it('devrait gérer les erreurs de chargement', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Erreur réseau'));

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      await waitFor(() => {
        expect(screen.getByText(/Erreur réseau/)).toBeInTheDocument();
      });
    });
  });

  describe('État de surveillance des canaux', () => {
    it('devrait afficher les canaux avec leur état de surveillance', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
        expect(screen.getByText('dev')).toBeInTheDocument();
      });

      // Vérifier que les boutons de surveillance sont présents
      const monitorButtons = screen.getAllByText('Surveiller');
      expect(monitorButtons).toHaveLength(2);
    });

    it('devrait permettre de basculer l\'état de surveillance', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      // Mock pour l'activation de la surveillance
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
      });

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
  });

  describe('Actualisation des canaux', () => {
    it('devrait permettre d\'actualiser les canaux', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      render(<ChannelList {...defaultProps} isExpanded={true} />);

      // Attendre que les canaux se chargent
      await waitFor(() => {
        expect(screen.getByText('general')).toBeInTheDocument();
      });

      // Cliquer sur le bouton d'actualisation
      const refreshButton = screen.getByTitle('Actualiser les canaux');
      fireEvent.click(refreshButton);

      // Vérifier que l'appel API a été refait
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('État vide', () => {
    it('devrait afficher un message quand aucun canal n\'est trouvé', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: [] }),
      });

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      await waitFor(() => {
        expect(screen.getByText('Aucun canal textuel trouvé')).toBeInTheDocument();
      });
    });
  });

  describe('Informations de cache', () => {
    it('devrait afficher les informations de cache', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channels: mockChannels }),
      });

      render(<ChannelList {...defaultProps} />);

      const viewChannelsButton = screen.getByText('Voir les canaux');
      fireEvent.click(viewChannelsButton);

      await waitFor(() => {
        expect(screen.getByText('API')).toBeInTheDocument();
      });
    });
  });
});
