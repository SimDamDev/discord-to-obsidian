'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

interface MonitoredChannel {
  id: string;
  name: string;
  serverName: string;
  serverIcon?: string;
  addedAt: string;
  messageCount: number;
  lastMessage?: string;
}

export function ChannelMonitor() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<MonitoredChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonitoredChannels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/discord/channels/monitored');

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des canaux surveillés');
        }

        const data = await response.json();
        setChannels(data.channels || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchMonitoredChannels();
    }
  }, [session]);

  const removeChannel = async (channelId: string) => {
    try {
      const response = await fetch(`/api/discord/channels/${channelId}/monitor`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        setChannels(channels.filter(channel => channel.id !== channelId));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du canal:', error);
    }
  };

  if (isLoading) {
    return <ChannelListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Canaux Surveillés</CardTitle>
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
        <CardTitle>Canaux Surveillés</CardTitle>
        <CardDescription>
          Canaux actuellement surveillés pour les nouveaux messages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {channels.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">Aucun canal surveillé</p>
            <p className="text-sm text-gray-400">
              Sélectionnez des canaux dans vos serveurs pour commencer la surveillance
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onRemove={removeChannel} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChannelCard({ 
  channel, 
  onRemove 
}: { 
  channel: MonitoredChannel; 
  onRemove: (channelId: string) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(channel.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {channel.serverIcon ? (
            <img
              src={channel.serverIcon}
              alt={channel.serverName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-sm">
                {channel.serverName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">#</span>
              <h3 className="font-semibold">{channel.name}</h3>
            </div>
            <p className="text-sm text-gray-500">{channel.serverName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">
            {channel.messageCount} messages
          </Badge>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? 'Suppression...' : 'Arrêter'}
          </Button>
        </div>
      </div>
      
      {channel.lastMessage && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Dernier message:</span> {channel.lastMessage}
          </p>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-400">
        Surveillé depuis le {new Date(channel.addedAt).toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
}

function ChannelListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canaux Surveillés</CardTitle>
        <CardDescription>Chargement des canaux surveillés...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

