'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
}

interface Permissions {
  canReadGuilds: boolean;
  canReadChannels: boolean;
}

interface PermissionsData {
  valid: boolean;
  user?: DiscordUser;
  permissions?: Permissions;
  error?: string;
  status?: number;
}

export default function DiscordPermissions() {
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/discord/permissions');
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Erreur lors de la vérification des permissions');
        setPermissions({ valid: false, error: data.error });
      } else {
        setPermissions(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setPermissions({ valid: false, error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const getAvatarUrl = (user: DiscordUser) => {
    if (user.avatar) {
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions Discord
          </div>
          <Button 
            onClick={fetchPermissions} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {permissions?.valid && permissions.user && (
          <>
            {/* User Info */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Utilisateur Discord
              </h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img 
                  src={getAvatarUrl(permissions.user)} 
                  alt={permissions.user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-medium">{permissions.user.username}</div>
                  <div className="text-sm text-gray-500">#{permissions.user.discriminator}</div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {permissions.permissions && (
              <div>
                <h4 className="font-semibold mb-2">Permissions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lecture des serveurs</span>
                    <Badge variant={permissions.permissions.canReadGuilds ? "default" : "destructive"}>
                      {permissions.permissions.canReadGuilds ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Autorisé</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Refusé</>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lecture des canaux</span>
                    <Badge variant={permissions.permissions.canReadChannels ? "default" : "destructive"}>
                      {permissions.permissions.canReadChannels ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Autorisé</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Refusé</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {!permissions?.valid && !error && (
          <div className="text-center py-4">
            <p className="text-gray-500">Vérification des permissions en cours...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

