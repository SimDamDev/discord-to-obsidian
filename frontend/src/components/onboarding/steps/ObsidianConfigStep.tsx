'use client';

import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function ObsidianConfigStep() {
  const { updateStep, nextStep } = useOnboarding();

  // Skip automatique en mode développement
  useEffect(() => {
    const skipStep = async () => {
      console.log('🚀 Mode Dev - Skip automatique de l\'étape Obsidian');
      
      // Configuration mockée pour les tests
      const obsidianConfig = {
        vaultPath: '/mock/obsidian/vault',
        syncSettings: {
          autoSync: true,
          syncInterval: 5,
          includeAttachments: true,
        },
        configuredAt: new Date(),
        isMockMode: true,
      };

      console.log('💾 Sauvegarde de la configuration Obsidian mockée:', obsidianConfig);
      
      // Sauvegarder la configuration mockée
      updateStep('obsidianConfig', obsidianConfig);

      // Avancer automatiquement après un court délai
      setTimeout(() => {
        console.log('🚀 Mode Dev - Appel de nextStep() pour passer à l\'étape finale');
        nextStep();
      }, 1500);
    };

    skipStep();
  }, [updateStep, nextStep]);

  return (
    <OnboardingLayout
      title="Configuration Obsidian"
      description="Skip automatique en mode développement"
      icon="🚀"
    >
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Mode Développement Actif
              </h3>
              <p className="text-blue-700 mb-4">
                L'étape Obsidian est automatiquement skipée pour accélérer les tests de surveillance Discord.
              </p>
              <div className="bg-blue-100 p-4 rounded-lg mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Configuration automatique :</strong><br/>
                  • Vault Mock : <code>/mock/obsidian/vault</code><br/>
                  • Sync Auto : Activée (5 min)<br/>
                  • Pièces jointes : Incluses<br/>
                  • Passage automatique à l'étape suivante...
                </p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Avancement automatique en cours...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
