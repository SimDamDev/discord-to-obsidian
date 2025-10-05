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
  const authAndConsent = state.steps.authAndConsent.data;
  const configuration = state.steps.configuration.data;
  const channelSelection = state.steps.channelSelection.data;
  const obsidianConfig = state.steps.obsidianConfig.data;

  console.log('📊 FinalizationStep - Données récupérées:', {
    authAndConsent: !!authAndConsent,
    configuration: !!configuration,
    channelSelection: !!channelSelection,
    obsidianConfig: !!obsidianConfig,
    currentStep: state.currentStep
  });

  const handleActivate = async () => {
    console.log('🚀 FinalizationStep - handleActivate appelé');
    setIsActivating(true);
    setError(null);

    try {
      // Créer la configuration finale
      const finalConfiguration = {
        userId: authAndConsent.user.discordId,
        discordBot: {
          id: configuration?.botInfo?.id || 'bot-id',
          token: configuration?.botToken || 'bot-token',
          clientId: configuration?.botInfo?.id || 'client-id',
          name: configuration?.botInfo?.username || 'Discord Bot',
        },
        selectedServers: configuration?.selectedServerIds || [],
        selectedChannels: channelSelection.selectedChannelIds || [],
        obsidianConfig: {
          vaultPath: obsidianConfig.vaultPath,
          syncSettings: obsidianConfig.syncSettings,
        },
        isActive: true,
      };

      console.log('💾 Sauvegarde de la configuration finale:', finalConfiguration);

      // Marquer l'onboarding comme complété
      completeOnboarding(finalConfiguration);
      
      // Sauvegarder dans le localStorage
      localStorage.setItem('onboarding-completed', 'true');
      localStorage.setItem('user-configuration', JSON.stringify(finalConfiguration));

      // Redirection vers la page de surveillance
      console.log('🔄 Redirection vers la page de surveillance...');
      router.push('/surveillance');

    } catch (err) {
      console.error('❌ Erreur lors de l\'activation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'activation');
    } finally {
      setIsActivating(false);
    }
  };

  // Fonction pour démarrer la surveillance Discord
  const startDiscordMonitoring = async (config: any) => {
    console.log('🎯 Démarrage de la surveillance Discord...');
    
    try {
      // Créer un service de surveillance simple
      const monitoringService = {
        isActive: false,
        intervalId: null as NodeJS.Timeout | null,
        
        start() {
          if (this.isActive) return;
          
          console.log('🚀 Surveillance Discord démarrée !');
          this.isActive = true;
          
          // Simuler la surveillance avec des logs toutes les 10 secondes
          this.intervalId = setInterval(() => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`📡 [${timestamp}] Surveillance active - Canaux surveillés: ${config.selectedChannels.length}`);
            console.log(`📊 Canaux: ${config.selectedChannels.join(', ')}`);
            
            // Simuler la détection de nouveaux messages (pour les tests)
            if (Math.random() > 0.7) { // 30% de chance
              console.log('💬 Nouveau message détecté dans un canal surveillé (simulation)');
              console.log('📝 Note Obsidian créée: /mock/obsidian/vault/messages/');
            }
          }, 10000);
        },
        
        stop() {
          if (!this.isActive) return;
          
          console.log('⏹️ Surveillance Discord arrêtée');
          this.isActive = false;
          
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
        }
      };
      
      // Démarrer la surveillance
      monitoringService.start();
      
      // Sauvegarder le service pour pouvoir l'arrêter plus tard
      (window as any).discordMonitoringService = monitoringService;
      
      console.log('✅ Surveillance Discord configurée et démarrée !');
      console.log('📋 Instructions:');
      console.log('  1. Allez sur Discord');
      console.log('  2. Écrivez des messages dans les canaux sélectionnés');
      console.log('  3. Regardez la console pour voir la surveillance');
      console.log('  4. Tapez "window.discordMonitoringService.stop()" pour arrêter');
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage de la surveillance:', error);
      throw error;
    }
  };

  return (
    <OnboardingLayout
      title="Finalisation"
      description="Activez votre surveillance Discord to Obsidian"
      icon="✅"
      onNext={handleActivate}
      nextDisabled={isActivating}
      nextText={isActivating ? "Activation..." : (obsidianConfig?.vaultPath?.includes('/mock/') ? "Activer le Test" : "Activer la surveillance")}
      showPrevious={false}
    >
      <div className="space-y-6">
        {/* Récapitulatif de la configuration */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🎉</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Configuration terminée !</h3>
                <p className="text-green-700 text-sm">
                  {obsidianConfig?.vaultPath?.includes('/mock/') 
                    ? 'Mode Test - Surveillance Discord prête à être testée'
                    : 'Surveillance Discord to Obsidian prête à être activée'
                  }
                </p>
              </div>
            </div>
            <p className="text-green-800">
              {obsidianConfig?.vaultPath?.includes('/mock/') 
                ? 'Votre surveillance Discord est configurée en mode test. Vous pouvez maintenant tester la surveillance des canaux sélectionnés.'
                : 'Votre surveillance Discord to Obsidian est prête à être activée. Voici un récapitulatif de votre configuration :'
              }
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
                  <p className="text-sm text-gray-600">{configuration?.botInfo?.username || 'Bot Discord'}</p>
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
                    {configuration?.selectedServers?.length || 0} serveur{(configuration?.selectedServers?.length || 0) > 1 ? 's' : ''} sélectionné{(configuration?.selectedServers?.length || 0) > 1 ? 's' : ''}
                  </p>
                  <div className="mt-1">
                    {configuration?.selectedServers?.map((server: any, index: number) => (
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
              {obsidianConfig?.vaultPath?.includes('/mock/') ? "🧪 Mode Test - Que va-t-il se passer ?" : "🚀 Que se passe-t-il maintenant ?"}
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {obsidianConfig?.vaultPath?.includes('/mock/') ? (
                <>
                  <li>• Votre bot Discord commence à surveiller les canaux sélectionnés</li>
                  <li>• Les nouveaux messages sont capturés et traités (mode test)</li>
                  <li>• Les notes sont simulées dans le vault mock <code>/mock/obsidian/vault</code></li>
                  <li>• Vous pouvez tester la surveillance sans configuration Obsidian réelle</li>
                  <li>• Consultez les logs pour voir l'activité de surveillance</li>
                </>
              ) : (
                <>
                  <li>• Votre bot Discord commence à surveiller les canaux sélectionnés</li>
                  <li>• Les nouveaux messages sont automatiquement convertis en notes Obsidian</li>
                  <li>• Vous pouvez modifier la configuration depuis le dashboard</li>
                  <li>• La surveillance fonctionne en arrière-plan 24/7</li>
                </>
              )}
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
                {obsidianConfig?.vaultPath?.includes('/mock/') ? "Activer le Test Discord" : "Activer la surveillance"}
              </>
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
