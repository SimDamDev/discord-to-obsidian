'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Clock, AlertTriangle } from 'lucide-react';

interface DiscordStatusData {
  cache: {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    entries: Array<{
      key: string;
      age: number;
      expiresIn: number;
      isExpired: boolean;
    }>;
  };
  rateLimit: {
    queueLength: number;
    isProcessing: boolean;
    rateLimits: Record<string, any>;
  };
  timestamp: string;
}

interface DatabaseStats {
  users: number;
  servers: number;
  channels: number;
  lastUpdate: string;
}

export default function DiscordStatus() {
  const [status, setStatus] = useState<DiscordStatusData | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statusResponse, dbResponse] = await Promise.all([
        fetch('/api/discord/status'),
        fetch('/api/discord/database/stats')
      ]);
      
      if (!statusResponse.ok) {
        throw new Error('Erreur lors de la récupération du statut');
      }
      
      const statusData = await statusResponse.json();
      setStatus(statusData);
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDbStats(dbData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Mise à jour toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}min`;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Statut Discord
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statut Discord
          </div>
          <Button 
            onClick={fetchStatus} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cache Status */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache
          </h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="font-medium">{status?.cache.totalEntries || 0}</div>
              <div className="text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">{status?.cache.validEntries || 0}</div>
              <div className="text-gray-500">Valides</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600">{status?.cache.expiredEntries || 0}</div>
              <div className="text-gray-500">Expirées</div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        {dbStats && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de Données
            </h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="font-medium">{dbStats.users}</div>
                <div className="text-gray-500">Utilisateurs</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">{dbStats.servers}</div>
                <div className="text-gray-500">Serveurs</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">{dbStats.channels}</div>
                <div className="text-gray-500">Canaux</div>
              </div>
            </div>
          </div>
        )}

        {/* Rate Limit Status */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Rate Limiting
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Queue:</span>
              <Badge variant={status?.rateLimit.queueLength ? "destructive" : "secondary"}>
                {status?.rateLimit.queueLength || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Traitement:</span>
              <Badge variant={status?.rateLimit.isProcessing ? "default" : "outline"}>
                {status?.rateLimit.isProcessing ? "En cours" : "Arrêté"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Cache Entries */}
        {status?.cache.entries && status.cache.entries.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Entrées du cache</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {status.cache.entries.map((entry, index) => (
                <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                  <span className="truncate flex-1 mr-2">{entry.key}</span>
                  <div className="flex gap-2">
                    <Badge variant={entry.isExpired ? "destructive" : "secondary"}>
                      {formatTime(entry.age)}
                    </Badge>
                    {!entry.isExpired && (
                      <Badge variant="outline">
                        {formatTime(entry.expiresIn)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Update */}
        {status?.timestamp && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Dernière mise à jour: {new Date(status.timestamp).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
