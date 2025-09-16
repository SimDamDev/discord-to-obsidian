'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';
import { DiscordChannel } from '@/types/onboarding';

export function ChannelSelectionStep() {
  const { data: session } = useSession();
  const { updateStep, nextStep, state } = useOnboarding();
  const [channels, setChannels] = useState<{ [serverId: string]: DiscordChannel[] }>({});
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les serveurs sélectionnés
  const selectedServers = state.steps.serverSelection.data?.selectedServers || [];

  // Récupérer les canaux pour chaque serveur sélectionné
  useEffect(() => {
    const fetchChannels = async () => {
      if (selectedServers.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const channelsData: { [serverId: string]: DiscordChannel[] } = {};

        for (const server of selectedServers) {
          try {
            console.log(`🔍 Récupération des canaux pour le serveur ${server.name} (${server.id})...`);
            
            const response = await fetch(`/api/discord/servers/${server.id}/channels`);

            if (response.ok) {
              const data = await response.json();
              console.log(`✅ ${data.channels?.length || 0} canaux récupérés pour ${server.name}`);
              
              // Filtrer seulement les canaux de texte (type 0)
              const textChannels = (data.channels || [])
                .filter((channel: any) => channel.type === 0)
                .map((channel: any) => ({
                  ...channel,
                  accessible: true,
                }));
              
              channelsData[server.id] = textChannels;
            } else {
              console.error(`❌ Erreur ${response.status} pour le serveur ${server.name}`);
              channelsData[server.id] = [];
            }
          } catch (err) {
            console.error(`❌ Erreur pour le serveur ${server.name}:`, err);
            channelsData[server.id] = [];
          }
        }

        setChannels(channelsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [selectedServers, session]);

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };


  const handleNext = () => {
    if (selectedChannels.length > 0) {
      const selectedChannelData = Object.values(channels)
        .flat()
        .filter(channel => selectedChannels.includes(channel.id));
      
      updateStep('channelSelection', {
        selectedChannels: selectedChannelData,
        selectedChannelIds: selectedChannels,
        selectedAt: new Date(),
      });
      
      nextStep();
    }
  };

  const isNextDisabled = selectedChannels.length === 0;

  return (
    <OnboardingLayout
      title="Sélection des Canaux"
      description="Choisissez les canaux spécifiques que vous souhaitez surveiller"
      icon="💬"
      onNext={handleNext}
      nextDisabled={isNextDisabled}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Récupération des canaux...</p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
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
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Instructions */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Sélectionnez vos canaux pour les notes
                </h3>
                <p className="text-blue-800 text-sm">
                  Choisissez les canaux de texte que vous souhaitez surveiller pour créer vos notes Obsidian. 
                  Les messages de ces canaux seront automatiquement convertis en notes.
                </p>
                {selectedServers.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Serveur sélectionné :</strong> {selectedServers[0].name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liste des canaux */}
            <div className="space-y-4">
              {selectedServers.map((server) => {
                const serverChannels = channels[server.id] || [];
                const serverSelectedChannels = serverChannels.filter(channel => 
                  selectedChannels.includes(channel.id)
                );

                return (
                  <div key={server.id} className="space-y-4">
                    {/* Header du serveur */}
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-6">
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
                            <h3 className="font-semibold text-blue-900">
                              {server.name}
                            </h3>
                            <p className="text-sm text-blue-700">
                              {serverChannels.length} canal{serverChannels.length > 1 ? 'x' : ''} disponible{serverChannels.length > 1 ? 's' : ''}
                              {serverSelectedChannels.length > 0 && (
                                <span className="ml-2 text-green-600">
                                  • {serverSelectedChannels.length} sélectionné{serverSelectedChannels.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Liste des canaux */}
                    <div className="space-y-2">
                      {serverChannels.length === 0 ? (
                        <Card className="border-yellow-200 bg-yellow-50">
                          <CardContent className="pt-6">
                            <div className="text-center py-4">
                              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h3 className="font-semibold text-yellow-900 mb-2">
                                Aucun canal de texte accessible
                              </h3>
                              <p className="text-yellow-700 text-sm">
                                Vérifiez que le bot a les permissions pour voir les canaux de ce serveur.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        serverChannels.map((channel) => {
                          const isSelected = selectedChannels.includes(channel.id);

                          return (
                            <Card
                              key={channel.id}
                              className={`
                                cursor-pointer transition-all duration-200 hover:shadow-md
                                ${isSelected 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                                }
                              `}
                              onClick={() => handleChannelToggle(channel.id)}
                            >
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                                      <span className="text-sm text-gray-600">#</span>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {channel.name}
                                      </h4>
                                      {channel.topic && (
                                        <p className="text-sm text-gray-600 truncate max-w-md">
                                          {channel.topic}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className={`
                                    w-6 h-6 rounded border-2 flex items-center justify-center
                                    ${isSelected 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'border-gray-300'
                                    }
                                  `}>
                                    {isSelected && (
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Résumé de sélection */}
            {selectedChannels.length > 0 && (
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
                        {selectedChannels.length} canal{selectedChannels.length > 1 ? 'x' : ''} sélectionné{selectedChannels.length > 1 ? 's' : ''}
                      </h4>
                      <p className="text-green-700 text-sm">
                        Prêt pour la configuration Obsidian
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Informations sur la surveillance */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              📝 Surveillance des canaux
            </h4>
            <p className="text-sm text-gray-700">
              Les messages des canaux sélectionnés seront automatiquement convertis en notes Obsidian. 
              Vous pourrez configurer les paramètres de synchronisation dans l'étape suivante.
            </p>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
