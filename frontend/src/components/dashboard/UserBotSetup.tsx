'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserBot, AuthorizedServer } from '@/types/userBot';

interface UserBotSetupProps {
  onBotCreated?: (bot: UserBot) => void;
  onServerAuthorized?: (server: AuthorizedServer) => void;
}

export function UserBotSetup({ onBotCreated, onServerAuthorized }: UserBotSetupProps) {
  const [botStatus, setBotStatus] = useState<{
    hasBot: boolean;
    bot?: UserBot;
    authorizedServers: AuthorizedServer[];
    serverCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBot, setIsCreatingBot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botName, setBotName] = useState('');

  // Charger le statut du bot
  const loadBotStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user-bot/status');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du statut');
      }
      
      const data = await response.json();
      setBotStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Créer un bot
  const createBot = async () => {
    if (!botName.trim()) {
      setError('Veuillez entrer un nom pour votre bot');
      return;
    }

    try {
      setIsCreatingBot(true);
      setError(null);
      
      const response = await fetch('/api/user-bot/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botName: botName.trim(),
          permissions: ['VIEW_CHANNELS', 'READ_MESSAGE_HISTORY']
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du bot');
      }

      // Recharger le statut
      await loadBotStatus();
      onBotCreated?.(data.bot);
      
      // Ouvrir le lien d'invitation dans un nouvel onglet
      window.open(data.inviteLink.url, '_blank');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsCreatingBot(false);
    }
  };

  useEffect(() => {
    loadBotStatus();
  }, []);

  if (isLoading) {
    return <UserBotSetupSkeleton />;
  }

  if (!botStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuration du Bot</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Erreur lors du chargement du statut du bot
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration du Bot Discord</CardTitle>
        <CardDescription>
          Créez votre bot personnel pour accéder aux canaux de vos serveurs Discord
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!botStatus.hasBot ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Créer votre bot Discord</h3>
              <p className="text-sm text-gray-600 mb-4">
                Votre bot personnel vous permettra d'accéder aux canaux de vos serveurs Discord de manière sécurisée.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="botName" className="text-sm font-medium">
                Nom du bot
              </label>
              <input
                id="botName"
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Mon Bot Discord"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreatingBot}
              />
            </div>

            <Button 
              onClick={createBot} 
              disabled={isCreatingBot || !botName.trim()}
              className="w-full"
            >
              {isCreatingBot ? 'Création en cours...' : 'Créer mon bot'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Bot configuré</h3>
                <p className="text-sm text-gray-600">
                  {botStatus.bot?.name} • {botStatus.serverCount} serveur{botStatus.serverCount > 1 ? 's' : ''} autorisé{botStatus.serverCount > 1 ? 's' : ''}
                </p>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Actif
              </Badge>
            </div>

            {botStatus.authorizedServers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Serveurs autorisés :</h4>
                <div className="space-y-1">
                  {botStatus.authorizedServers.map((server) => (
                    <div key={server.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{server.serverName}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(server.authorizedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <AlertDescription>
                <strong>Prochaines étapes :</strong>
                <br />
                1. Invitez votre bot sur vos serveurs Discord
                <br />
                2. Accordez les permissions "Voir les canaux" et "Lire l'historique des messages"
                <br />
                3. Revenez ici pour voir les canaux de vos serveurs
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserBotSetupSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration du Bot Discord</CardTitle>
        <CardDescription>Chargement...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}
