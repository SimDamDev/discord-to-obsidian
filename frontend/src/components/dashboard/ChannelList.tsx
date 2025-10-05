'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DiscordChannel } from '@/types/auth';

// --- PROPS ---
interface ChannelListProps {
  serverId: string;
  serverName: string;
}

interface ChannelItemProps {
  channel: DiscordChannel;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

// --- STATE MANAGEMENT ---
const useChannelStore = () => {
  const [monitoringState, setMonitoringState] = useState<Record<string, boolean>>({});

  const toggleMonitoring = (channelId: string) => {
    setMonitoringState(prev => ({ ...prev, [channelId]: !prev[channelId] }));
    // Note: L'appel API réel est géré dans le composant pour l'instant
  };

  return { monitoringState, toggleMonitoring };
};

// --- MAIN COMPONENT ---
export function ChannelList({ serverId }: ChannelListProps) {
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { monitoringState, toggleMonitoring } = useChannelStore();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/discord/servers/${serverId}/channels`);
        if (!response.ok) throw new Error('Impossible de charger les canaux');
        const data = await response.json();
        setChannels(data.channels || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };
    fetchChannels();
  }, [serverId]);

  const handleToggleMonitoring = async (channelId: string) => {
    const isCurrentlyMonitoring = monitoringState[channelId] || false;

    // Mettre à jour l'état local immédiatement pour une meilleure réactivité
    toggleMonitoring(channelId);

    try {
      const method = isCurrentlyMonitoring ? 'DELETE' : 'POST';
      const response = await fetch(`/api/discord/channels/${channelId}/monitor`, { method });

      if (!response.ok) {
        // En cas d'échec, annuler le changement d'état local
        console.error("Échec de la mise à jour de la surveillance");
        toggleMonitoring(channelId);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      // Annuler également en cas d'erreur réseau
      toggleMonitoring(channelId);
    }
  };

  if (isLoading) return <ChannelListSkeleton />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  return (
    <div className="space-y-2">
       <h4 className="font-semibold text-slate-300 px-1 pb-2">Canaux Textuels</h4>
      {channels.length > 0 ? (
        channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isMonitoring={monitoringState[channel.id] || false}
            onToggleMonitoring={() => handleToggleMonitoring(channel.id)}
          />
        ))
      ) : (
        <EmptyChannelsState />
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function ChannelItem({ channel, isMonitoring, onToggleMonitoring }: ChannelItemProps) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-md transition-colors ${
      isMonitoring 
        ? 'bg-blue-500/10'
        : 'hover:bg-slate-700/50'
    }`}>
      <div className="flex items-center space-x-3">
        <HashtagIcon isMonitoring={isMonitoring} />
        <span className={`font-medium ${isMonitoring ? 'text-blue-300' : 'text-slate-300'}`}>
          {channel.name}
        </span>
      </div>
      <Button
        variant={isMonitoring ? "ghost" : "outline"}
        size="sm"
        onClick={onToggleMonitoring}
        className={isMonitoring
          ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
          : "border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400"}
      >
        {isMonitoring ? 'Arrêter' : 'Surveiller'}
      </Button>
    </div>
  );
}

function HashtagIcon({ isMonitoring }: { isMonitoring: boolean }) {
  return (
    <svg className={`w-5 h-5 ${isMonitoring ? 'text-blue-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  );
}

function EmptyChannelsState() {
  return (
    <div className="text-center py-6 text-slate-500 text-sm">
      <p>Aucun canal textuel trouvé dans ce serveur.</p>
    </div>
  );
}

function ChannelListSkeleton() {
  return (
    <div className="space-y-3 pt-4">
      {[1, 2].map(i => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-700 rounded animate-pulse" />
            <div className="w-32 h-4 bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="w-24 h-8 bg-slate-700 rounded-md animate-pulse" />
        </div>
      ))}
    </div>
  );
}