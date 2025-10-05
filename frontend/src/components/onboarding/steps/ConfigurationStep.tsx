'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function ConfigurationStep() {
  const { data: session } = useSession();
  const { updateStep, nextStep, state } = useOnboarding();
  
  console.log('⚙️ ConfigurationStep - Composant chargé, version:', state.steps.versionChoice?.data?.version);
  
  // Récupérer la version choisie
  const version = state.steps.versionChoice?.data?.version;
  
  // États pour version simple
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  
  // États pour version sécurisée
  const [botToken, setBotToken] = useState('');
  const [botInfo, setBotInfo] = useState<any>(null);
  
  // États communs
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'servers' | 'bot'>('servers');

  // Récupérer les serveurs pour la version simple
  useEffect(() => {
    if (version === 'simple') {
      const fetchServers = async () => {
        if (!session?.accessToken) return;

        setIsLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/discord/servers');
          
          if (response.ok) {
            const data = await response.json();
            setServers(data.servers || []);
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
    }
  }, [session, version]);

  const handleServerToggle = (serverId: string) => {
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleInviteBot = () => {
    const botInviteLink = `https://discord.com/api/oauth2/authorize?client_id=1417259355967062037&scope=bot&permissions=6656`;
    window.open(botInviteLink, '_blank');
  };

  const validateBotToken = async () => {
    if (!botToken.trim()) {
      setError('Veuillez entrer votre token de bot Discord');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
      });

      if (response.ok) {
        const botData = await response.json();
        setBotInfo(botData);
        setStep('servers');
        
        // Récupérer les serveurs après validation du bot
        const serversResponse = await fetch('/api/discord/servers');
        if (serversResponse.ok) {
          const data = await serversResponse.json();
          setServers(data.servers || []);
        }
      } else {
        setError('Token de bot invalide. Vérifiez votre token Discord.');
      }
    } catch (err) {
      setError('Erreur lors de la validation du token. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (version === 'simple') {
      if (selectedServers.length > 0) {
        const selectedServerData = servers.filter(server => 
          selectedServers.includes(server.id)
        );
        
        updateStep('configuration', {
          version: 'simple',
          selectedServers: selectedServerData,
          selectedServerIds: selectedServers,
          botInviteLink: `https://discord.com/api/oauth2/authorize?client_id=1417259355967062037&scope=bot&permissions=6656`,
          configuredAt: new Date(),
        });
        
        nextStep();
      }
    } else if (version === 'secure') {
      if (botInfo && selectedServers.length > 0) {
        const selectedServerData = servers.filter(server => 
          selectedServers.includes(server.id)
        );
        
        updateStep('configuration', {
          version: 'secure',
          botToken: botToken,
          botInfo: botInfo,
          selectedServers: selectedServerData,
          selectedServerIds: selectedServers,
          configuredAt: new Date(),
        });
        
        nextStep();
      }
    }
  };

  const isNextDisabled = version === 'simple' 
    ? selectedServers.length === 0 
    : version === 'secure' 
      ? !botInfo || selectedServers.length === 0 
      : true;

  if (version === 'simple') {
    return (
      <OnboardingLayout
        title="Configuration Simplifiée"
        description="Sélectionnez vos serveurs et invitez le bot principal"
        icon="⚡"
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
                    🤖 Configuration avec bot principal
                  </h3>
                  <p className="text-blue-800 text-sm mb-4">
                    Sélectionnez les serveurs où vous souhaitez surveiller les canaux, 
                    puis invitez le bot principal.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleInviteBot}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      🔗 Inviter le bot principal
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
        </div>
      </OnboardingLayout>
    );
  }

  // Version sécurisée
  return (
    <OnboardingLayout
      title="Configuration Sécurisée"
      description="Configurez votre bot personnel et sélectionnez vos serveurs"
      icon="🔐"
      onNext={handleNext}
      nextDisabled={isNextDisabled}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {step === 'bot' ? (
          <>
            {/* Configuration du bot personnel */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-green-900 mb-2">
                  Configuration du bot personnel
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  Créez votre bot Discord personnel pour une sécurité maximale.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="botToken" className="block text-sm font-medium text-green-800 mb-2">
                      Token de votre bot Discord
                    </label>
                    <Input
                      id="botToken"
                      type="password"
                      placeholder="Votre token de bot Discord..."
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  <Button 
                    onClick={validateBotToken}
                    disabled={!botToken.trim() || isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? "Validation..." : "Valider le bot"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Sélection des serveurs */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    {botInfo?.avatar ? (
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${botInfo.id}/${botInfo.avatar}.png`}
                        alt={botInfo.username}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <span className="text-2xl">🤖</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">
                      Bot personnel configuré
                    </h3>
                    <p className="text-green-800 text-sm">
                      {botInfo?.username} est prêt
                    </p>
                  </div>
                </div>
                
                <p className="text-green-800 text-sm mb-4">
                  Maintenant, sélectionnez les serveurs où vous souhaitez surveiller les canaux.
                </p>
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
          </>
        )}
      </div>
    </OnboardingLayout>
  );
}
