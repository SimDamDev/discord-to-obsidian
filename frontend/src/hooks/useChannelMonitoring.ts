import { useState, useEffect, useCallback } from 'react';
import ChannelMonitoringService from '@/services/ChannelMonitoringService';

interface UseChannelMonitoringReturn {
  monitoringState: { [channelId: string]: boolean };
  isChannelMonitored: (channelId: string) => boolean;
  toggleChannelMonitoring: (channelId: string) => Promise<void>;
  setChannelMonitored: (channelId: string, monitored: boolean) => void;
  getMonitoringStats: () => {
    totalChannels: number;
    monitoredChannels: number;
    unmonitoredChannels: number;
    monitoringRate: number;
  };
  syncWithServer: () => Promise<void>;
}

export function useChannelMonitoring(): UseChannelMonitoringReturn {
  const [monitoringState, setMonitoringState] = useState<{ [channelId: string]: boolean }>({});
  const monitoringService = ChannelMonitoringService.getInstance();

  // Mettre à jour l'état local quand le service change
  useEffect(() => {
    const updateState = (state: { [channelId: string]: boolean }) => {
      setMonitoringState(state);
    };

    monitoringService.addListener(updateState);
    
    // Initialiser l'état
    setMonitoringState(monitoringService.getAllMonitoringState());

    return () => {
      monitoringService.removeListener(updateState);
    };
  }, [monitoringService]);

  const isChannelMonitored = useCallback((channelId: string): boolean => {
    return monitoringService.isChannelMonitored(channelId);
  }, [monitoringService]);

  const toggleChannelMonitoring = useCallback(async (channelId: string): Promise<void> => {
    try {
      const isCurrentlyMonitoring = monitoringService.isChannelMonitored(channelId);
      
      if (isCurrentlyMonitoring) {
        await fetch(`/api/discord/channels/${channelId}/monitor`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/discord/channels/monitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ channelId }),
        });
      }
      
      // Mettre à jour l'état via le service
      monitoringService.setChannelMonitored(channelId, !isCurrentlyMonitoring);
    } catch (error) {
      console.error('Erreur lors de la modification de la surveillance:', error);
      throw error;
    }
  }, [monitoringService]);

  const setChannelMonitored = useCallback((channelId: string, monitored: boolean): void => {
    monitoringService.setChannelMonitored(channelId, monitored);
  }, [monitoringService]);

  const getMonitoringStats = useCallback(() => {
    return monitoringService.getMonitoringStats();
  }, [monitoringService]);

  const syncWithServer = useCallback(async (): Promise<void> => {
    await monitoringService.syncWithServer();
  }, [monitoringService]);

  return {
    monitoringState,
    isChannelMonitored,
    toggleChannelMonitoring,
    setChannelMonitored,
    getMonitoringStats,
    syncWithServer,
  };
}
