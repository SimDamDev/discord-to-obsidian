'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Clock, AlertTriangle } from 'lucide-react';

// --- TYPES ---
interface StatusData {
  cache: { totalEntries: number; validEntries: number; expiredEntries: number; };
  rateLimit: { queueLength: number; isProcessing: boolean; };
  timestamp: string;
}
interface DbStats { users: number; servers: number; channels: number; }

// --- HELPERS ---
const StatCard = ({ title, value, colorClass = 'text-slate-100' }: { title: string, value: number, colorClass?: string }) => (
  <div className="bg-slate-900/50 p-3 rounded-lg text-center">
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="text-xs text-slate-400 uppercase">{title}</div>
  </div>
);

// --- MAIN COMPONENT ---
export default function DiscordStatus() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, dbRes] = await Promise.all([
        fetch('/api/discord/status'),
        fetch('/api/discord/database/stats')
      ]);
      if (!statusRes.ok) throw new Error('Erreur de statut Discord');
      setStatus(await statusRes.json());
      if (dbRes.ok) setDbStats(await dbRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Actualisation toutes les 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-blue-400" />
          Statut des Services
        </CardTitle>
        <Button onClick={fetchStatus} disabled={loading} size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !status ? (
          <StatusSkeleton />
        ) : error ? (
          <div className="text-red-400 text-center p-4">{error}</div>
        ) : (
          <div className="space-y-6">
            {dbStats && (
              <div>
                <h4 className="font-semibold mb-2 text-slate-300">Base de Données</h4>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard title="Utilisateurs" value={dbStats.users} />
                  <StatCard title="Serveurs" value={dbStats.servers} colorClass="text-blue-400" />
                  <StatCard title="Canaux" value={dbStats.channels} colorClass="text-green-400" />
                </div>
              </div>
            )}
            {status && (
              <div>
                <h4 className="font-semibold mb-2 text-slate-300">Rate Limiter</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">File d'attente</span>
                    <Badge className={`border-none ${status.rateLimit.queueLength > 0 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-700 text-slate-300'}`}>
                      {status.rateLimit.queueLength}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Traitement</span>
                    <Badge className={`border-none ${status.rateLimit.isProcessing ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                      {status.rateLimit.isProcessing ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 text-center pt-4 border-t border-slate-700">
              Dernière mise à jour : {status ? new Date(status.timestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-slate-700 rounded-lg"></div>
          <div className="h-16 bg-slate-700 rounded-lg"></div>
          <div className="h-16 bg-slate-700 rounded-lg"></div>
        </div>
      </div>
      <div>
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-2"></div>
        <div className="space-y-2">
          <div className="h-6 bg-slate-700 rounded-md"></div>
          <div className="h-6 bg-slate-700 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}