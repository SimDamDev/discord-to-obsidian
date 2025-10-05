'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Rss, Clock } from 'lucide-react';

// --- TYPES ---
interface ServiceStats {
  activeConnections: number;
  monitoredChannels: number;
  currentMode: 'realtime' | 'polling';
  messagesProcessed: number;
  uptime: number;
}

// --- MAIN COMPONENT ---
export function ConnectionStats() {
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/connections/stats');
        if (!response.ok) throw new Error('Statistiques indisponibles');
        setStats(await response.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Actualisation toutes les 15s
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !stats) {
    return <StatsSkeleton />;
  }

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d > 0 ? `${d}j ` : ''}${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-blue-400" />
          Statut de la Connexion
        </CardTitle>
        <CardDescription className="text-slate-400">
          État en direct du service de surveillance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay title="Connexions" value={stats.activeConnections} />
          <StatDisplay title="Canaux Surveillés" value={stats.monitoredChannels} />
        </div>
        <div className="text-sm space-y-2 pt-4 border-t border-slate-700/50">
          <StatRow
            label="Mode Actuel"
            value={stats.currentMode === 'realtime' ? 'Temps Réel' : 'Polling'}
            badgeColor={stats.currentMode === 'realtime' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}
            icon={stats.currentMode === 'realtime' ? <Zap className="h-3 w-3" /> : <Rss className="h-3 w-3" />}
          />
          <StatRow label="Messages Traités" value={stats.messagesProcessed.toLocaleString()} />
          <StatRow label="Temps de service" value={formatUptime(stats.uptime)} icon={<Clock className="h-3 w-3" />} />
        </div>
      </CardContent>
    </Card>
  );
}

// --- SUB-COMPONENTS ---
const StatDisplay = ({ title, value }: { title: string, value: number }) => (
  <div className="bg-slate-900/50 p-3 rounded-lg text-center">
    <div className="text-3xl font-bold text-slate-100">{value}</div>
    <div className="text-xs text-slate-400 uppercase tracking-wider">{title}</div>
  </div>
);

const StatRow = ({ label, value, badgeColor, icon }: { label: string, value: string | number, badgeColor?: string, icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-300 flex items-center gap-2">
      {icon}
      {label}
    </span>
    {badgeColor ? (
      <Badge className={`border-none text-xs font-semibold ${badgeColor}`}>{value}</Badge>
    ) : (
      <span className="font-medium text-slate-100">{value}</span>
    )}
  </div>
);

function StatsSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700 animate-pulse">
      <CardHeader>
        <div className="h-6 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2 mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-slate-700 rounded-lg"></div>
          <div className="h-20 bg-slate-700 rounded-lg"></div>
        </div>
        <div className="space-y-3 pt-4 border-t border-slate-700/50">
          <div className="h-5 bg-slate-700 rounded"></div>
          <div className="h-5 bg-slate-700 rounded"></div>
          <div className="h-5 bg-slate-700 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}