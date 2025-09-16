'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HealthStatus } from '@/types/auth';
import { useSession } from 'next-auth/react';

export function ServiceHealth() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/connections/health');

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification de la santé');
        }

        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchHealth();
      
      // Vérifier la santé toutes les 30 secondes
      const interval = setInterval(fetchHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'En bonne santé';
      case 'degraded':
        return 'Dégradé';
      case 'unhealthy':
        return 'Non fonctionnel';
      default:
        return 'Inconnu';
    }
  };

  if (isLoading) {
    return <HealthSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Santé du Service</CardTitle>
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

  if (!health) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Santé du Service</CardTitle>
        <CardDescription>
          État de santé des services de surveillance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Statut global:</span>
          <Badge className={getStatusColor(health.status)}>
            {getStatusText(health.status)}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Services:</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bot Discord:</span>
              <Badge variant={health.services.discordBot ? 'default' : 'destructive'}>
                {health.services.discordBot ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Service de polling:</span>
              <Badge variant={health.services.pollingService ? 'default' : 'destructive'}>
                {health.services.pollingService ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Gestionnaire de connexions:</span>
              <Badge variant={health.services.connectionManager ? 'default' : 'destructive'}>
                {health.services.connectionManager ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>

        {health.errors.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-red-600 mb-2">Erreurs détectées:</h4>
            <div className="space-y-1">
              {health.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="text-xs text-gray-500">
            Dernière vérification: {new Date(health.lastCheck).toLocaleString('fr-FR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Santé du Service</CardTitle>
        <CardDescription>Vérification de la santé des services...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

