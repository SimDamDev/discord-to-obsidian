'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

// --- TYPES ---
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: { discordBot: boolean; pollingService: boolean; connectionManager: boolean; };
  errors: string[];
  lastCheck: string;
}

// --- CONFIG ---
const STATUS_CONFIG = {
  healthy: { text: 'Opérationnel', color: 'text-green-400', icon: <ShieldCheck className="h-5 w-5" /> },
  degraded: { text: 'Dégradé', color: 'text-yellow-400', icon: <ShieldAlert className="h-5 w-5" /> },
  unhealthy: { text: 'Hors service', color: 'text-red-400', icon: <ShieldX className="h-5 w-5" /> },
};

// --- MAIN COMPONENT ---
export function ServiceHealth() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/connections/health');
        if (!response.ok) throw new Error('Santé des services indisponible');
        setHealth(await response.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Actualisation toutes les 60s
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !health) {
    return <HealthSkeleton />;
  }

  const statusInfo = STATUS_CONFIG[health.status] || STATUS_CONFIG.unhealthy;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
          <HeartPulse className="h-5 w-5 text-blue-400" />
          Santé des Services
        </CardTitle>
        <CardDescription className={`flex items-center gap-2 font-semibold ${statusInfo.color}`}>
          {statusInfo.icon}
          {statusInfo.text}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ServiceRow label="Bot Discord" isHealthy={health.services.discordBot} />
        <ServiceRow label="Service de Polling" isHealthy={health.services.pollingService} />
        <ServiceRow label="Gestionnaire de Connexions" isHealthy={health.services.connectionManager} />

        {health.errors.length > 0 && (
          <div className="pt-3 border-t border-slate-700/50">
            <h4 className="font-semibold text-red-400 mb-2">Erreurs Récentes :</h4>
            <div className="space-y-1 text-xs text-red-400/80">
              {health.errors.map((error, index) => (
                <p key={index} className="truncate" title={error}>- {error}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- SUB-COMPONENTS ---
const ServiceRow = ({ label, isHealthy }: { label: string; isHealthy: boolean }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-300">{label}</span>
    <Badge className={`border-none text-xs ${isHealthy ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
      {isHealthy ? 'Actif' : 'Inactif'}
    </Badge>
  </div>
);

function HealthSkeleton() {
  return (
    <Card className="bg-slate-800 border-slate-700 animate-pulse">
      <CardHeader>
        <div className="h-6 bg-slate-700 rounded w-3/4"></div>
        <div className="h-5 bg-slate-700 rounded w-1/3 mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-5 bg-slate-700 rounded"></div>
        <div className="h-5 bg-slate-700 rounded"></div>
        <div className="h-5 bg-slate-700 rounded"></div>
      </CardContent>
    </Card>
  );
}