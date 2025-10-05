'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiscordGuild } from '@/types/auth';
import { useSession } from 'next-auth/react';
import { ChannelList } from './ChannelList';
import { UserBotSetup } from './UserBotSetup';

// Main Component
export function ServerList() {
  const { data: session } = useSession();
  const [servers, setServers] = useState<DiscordGuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUserBot, setHasUserBot] = useState<boolean | null>(null);

  const fetchServers = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setIsRefreshing(forceRefresh);
      const url = forceRefresh ? '/api/discord/servers?refresh=true' : '/api/discord/servers';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erreur lors de la récupération des serveurs');
      const data = await response.json();
      setServers(data.guilds || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkUserBot = async () => {
    try {
      const response = await fetch('/api/user-bot/status');
      if (response.ok) {
        const data = await response.json();
        setHasUserBot(data.hasBot);
      } else {
        setHasUserBot(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du bot:', error);
      setHasUserBot(false);
    }
  };

  useEffect(() => {
    if (session) {
      checkUserBot();
      fetchServers();
    }
  }, [session]);

  if (isLoading && hasUserBot === null) {
    return <ServerListSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-red-500/30 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-400">Erreur de chargement</h3>
        <p className="text-slate-400 mt-2 mb-4">{error}</p>
        <Button onClick={() => fetchServers()} variant="destructive">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UserBotSetup onBotCreated={checkUserBot} />

      {hasUserBot && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Vos Serveurs Discord</CardTitle>
              <CardDescription className="text-slate-400">
                Sélectionnez les serveurs à surveiller.
              </CardDescription>
            </div>
            <Button
              onClick={() => fetchServers(true)}
              variant="ghost"
              size="sm"
              disabled={isRefreshing}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <svg className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </CardHeader>
          <CardContent>
            {servers.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <p className="text-slate-500">Aucun serveur trouvé.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {servers.map((server) => (
                  <ServerCard key={server.id} server={server} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sub-components
function ServerCard({ server }: { server: DiscordGuild }) {
  const [showChannels, setShowChannels] = useState(false);
  const handleToggleChannels = () => setShowChannels(!showChannels);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg transition-all hover:border-blue-500/50 hover:bg-slate-700/50">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={handleToggleChannels}>
        <div className="flex items-center space-x-4">
          <ServerIcon server={server} />
          <div>
            <h3 className="font-semibold text-slate-100">{server.name}</h3>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              {server.owner && (
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Propriétaire</Badge>
              )}
              <span>{server.features.length} fonctionnalités</span>
            </div>
          </div>
        </div>
        <svg className={`w-5 h-5 text-slate-500 transition-transform ${showChannels ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {showChannels && (
        <div className="border-t border-slate-700 p-4">
          <ChannelList serverId={server.id} serverName={server.name} />
        </div>
      )}
    </div>
  );
}

function ServerIcon({ server }: { server: DiscordGuild }) {
  if (server.icon) {
    return <img src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`} alt={server.name} className="w-10 h-10 rounded-lg"/>;
  }
  return (
    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
      <span className="text-slate-300 font-bold text-lg">{server.name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

function ServerListSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="h-6 bg-slate-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border border-slate-700 rounded-lg">
            <div className="w-10 h-10 bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2"><div className="h-4 bg-slate-700 rounded animate-pulse"></div></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}