'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiscordGuild } from '@/types/auth';
import { useSession } from 'next-auth/react';
import { ChannelList } from './ChannelList';

export function ServerList() {
  const { data: session } = useSession();
  const [servers, setServers] = useState<DiscordGuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{cached: boolean, source?: string, cacheStatus?: any, rateLimitStatus?: any} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServers = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setIsRefreshing(forceRefresh);
      
      const url = forceRefresh ? '/api/discord/servers?refresh=true' : '/api/discord/servers';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des serveurs');
      }

      const data = await response.json();
      setServers(data.guilds || []);
      setCacheInfo({
        cached: data.cached || false,
        source: data.source || 'api',
        cacheStatus: data.cacheStatus,
        rateLimitStatus: data.rateLimitStatus
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchServers();
    }
  }, [session]);

  if (isLoading) {
    return <ServerListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Serveurs Discord</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Serveurs Discord</CardTitle>
            <CardDescription>
              Vos serveurs Discord disponibles pour la surveillance ({servers.length})
            </CardDescription>
          </div>
                 <div className="flex gap-2 items-center">
                   {cacheInfo && (
                     <>
                       <Badge variant={cacheInfo.cached ? "default" : "secondary"}>
                         {cacheInfo.cached ? `Cache (${cacheInfo.source})` : "API"}
                       </Badge>
                       {cacheInfo.rateLimitStatus?.queueLength > 0 && (
                         <Badge variant="destructive">
                           Queue: {cacheInfo.rateLimitStatus.queueLength}
                         </Badge>
                       )}
                     </>
                   )}
                   <Button 
                     onClick={() => fetchServers(true)} 
                     variant="outline" 
                     size="sm"
                     disabled={isRefreshing}
                   >
                     <svg className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                   </Button>
                 </div>
        </div>
      </CardHeader>
      <CardContent>
        {servers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun serveur trouvé</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {servers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServerCard({ server }: { server: DiscordGuild }) {
  const [showChannels, setShowChannels] = useState(false);

  const handleToggleChannels = () => {
    setShowChannels(!showChannels);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ServerIcon server={server} />
          <div>
            <h3 className="font-semibold">{server.name}</h3>
            <div className="flex space-x-2">
              {server.owner && (
                <Badge variant="secondary">Propriétaire</Badge>
              )}
              <Badge variant="outline">
                {server.features.length} fonctionnalités
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <ChannelList
        serverId={server.id}
        serverName={server.name}
        isExpanded={showChannels}
        onToggle={handleToggleChannels}
      />
    </div>
  );
}

function ServerIcon({ server }: { server: DiscordGuild }) {
  if (server.icon) {
    return (
      <img
        src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
        alt={server.name}
        className="w-12 h-12 rounded-full"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
      <span className="text-gray-600 font-semibold">
        {server.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function ServerListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Serveurs Discord</CardTitle>
        <CardDescription>Chargement des serveurs...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

