'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

interface ConsentData {
  messages: boolean;
  metadata: boolean;
  serverInfo: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function ConsentStep() {
  const { nextStep, prevStep, updateStep } = useOnboarding();
  const [consent, setConsent] = useState<ConsentData>({
    messages: false,
    metadata: false,
    serverInfo: false,
    analytics: false,
    marketing: false,
  });

  const [allAccepted, setAllAccepted] = useState(false);

  const handleConsentChange = (type: keyof ConsentData, value: boolean) => {
    const newConsent = { ...consent, [type]: value };
    setConsent(newConsent);
    
    // Vérifier si tous les consentements essentiels sont acceptés
    const essentialConsents = newConsent.messages && newConsent.metadata && newConsent.serverInfo;
    setAllAccepted(essentialConsents);
  };

  const handleAcceptAll = () => {
    const allTrue = {
      messages: true,
      metadata: true,
      serverInfo: true,
      analytics: true,
      marketing: true,
    };
    setConsent(allTrue);
    setAllAccepted(true);
  };

  const handleRejectAll = () => {
    const allFalse = {
      messages: false,
      metadata: false,
      serverInfo: false,
      analytics: false,
      marketing: false,
    };
    setConsent(allFalse);
    setAllAccepted(false);
  };

  const handleNext = () => {
    // Sauvegarder les consentements
    updateStep('consent', {
      consentData: consent,
      timestamp: new Date().toISOString(),
      version: '1.0',
    });
    nextStep();
  };

  return (
    <OnboardingLayout
      title="Consentement RGPD"
      description="Choisissez quelles données vous acceptez de partager"
      icon="🔒"
      onNext={handleNext}
      onPrev={prevStep}
      nextDisabled={!allAccepted}
      nextText="Continuer avec mes choix"
      prevText="Retour"
    >
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">
              📋 Consentement granulaire RGPD
            </h3>
            <p className="text-sm text-blue-800 mb-4">
              Conformément au RGPD, vous devez donner votre consentement explicite pour chaque type de données traitées.
            </p>
            
            <div className="space-y-4">
              {/* Messages Discord */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent-messages"
                    checked={consent.messages}
                    onChange={(e) => handleConsentChange('messages', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-messages" className="font-medium text-blue-900 cursor-pointer">
                      📝 Messages Discord publics
                    </label>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Obligatoire</strong> - Traitement des messages publics des canaux que vous surveillez pour créer des notes Obsidian.
                    </p>
                    <div className="text-xs text-blue-600 mt-2">
                      <strong>Base légale :</strong> Consentement (Art. 6.1.a RGPD)<br/>
                      <strong>Durée :</strong> Jusqu'à suppression de votre compte<br/>
                      <strong>Finalité :</strong> Création automatique de notes Obsidian
                    </div>
                  </div>
                </div>
              </div>

              {/* Métadonnées */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent-metadata"
                    checked={consent.metadata}
                    onChange={(e) => handleConsentChange('metadata', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-metadata" className="font-medium text-blue-900 cursor-pointer">
                      🏷️ Métadonnées des messages
                    </label>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Obligatoire</strong> - Auteur, date, liens, informations de contexte pour organiser vos notes.
                    </p>
                    <div className="text-xs text-blue-600 mt-2">
                      <strong>Base légale :</strong> Consentement (Art. 6.1.a RGPD)<br/>
                      <strong>Durée :</strong> Jusqu'à suppression de votre compte<br/>
                      <strong>Finalité :</strong> Organisation et structuration des notes
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations serveur */}
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent-server"
                    checked={consent.serverInfo}
                    onChange={(e) => handleConsentChange('serverInfo', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-server" className="font-medium text-blue-900 cursor-pointer">
                      🏢 Informations des serveurs
                    </label>
                    <p className="text-sm text-blue-800 mt-1">
                      <strong>Obligatoire</strong> - Noms des serveurs, canaux, permissions pour identifier les sources.
                    </p>
                    <div className="text-xs text-blue-600 mt-2">
                      <strong>Base légale :</strong> Consentement (Art. 6.1.a RGPD)<br/>
                      <strong>Durée :</strong> Jusqu'à suppression de votre compte<br/>
                      <strong>Finalité :</strong> Identification des sources des notes
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent-analytics"
                    checked={consent.analytics}
                    onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-analytics" className="font-medium text-green-900 cursor-pointer">
                      📊 Analytics et amélioration
                    </label>
                    <p className="text-sm text-green-800 mt-1">
                      <strong>Optionnel</strong> - Données d'utilisation anonymisées pour améliorer l'application.
                    </p>
                    <div className="text-xs text-green-600 mt-2">
                      <strong>Base légale :</strong> Consentement (Art. 6.1.a RGPD)<br/>
                      <strong>Durée :</strong> 2 ans maximum<br/>
                      <strong>Finalité :</strong> Amélioration du service
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing */}
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consent-marketing"
                    checked={consent.marketing}
                    onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="consent-marketing" className="font-medium text-purple-900 cursor-pointer">
                      📧 Communications marketing
                    </label>
                    <p className="text-sm text-purple-800 mt-1">
                      <strong>Optionnel</strong> - Emails sur les nouvelles fonctionnalités et mises à jour.
                    </p>
                    <div className="text-xs text-purple-600 mt-2">
                      <strong>Base légale :</strong> Consentement (Art. 6.1.a RGPD)<br/>
                      <strong>Durée :</strong> Jusqu'à retrait du consentement<br/>
                      <strong>Finalité :</strong> Communication sur le service
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Boutons d'action rapide */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              ⚡ Actions rapides
            </h3>
            <div className="flex space-x-4">
              <Button
                onClick={handleAcceptAll}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                ✅ Accepter tout
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                ❌ Refuser tout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résumé des droits */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-yellow-900 mb-4">
              ⚖️ Vos droits RGPD
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Droits d'accès et de contrôle :</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>Droit d'accès</strong> : voir toutes vos données</li>
                  <li>• <strong>Droit de rectification</strong> : corriger vos données</li>
                  <li>• <strong>Droit d'effacement</strong> : supprimer vos données</li>
                  <li>• <strong>Droit de portabilité</strong> : exporter vos données</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Droits de consentement :</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• <strong>Retrait du consentement</strong> : à tout moment</li>
                  <li>• <strong>Consentement granulaire</strong> : par type de données</li>
                  <li>• <strong>Droit d'opposition</strong> : arrêter le traitement</li>
                  <li>• <strong>Contact DPO</strong> : dpo@discord-to-obsidian.com</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut du consentement */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            {allAccepted ? (
              <>
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-700 font-medium">
                  ✅ Consentements essentiels acceptés - Vous pouvez continuer
                </span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-red-700 font-medium">
                  ❌ Consentements essentiels requis pour continuer
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
