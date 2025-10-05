'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceStats } from '@/types/auth';
import { useSession } from 'next-auth/react';

export function ConnectionStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/connections/stats');

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des statistiques');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStats();
      
      // Rafraîchir les stats toutes les 30 secondes
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <StatsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des Connexions</CardTitle>
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

  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques des Connexions</CardTitle>
        <CardDescription>
          État actuel du service de surveillance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeConnections}
            </div>
            <div className="text-sm text-gray-600">Connexions actives</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.monitoredChannels}
            </div>
            <div className="text-sm text-gray-600">Canaux surveillés</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mode actuel:</span>
            <Badge 
              variant={stats.currentMode === 'realtime' ? 'default' : 'secondary'}
              className={stats.currentMode === 'realtime' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
            >
              {stats.currentMode === 'realtime' ? 'Temps réel' : 'Polling'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Messages traités:</span>
            <span className="text-sm text-gray-600">{stats.messagesProcessed}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Temps de fonctionnement:</span>
            <span className="text-sm text-gray-600">{formatUptime(stats.uptime)}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => forceMode('realtime', session)}
              disabled={stats.currentMode === 'realtime'}
            >
              Forcer temps réel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => forceMode('polling', session)}
              disabled={stats.currentMode === 'polling'}
            >
              Forcer polling
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function forceMode(mode: 'realtime' | 'polling', session: any) {
  try {
    const endpoint = mode === 'realtime' ? '/api/connections/force-realtime' : '/api/connections/force-polling';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.accessToken}`,
      },
    });

    if (response.ok) {
      // Rafraîchir les stats après le changement
      window.location.reload();
    }
  } catch (error) {
    console.error('Erreur lors du changement de mode:', error);
  }
}

function StatsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques des Connexions</CardTitle>
        <CardDescription>Chargement des statistiques...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

