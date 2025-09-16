'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DiscordChannel } from '@/types/auth';
import ChannelCacheService from '@/services/ChannelCacheService';
import ChannelErrorService from '@/services/ChannelErrorService';
import ChannelMonitoringService from '@/services/ChannelMonitoringService';

interface ChannelListProps {
  serverId: string;
  serverName: string;
  isExpanded: boolean;
  onToggle: () => void;
}

interface ChannelMonitoringState {
  [channelId: string]: boolean;
}

export function ChannelList({ serverId, serverName, isExpanded, onToggle }: ChannelListProps) {
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitoringState, setMonitoringState] = useState<ChannelMonitoringState>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{cached: boolean, source?: string} | null>(null);

  const cacheService = ChannelCacheService.getInstance();
  const errorService = ChannelErrorService.getInstance();
  const monitoringService = ChannelMonitoringService.getInstance();

  // Synchroniser l'état de surveillance au montage du composant
  useEffect(() => {
    const updateMonitoringState = (state: ChannelMonitoringState) => {
      setMonitoringState(state);
    };

    monitoringService.addListener(updateMonitoringState);
    monitoringService.syncWithServer();

    return () => {
      monitoringService.removeListener(updateMonitoringState);
    };
  }, []);

  const fetchChannels = async (forceRefresh = false) => {
    // Si on a déjà des canaux et qu'on ne force pas le refresh, juste toggle l'affichage
    if (channels.length > 0 && !forceRefresh) {
      onToggle();
      return;
    }

    // Si on n'a pas encore de canaux, les charger
    if (channels.length === 0) {
      try {
        setIsLoading(true);
        setIsRefreshing(forceRefresh);
        setError(null);

        // Vérifier le cache d'abord (sauf si force refresh)
        if (!forceRefresh) {
          const cachedChannels = cacheService.get(serverId);
          if (cachedChannels) {
            setChannels(cachedChannels);
            setCacheInfo({ cached: true, source: 'cache' });
            onToggle();
            setIsLoading(false);
            return;
          }
        }

        // Récupérer depuis l'API avec retry automatique
        const fetchOperation = async () => {
          const url = forceRefresh 
            ? `/api/discord/servers/${serverId}/channels?refresh=true`
            : `/api/discord/servers/${serverId}/channels`;
          
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          return data.channels || [];
        };

        const fetchedChannels = await errorService.executeWithRetry(
          fetchOperation,
          `fetch-channels-${serverId}`
        );

        setChannels(fetchedChannels);
        setCacheInfo({ cached: false, source: 'api' });
        
        // Mettre en cache les résultats
        cacheService.set(serverId, fetchedChannels);
        
        onToggle();
      } catch (err) {
        const error = err as Error;
        const userFriendlyMessage = errorService.getUserFriendlyMessage(error);
        setError(userFriendlyMessage);
        console.error('Erreur lors de la récupération des canaux:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const toggleChannelMonitoring = async (channelId: string, isCurrentlyMonitoring: boolean) => {
    try {
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
      // Optionnel: afficher une notification d'erreur à l'utilisateur
    }
  };

  const refreshChannels = () => {
    fetchChannels(true);
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-gray-900">Canaux textuels</h4>
          <Badge variant="secondary" className="text-xs">
            {channels.length} canal{channels.length > 1 ? 'x' : ''}
          </Badge>
          {channels.length > 0 && (
            <MonitoringStatsBadge 
              channels={channels} 
              monitoringState={monitoringState} 
            />
          )}
          {cacheInfo && (
            <Badge variant={cacheInfo.cached ? "default" : "outline"} className="text-xs">
              {cacheInfo.cached ? `Cache (${cacheInfo.source})` : "API"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshChannels}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
              title="Actualiser les canaux"
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchChannels()}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>{isExpanded ? 'Masquer les canaux' : 'Voir les canaux'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-4">
          <AlertDescription>
            Erreur lors du chargement des canaux: {error}
          </AlertDescription>
        </Alert>
      )}

      {isExpanded && (
        <div className="space-y-2">
          {channels.length === 0 ? (
            <EmptyChannelsState />
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {channels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isMonitoring={monitoringState[channel.id] || false}
                  onToggleMonitoring={() => toggleChannelMonitoring(
                    channel.id, 
                    monitoringState[channel.id] || false
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ChannelItemProps {
  channel: DiscordChannel;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

function ChannelItem({ channel, isMonitoring, onToggleMonitoring }: ChannelItemProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
      isMonitoring 
        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    }`}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <ChannelIcon />
            {isMonitoring && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
                <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          <span className={`font-medium truncate ${
            isMonitoring ? 'text-green-900' : 'text-gray-900'
          }`}>
            {channel.name}
          </span>
        </div>
        {channel.topic && (
          <span 
            className="text-xs text-gray-500 truncate max-w-32 hidden sm:block" 
            title={channel.topic}
          >
            {channel.topic}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isMonitoring && (
          <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Surveillé
          </Badge>
        )}
        <Button
          variant={isMonitoring ? "destructive" : "default"}
          size="sm"
          onClick={onToggleMonitoring}
          className="flex items-center space-x-1"
        >
          {isMonitoring ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Arrêter</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">Surveiller</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ChannelIcon() {
  return (
    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
      <path 
        fillRule="evenodd" 
        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" 
        clipRule="evenodd" 
      />
    </svg>
  );
}

function MonitoringStatsBadge({ 
  channels, 
  monitoringState 
}: { 
  channels: DiscordChannel[]; 
  monitoringState: ChannelMonitoringState; 
}) {
  const monitoredCount = channels.filter(channel => monitoringState[channel.id]).length;
  const totalCount = channels.length;
  const percentage = totalCount > 0 ? Math.round((monitoredCount / totalCount) * 100) : 0;

  if (monitoredCount === 0) {
    return (
      <Badge variant="outline" className="text-xs text-gray-600">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Aucun surveillé
      </Badge>
    );
  }

  if (monitoredCount === totalCount) {
    return (
      <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Tous surveillés
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      {monitoredCount}/{totalCount} ({percentage}%)
    </Badge>
  );
}

function EmptyChannelsState() {
  return (
    <div className="text-center py-6">
      <svg 
        className="w-12 h-12 text-gray-300 mx-auto mb-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>
      <p className="text-gray-500 text-sm">Aucun canal textuel trouvé</p>
      <p className="text-gray-400 text-xs mt-1">
        Ce serveur ne contient pas de canaux textuels accessibles
      </p>
    </div>
  );
}
