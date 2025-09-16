'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function FinalizationStep() {
  const router = useRouter();
  const { state, completeOnboarding } = useOnboarding();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données de configuration
  const discordAuth = state.steps.discordAuth.data;
  const botCreation = state.steps.botCreation.data;
  const serverSelection = state.steps.serverSelection.data;
  const channelSelection = state.steps.channelSelection.data;
  const obsidianConfig = state.steps.obsidianConfig.data;

  const handleActivate = async () => {
    setIsActivating(true);
    setError(null);

    try {
      // Créer la configuration finale
      const finalConfiguration = {
        userId: discordAuth.user.discordId,
        discordBot: {
          id: botCreation.bot.id,
          token: botCreation.bot.token,
          clientId: botCreation.bot.clientId,
          name: botCreation.bot.name,
        },
        selectedServers: serverSelection.selectedServerIds,
        selectedChannels: channelSelection.selectedChannelIds,
        obsidianConfig: {
          vaultPath: obsidianConfig.vaultPath,
          syncSettings: obsidianConfig.syncSettings,
        },
        isActive: true,
      };

      // Marquer l'onboarding comme complété
      completeOnboarding(finalConfiguration);
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('onboarding-completed', 'true');
      localStorage.setItem('user-configuration', JSON.stringify(finalConfiguration));

      // Redirection vers le dashboard commentée pour le développement
      console.log('✅ Onboarding complété ! (Redirection vers dashboard désactivée en dev)');
      // setTimeout(() => {
      //   router.push('/dashboard');
      // }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'activation');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <OnboardingLayout
      title="Finalisation"
      description="Activez votre surveillance Discord to Obsidian"
      icon="✅"
      onNext={handleActivate}
      nextDisabled={isActivating}
      nextText={isActivating ? "Activation..." : "Activer la surveillance"}
      showPrevious={false}
    >
      <div className="space-y-6">
        {/* Récapitulatif de la configuration */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-4">
              🎉 Configuration terminée !
            </h3>
            <p className="text-green-800">
              Votre surveillance Discord to Obsidian est prête à être activée. 
              Voici un récapitulatif de votre configuration :
            </p>
          </CardContent>
        </Card>

        {/* Détails de la configuration */}
        <div className="grid gap-4">
          {/* Bot Discord */}
          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Bot Discord</h4>
                  <p className="text-sm text-gray-600">{botCreation.bot.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serveurs sélectionnés */}
          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">🏠</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Serveurs</h4>
                  <p className="text-sm text-gray-600">
                    {serverSelection.selectedServers.length} serveur{serverSelection.selectedServers.length > 1 ? 's' : ''} sélectionné{serverSelection.selectedServers.length > 1 ? 's' : ''}
                  </p>
                  <div className="mt-1">
                    {serverSelection.selectedServers.map((server, index) => (
                      <span key={server.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">
                        {server.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Canaux sélectionnés */}
          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Canaux</h4>
                  <p className="text-sm text-gray-600">
                    {channelSelection.selectedChannels.length} canal{channelSelection.selectedChannels.length > 1 ? 'x' : ''} sélectionné{channelSelection.selectedChannels.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Obsidian */}
          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Vault Obsidian</h4>
                  <p className="text-sm text-gray-600 truncate">
                    {obsidianConfig.vaultPath}
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    Sync: {obsidianConfig.syncSettings.autoSync ? `${obsidianConfig.syncSettings.syncInterval}min` : 'Manuel'}
                    {obsidianConfig.syncSettings.includeAttachments && ' • Pièces jointes'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message d'erreur */}
        {error && (
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
        )}

        {/* Informations sur l'activation */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              🚀 Que se passe-t-il maintenant ?
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Votre bot Discord commence à surveiller les canaux sélectionnés</li>
              <li>• Les nouveaux messages sont automatiquement convertis en notes Obsidian</li>
              <li>• Vous pouvez modifier la configuration depuis le dashboard</li>
              <li>• La surveillance fonctionne en arrière-plan 24/7</li>
            </ul>
          </CardContent>
        </Card>

        {/* Bouton d'activation */}
        <div className="text-center">
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {isActivating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Activation en cours...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activer la surveillance
              </>
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
