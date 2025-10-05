'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function VersionChoiceStep() {
  const { updateStep, nextStep } = useOnboarding();
  const [selectedVersion, setSelectedVersion] = useState<'simple' | 'secure' | null>(null);

  const handleVersionSelect = (version: 'simple' | 'secure') => {
    setSelectedVersion(version);
    
    // Sauvegarder le choix de version
    updateStep('versionChoice', {
      version: version,
      selectedAt: new Date(),
    });
    
    // Ne pas passer automatiquement à l'étape suivante
    // L'utilisateur doit cliquer sur "Continuer"
  };

  const handleContinue = () => {
    console.log('🚀 VersionChoice - Bouton Continuer cliqué, passage à l\'étape suivante');
    nextStep();
  };

  return (
    <OnboardingLayout
      title="Choisissez votre Version"
      description="Sélectionnez le niveau de sécurité qui vous convient"
      icon="⚖️"
      onNext={handleContinue}
      nextDisabled={!selectedVersion}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {/* Version Simplifiée */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedVersion === 'simple' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => handleVersionSelect('simple')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Version Simplifiée
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configuration rapide et facile
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recommandé
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">✅ Avantages</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Configuration en 2 minutes</li>
                    <li>• Pas de création de bot</li>
                    <li>• Fonctionne immédiatement</li>
                    <li>• Support technique inclus</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">⚠️ Inconvénients</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Bot partagé avec d'autres</li>
                    <li>• Moins de contrôle</li>
                    <li>• Dépendance externe</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <Button 
                  onClick={() => handleVersionSelect('simple')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {selectedVersion === 'simple' ? '✅ Version Simplifiée Sélectionnée' : 'Choisir la Version Simplifiée'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version Confidentialité Max */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedVersion === 'secure' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => handleVersionSelect('secure')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confidentialité Max
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sécurité et contrôle total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  RGPD
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">✅ Avantages</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Bot personnel dédié</li>
                    <li>• Données 100% privées</li>
                    <li>• Contrôle total</li>
                    <li>• RGPD compliant</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">⚠️ Inconvénients</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Configuration plus longue</li>
                    <li>• Création de bot requise</li>
                    <li>• Gestion personnelle</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <Button 
                  onClick={() => handleVersionSelect('secure')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {selectedVersion === 'secure' ? '✅ Confidentialité Max Sélectionnée' : 'Choisir Confidentialité Max'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations complémentaires */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              💡 Comment choisir ?
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Version Simplifiée</strong> : Parfait pour tester rapidement ou si vous n'avez pas besoin de sécurité maximale.</p>
              <p><strong>Confidentialité Max</strong> : Idéal pour un usage professionnel ou si vous voulez un contrôle total sur vos données.</p>
              <p className="text-xs text-gray-500 mt-3">
                💡 Vous pourrez changer de version plus tard dans les paramètres.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
