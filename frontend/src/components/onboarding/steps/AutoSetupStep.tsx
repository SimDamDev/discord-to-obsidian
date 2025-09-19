'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorMessage } from '@/components/ui/error-message';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function AutoSetupStep() {
  const { data: session } = useSession();
  const { updateStep, nextStep } = useOnboarding();
  const [setupPhase, setSetupPhase] = useState<'idle' | 'bot' | 'servers' | 'complete' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<any>(null);

  useEffect(() => {
    // Démarrer automatiquement la configuration
    if (session?.accessToken && setupPhase === 'idle') {
      startAutoSetup();
    }
  }, [session, setupPhase]);

  const startAutoSetup = async () => {
    setIsLoading(true);
    setError(null);
    setSetupPhase('bot');

    try {
      // Phase 1: Configuration du bot (simplifiée)
      console.log('🤖 Configuration automatique du bot...');
      
      // Utiliser le bot principal existant
      const botConfig = {
        bot: {
          id: 'main-bot',
          name: 'Discord to Obsidian Bot',
          clientId: '1417259355967062037',
          isActive: true,
        },
        inviteLink: `https://discord.com/api/oauth2/authorize?client_id=1417259355967062037&scope=bot&permissions=6656`,
      };

      setSetupPhase('servers');
      
      // Phase 2: Détection automatique des serveurs
      console.log('🏠 Détection des serveurs avec bot...');
      
      const response = await fetch('/api/discord/bot-server');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la détection des serveurs');
      }

      const serverData = await response.json();
      
      if (serverData.success && serverData.server) {
        const finalSetupData = {
          bot: botConfig.bot,
          inviteLink: botConfig.inviteLink,
          detectedServer: serverData.server,
          autoDetected: true,
          setupAt: new Date(),
        };

        setSetupData(finalSetupData);
        setSetupPhase('complete');
        
        // Marquer cette étape comme complétée
        updateStep('autoSetup', finalSetupData);
        
        // Passer automatiquement à l'étape suivante après un délai
        setTimeout(() => {
          nextStep();
        }, 2000);
      } else {
        throw new Error('Aucun serveur avec bot détecté. Veuillez inviter le bot sur un serveur Discord.');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la configuration automatique');
      setSetupPhase('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setSetupPhase('idle');
    setError(null);
    setSetupData(null);
  };

  const handleManualInvite = () => {
    if (setupData?.inviteLink) {
      window.open(setupData.inviteLink, '_blank');
      // Marquer comme complété après un délai
      setTimeout(() => {
        setSetupPhase('complete');
        updateStep('autoSetup', setupData);
        nextStep();
      }, 3000);
    }
  };

  const getPhaseContent = () => {
    switch (setupPhase) {
      case 'idle':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configuration automatique
            </h3>
            <p className="text-gray-600 mb-4">
              Nous allons configurer automatiquement votre bot et détecter vos serveurs Discord.
            </p>
            <Button onClick={startAutoSetup} className="bg-blue-600 hover:bg-blue-700">
              Démarrer la configuration
            </Button>
          </div>
        );

      case 'bot':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Configuration du bot
            </h3>
            <p className="text-gray-600">
              Configuration automatique du bot principal...
            </p>
          </div>
        );

      case 'servers':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Détection des serveurs
            </h3>
            <p className="text-gray-600">
              Recherche des serveurs où le bot est invité...
            </p>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Configuration terminée !
            </h3>
            <p className="text-gray-600 mb-4">
              Bot configuré et serveur <strong>{setupData?.detectedServer?.name}</strong> détecté automatiquement.
            </p>
            <p className="text-sm text-gray-500">
              Passage automatique à la sélection des canaux...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <ErrorMessage
              title="Erreur de configuration"
              message={error || 'Une erreur est survenue lors de la configuration automatique'}
              suggestion="Vérifiez que vous avez invité le bot sur au moins un serveur Discord, puis réessayez."
              onRetry={handleRetry}
            />
            <div className="text-center">
              <Button onClick={handleManualInvite} variant="outline" className="w-full md:w-auto">
                Inviter manuellement le bot
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      title="Configuration Automatique"
      description="Configuration automatique du bot et détection de vos serveurs Discord"
      icon="⚡"
      onNext={() => setupPhase === 'complete' && nextStep()}
      nextDisabled={setupPhase !== 'complete'}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {getPhaseContent()}

        {/* Informations sur le processus */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              🔧 Ce qui se passe automatiquement
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  setupPhase === 'bot' || setupPhase === 'servers' || setupPhase === 'complete' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {setupPhase === 'complete' ? '✓' : '1'}
                </div>
                <span className={setupPhase === 'complete' ? 'text-green-700' : 'text-gray-700'}>
                  Configuration du bot principal
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  setupPhase === 'servers' || setupPhase === 'complete' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {setupPhase === 'complete' ? '✓' : '2'}
                </div>
                <span className={setupPhase === 'complete' ? 'text-green-700' : 'text-gray-700'}>
                  Détection des serveurs avec bot
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  setupPhase === 'complete' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {setupPhase === 'complete' ? '✓' : '3'}
                </div>
                <span className={setupPhase === 'complete' ? 'text-green-700' : 'text-gray-700'}>
                  Validation des permissions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aide contextuelle */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              💡 Besoin d'aide ?
            </h4>
            <p className="text-sm text-blue-800">
              Si la configuration automatique échoue, vous pouvez inviter manuellement le bot 
              "Discord to Obsidian" sur vos serveurs Discord, puis réessayer.
            </p>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
