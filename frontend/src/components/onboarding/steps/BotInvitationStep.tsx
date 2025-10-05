'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function BotInvitationStep() {
  const { data: session } = useSession();
  const { updateStep, nextStep, state } = useOnboarding();
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botInviteLink, setBotInviteLink] = useState<string>('');

  // Récupérer les serveurs de l'utilisateur
  useEffect(() => {
    const fetchServers = async () => {
      if (!session?.accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/discord/servers');
        
        if (response.ok) {
          const data = await response.json();
          setServers(data.servers || []);
          setBotInviteLink(data.botInviteLink || '');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erreur lors de la récupération des serveurs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, [session]);

  const handleServerToggle = (serverId: string) => {
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleInviteBot = () => {
    if (botInviteLink) {
      window.open(botInviteLink, '_blank');
    }
  };

  const handleNext = () => {
    if (selectedServers.length > 0) {
      const selectedServerData = servers.filter(server => 
        selectedServers.includes(server.id)
      );
      
      updateStep('botInvitation', {
        selectedServers: selectedServerData,
        selectedServerIds: selectedServers,
        botInviteLink: botInviteLink,
        invitedAt: new Date(),
      });
      
      nextStep();
    }
  };

  const isNextDisabled = selectedServers.length === 0;

  return (
    <OnboardingLayout
      title="Invitation du Bot"
      description="Sélectionnez vos serveurs Discord et invitez le bot pour accéder aux canaux"
      icon="🤖"
      onNext={handleNext}
      nextDisabled={isNextDisabled}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Récupération de vos serveurs Discord...</p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-red-900">Erreur</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => window.location.href = '/api/auth/signin'}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🔐 Se reconnecter à Discord
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Instructions */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  🤖 Invitation du bot Discord
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Pour accéder aux canaux de vos serveurs Discord, vous devez inviter notre bot. 
                  Sélectionnez les serveurs où vous souhaitez surveiller les canaux.
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={handleInviteBot}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    🔗 Inviter le bot Discord
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Liste des serveurs */}
            <div className="space-y-2">
              {servers.map((server) => {
                const isSelected = selectedServers.includes(server.id);

                return (
                  <Card
                    key={server.id}
                    className={`
                      cursor-pointer transition-all duration-200 hover:shadow-md
                      ${isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleServerToggle(server.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {server.icon ? (
                              <img 
                                src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                                alt={server.name}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <span className="text-lg font-semibold text-gray-600">
                                {server.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {server.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {server.memberCount} membres
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Résumé de sélection */}
            {selectedServers.length > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">
                        {selectedServers.length} serveur{selectedServers.length > 1 ? 's' : ''} sélectionné{selectedServers.length > 1 ? 's' : ''}
                      </h4>
                      <p className="text-green-700 text-sm">
                        Prêt pour la sélection des canaux
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Informations sur l'invitation */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              📋 Instructions d'invitation
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. Cliquez sur "Inviter le bot Discord" ci-dessus</p>
              <p>2. Sélectionnez les serveurs où vous voulez surveiller les canaux</p>
              <p>3. Autorisez les permissions demandées</p>
              <p>4. Retournez ici et cliquez sur "Continuer"</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}

