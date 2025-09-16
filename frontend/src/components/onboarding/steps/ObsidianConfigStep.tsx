'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function ObsidianConfigStep() {
  const { updateStep, nextStep } = useOnboarding();
  const [vaultPath, setVaultPath] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!vaultPath.trim()) {
      setError('Veuillez entrer le chemin vers votre vault Obsidian');
      return;
    }

    setIsTesting(true);
    setError(null);
    setTestResult(null);

    try {
      // Simulation d'un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Pour l'instant, on simule un succès
      setTestResult('success');
    } catch (err) {
      setTestResult('error');
      setError('Impossible de se connecter au vault Obsidian');
    } finally {
      setIsTesting(false);
    }
  };

  const handleNext = () => {
    const obsidianConfig = {
      vaultPath: vaultPath.trim(),
      syncSettings: {
        autoSync,
        syncInterval,
        includeAttachments,
      },
    };

    updateStep('obsidianConfig', {
      ...obsidianConfig,
      configuredAt: new Date(),
    });

    nextStep();
  };

  const isNextDisabled = !vaultPath.trim() || testResult !== 'success';

  return (
    <OnboardingLayout
      title="Configuration Obsidian"
      description="Configurez votre vault Obsidian pour la synchronisation"
      icon="📝"
      onNext={handleNext}
      nextDisabled={isNextDisabled}
      nextText="Continuer"
    >
      <div className="space-y-6">
        {/* Configuration du vault */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">
              Chemin vers votre vault Obsidian
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="vaultPath" className="block text-sm font-medium text-blue-800 mb-2">
                  Chemin du vault
                </label>
                <Input
                  id="vaultPath"
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  placeholder="/Users/username/Documents/Obsidian Vault"
                  className="border-blue-300 focus:border-blue-500"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Chemin complet vers votre dossier de vault Obsidian
                </p>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Exemples de chemins
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Windows: <code>C:\Users\Username\Documents\My Vault</code></li>
                  <li>• macOS: <code>/Users/username/Documents/Obsidian Vault</code></li>
                  <li>• Linux: <code>/home/username/Documents/MyVault</code></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test de connexion */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Test de connexion
            </h3>
            
            <div className="space-y-4">
              <Button
                onClick={handleTestConnection}
                disabled={isTesting || !vaultPath.trim()}
                variant="outline"
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Test en cours...
                  </>
                ) : (
                  'Tester la connexion'
                )}
              </Button>

              {testResult === 'success' && (
                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-900">Connexion réussie !</h4>
                    <p className="text-green-700 text-sm">Vault Obsidian accessible</p>
                  </div>
                </div>
              )}

              {testResult === 'error' && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-900">Erreur de connexion</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de synchronisation */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Paramètres de synchronisation
            </h3>
            
            <div className="space-y-4">
              {/* Synchronisation automatique */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Synchronisation automatique</h4>
                  <p className="text-sm text-gray-600">Synchroniser automatiquement les nouveaux messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Intervalle de synchronisation */}
              {autoSync && (
                <div>
                  <label htmlFor="syncInterval" className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalle de synchronisation (minutes)
                  </label>
                  <Input
                    id="syncInterval"
                    type="number"
                    min="1"
                    max="60"
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(parseInt(e.target.value) || 5)}
                    className="w-32"
                  />
                </div>
              )}

              {/* Inclure les pièces jointes */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Inclure les pièces jointes</h4>
                  <p className="text-sm text-gray-600">Télécharger et inclure les images et fichiers</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAttachments}
                    onChange={(e) => setIncludeAttachments(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations sur la synchronisation */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              📋 Comment ça fonctionne
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Les messages des canaux sélectionnés sont surveillés</li>
              <li>• Chaque message devient une note Obsidian</li>
              <li>• Les liens et médias sont automatiquement extraits</li>
              <li>• Les notes sont organisées par date et canal</li>
              <li>• Vous pouvez personnaliser le format des notes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
