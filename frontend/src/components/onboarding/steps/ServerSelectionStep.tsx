'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';
import { DiscordServer } from '@/types/onboarding';

export function ServerSelectionStep() {
  const { data: session } = useSession();
  const { updateStep, nextStep, state } = useOnboarding();
  const [servers, setServers] = useState<DiscordServer[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rechercher directement le serveur avec le bot
  useEffect(() => {
    const findServerWithBot = async () => {
      if (!session?.accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 Recherche du serveur avec le bot...');
        
        const response = await fetch('/api/discord/bot-server');

        if (!response.ok) {
          throw new Error('Erreur lors de la recherche du serveur avec bot');
        }

        const data = await response.json();
        
        if (data.success && data.server) {
          console.log(`✅ Serveur avec bot trouvé: ${data.server.name}`);
          
          // Créer un serveur avec le statut bot
          const serverWithBot = {
            ...data.server,
            botInvited: true,
          };
          
          setServers([serverWithBot]);
          setSelectedServers([serverWithBot.id]);
          
          // Passer automatiquement à l'étape suivante après un court délai
          setTimeout(() => {
            updateStep('serverSelection', {
              selectedServers: [serverWithBot],
              selectedServerIds: [serverWithBot.id],
              selectedAt: new Date(),
            });
            nextStep();
          }, 2000);
        } else {
          console.log('❌ Aucun serveur avec bot trouvé');
          setError('Aucun serveur avec bot trouvé. Assurez-vous d\'avoir invité le bot "Discord to Obsidian" sur un serveur Discord.');
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    findServerWithBot();
  }, [session]);

  const handleServerToggle = (serverId: string) => {
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleNext = () => {
    if (selectedServers.length > 0) {
      const selectedServerData = servers.filter(server => 
        selectedServers.includes(server.id)
      );
      
      updateStep('serverSelection', {
        selectedServers: selectedServerData,
        selectedServerIds: selectedServers,
        selectedAt: new Date(),
      });
      
      nextStep();
    }
  };

  const isNextDisabled = selectedServers.length === 0;

  return (
    <OnboardingLayout
      title="Sélection des Serveurs"
      description="Choisissez les serveurs Discord que vous souhaitez surveiller"
      icon="🏠"
      onNext={handleNext}
      nextDisabled={isNextDisabled}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche du serveur avec votre bot...</p>
            <p className="text-sm text-gray-500 mt-2">Test de vos serveurs Discord un par un</p>
          </div>
        ) : servers.length > 0 && servers.filter(s => s.botInvited).length === 1 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Serveur détecté automatiquement !
            </h3>
            <p className="text-gray-600 mb-4">
              Bot trouvé sur le serveur <strong>{servers.find(s => s.botInvited)?.name}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Passage automatique à la sélection des canaux...
            </p>
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
                  Serveur détecté automatiquement
                </h3>
                <p className="text-blue-800 text-sm">
                  Le serveur où vous avez invité votre bot a été détecté automatiquement. 
                  Passage à la sélection des canaux...
                </p>
              </CardContent>
            </Card>

            {/* Liste des serveurs */}
            <div className="space-y-3">
              {servers.length === 0 ? (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-yellow-900 mb-2">
                        Aucun serveur trouvé
                      </h3>
                      <p className="text-yellow-700 text-sm">
                        Assurez-vous d'avoir invité votre bot sur au moins un serveur Discord.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                servers.map((server) => {
                  const isSelected = selectedServers.includes(server.id);
                  const hasBot = server.botInvited; // TODO: Vérifier réellement

                  return (
                    <Card 
                      key={server.id} 
                      className={`
                        cursor-pointer transition-all duration-200 hover:shadow-md
                        ${isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : hasBot 
                            ? 'border-blue-200 bg-white hover:border-blue-300' 
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }
                      `}
                      onClick={() => hasBot && handleServerToggle(server.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          {/* Avatar du serveur */}
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

                          {/* Informations du serveur */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {server.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{server.features.length} fonctionnalités</span>
                              {server.owner && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  Propriétaire
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Statut du bot */}
                          <div className="flex items-center space-x-3">
                            {hasBot ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-700">Bot invité</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-yellow-700">Bot non invité</span>
                              </div>
                            )}

                            {/* Checkbox de sélection */}
                            {hasBot && (
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
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
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

        {/* Informations sur la sélection */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              💡 Conseil
            </h4>
            <p className="text-sm text-gray-700">
              Vous pouvez sélectionner plusieurs serveurs. Dans l'étape suivante, 
              vous pourrez choisir les canaux spécifiques à surveiller dans chaque serveur.
            </p>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
