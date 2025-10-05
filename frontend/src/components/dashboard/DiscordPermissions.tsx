'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

// --- TYPES ---
interface PermissionsData {
  valid: boolean;
  user?: { id: string; username: string; discriminator: string; avatar?: string; };
  permissions?: { canReadGuilds: boolean; canReadChannels: boolean; };
  error?: string;
}

// --- MAIN COMPONENT ---
export default function DiscordPermissions() {
  const [data, setData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discord/permissions');
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Erreur inconnue');
      setData(responseData);
    } catch (err) {
      setData({ valid: false, error: err instanceof Error ? err.message : 'Erreur inconnue' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-100 flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-blue-400" />
          Permissions Discord
        </CardTitle>
        <Button onClick={fetchPermissions} disabled={loading} size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PermissionsSkeleton />
        ) : data?.error ? (
          <ErrorState message={data.error} />
        ) : (
          <PermissionsView data={data} />
        )}
      </CardContent>
    </Card>
  );
}

// --- SUB-COMPONENTS ---
function PermissionsView({ data }: { data: PermissionsData | null }) {
  if (!data?.valid || !data.user || !data.permissions) {
    return <ErrorState message="Permissions non valides ou données manquantes." />;
  }

  const { user, permissions } = data;
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
        <img src={avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
        <div>
          <div className="font-medium text-slate-100">{user.username}</div>
          <div className="text-sm text-slate-400">#{user.discriminator}</div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <PermissionRow label="Lecture des serveurs" granted={permissions.canReadGuilds} />
        <PermissionRow label="Lecture des canaux" granted={permissions.canReadChannels} />
      </div>
    </div>
  );
}

function PermissionRow({ label, granted }: { label: string, granted: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-300">{label}</span>
      <Badge className={`border-none text-xs ${granted
        ? 'bg-green-500/10 text-green-400'
        : 'bg-red-500/10 text-red-400'
      }`}>
        {granted ? (
          <CheckCircle className="h-3 w-3 mr-1.5" />
        ) : (
          <AlertTriangle className="h-3 w-3 mr-1.5" />
        )}
        {granted ? 'Autorisé' : 'Refusé'}
      </Badge>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm">
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}

function PermissionsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700 rounded w-1/4 mt-2"></div>
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-5 bg-slate-700 rounded-full w-1/4"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-5 bg-slate-700 rounded-full w-1/4"></div>
        </div>
      </div>
    </div>
  );
}