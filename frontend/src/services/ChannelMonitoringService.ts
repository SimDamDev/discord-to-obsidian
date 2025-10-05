interface MonitoringState {
  [channelId: string]: boolean;
}

interface MonitoringStats {
  totalChannels: number;
  monitoredChannels: number;
  unmonitoredChannels: number;
  monitoringRate: number;
}

class ChannelMonitoringService {
  private static instance: ChannelMonitoringService;
  private monitoringState: MonitoringState = {};
  private listeners: Set<(state: MonitoringState) => void> = new Set();

  private constructor() {
    // Charger l'état depuis le localStorage au démarrage
    this.loadFromStorage();
  }

  static getInstance(): ChannelMonitoringService {
    if (!ChannelMonitoringService.instance) {
      ChannelMonitoringService.instance = new ChannelMonitoringService();
    }
    return ChannelMonitoringService.instance;
  }

  /**
   * Vérifie si un canal est surveillé
   */
  isChannelMonitored(channelId: string): boolean {
    return this.monitoringState[channelId] || false;
  }

  /**
   * Active la surveillance d'un canal
   */
  setChannelMonitored(channelId: string, monitored: boolean): void {
    this.monitoringState[channelId] = monitored;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Bascule l'état de surveillance d'un canal
   */
  toggleChannelMonitoring(channelId: string): boolean {
    const newState = !this.isChannelMonitored(channelId);
    this.setChannelMonitored(channelId, newState);
    return newState;
  }

  /**
   * Obtient l'état de surveillance de tous les canaux
   */
  getAllMonitoringState(): MonitoringState {
    return { ...this.monitoringState };
  }

  /**
   * Obtient les canaux surveillés
   */
  getMonitoredChannels(): string[] {
    return Object.entries(this.monitoringState)
      .filter(([_, monitored]) => monitored)
      .map(([channelId, _]) => channelId);
  }

  /**
   * Obtient les canaux non surveillés
   */
  getUnmonitoredChannels(): string[] {
    return Object.entries(this.monitoringState)
      .filter(([_, monitored]) => !monitored)
      .map(([channelId, _]) => channelId);
  }

  /**
   * Obtient les statistiques de surveillance
   */
  getMonitoringStats(): MonitoringStats {
    const totalChannels = Object.keys(this.monitoringState).length;
    const monitoredChannels = this.getMonitoredChannels().length;
    const unmonitoredChannels = totalChannels - monitoredChannels;
    const monitoringRate = totalChannels > 0 ? (monitoredChannels / totalChannels) * 100 : 0;

    return {
      totalChannels,
      monitoredChannels,
      unmonitoredChannels,
      monitoringRate,
    };
  }

  /**
   * Synchronise l'état avec le serveur
   */
  async syncWithServer(): Promise<void> {
    try {
      const response = await fetch('/api/discord/channels/monitored');
      
      if (response.ok) {
        const data = await response.json();
        const serverState: MonitoringState = {};
        
        // Construire l'état à partir de la réponse du serveur
        data.channels?.forEach((channel: any) => {
          serverState[channel.id] = true;
        });

        this.monitoringState = serverState;
        this.saveToStorage();
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec le serveur:', error);
    }
  }

  /**
   * Ajoute un listener pour les changements d'état
   */
  addListener(listener: (state: MonitoringState) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Supprime un listener
   */
  removeListener(listener: (state: MonitoringState) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllMonitoringState());
      } catch (error) {
        console.error('Erreur dans un listener de monitoring:', error);
      }
    });
  }

  /**
   * Sauvegarde l'état dans le localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('channel-monitoring-state', JSON.stringify(this.monitoringState));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'état de monitoring:', error);
    }
  }

  /**
   * Charge l'état depuis le localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('channel-monitoring-state');
      if (stored) {
        this.monitoringState = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'état de monitoring:', error);
      this.monitoringState = {};
    }
  }

  /**
   * Efface tout l'état de surveillance
   */
  clearAll(): void {
    this.monitoringState = {};
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Efface l'état d'un canal spécifique
   */
  clearChannel(channelId: string): void {
    delete this.monitoringState[channelId];
    this.saveToStorage();
    this.notifyListeners();
  }
}

export default ChannelMonitoringService;
