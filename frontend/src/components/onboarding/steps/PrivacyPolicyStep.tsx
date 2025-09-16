'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function PrivacyPolicyStep() {
  const { nextStep, prevStep } = useOnboarding();
  const [hasRead, setHasRead] = useState(false);

  const handleAccept = () => {
    setHasRead(true);
    nextStep();
  };

  return (
    <OnboardingLayout
      title="Politique de Confidentialité"
      description="Transparence totale sur l'utilisation de vos données"
      icon="🔒"
      onNext={handleAccept}
      onPrev={prevStep}
      nextDisabled={!hasRead}
      nextText="J'accepte et continue"
      prevText="Retour"
    >
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">
              📋 Résumé de la Politique de Confidentialité
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🎯 Objectif de l'application</h4>
                <p className="text-sm text-blue-800">
                  Cette application vous permet de créer automatiquement des notes Obsidian à partir de messages Discord publics. 
                  Nous ne collectons que les données nécessaires à cette fonctionnalité.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">📊 Données collectées</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Informations de connexion Discord</strong> : ID utilisateur, nom d'utilisateur</li>
                  <li>• <strong>Liste des serveurs</strong> où vous avez invité le bot</li>
                  <li>• <strong>Messages publics</strong> des canaux que vous surveillez</li>
                  <li>• <strong>Métadonnées</strong> : dates, auteurs, liens extraits</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🚫 Données NON collectées</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Messages privés</strong> (DM) - jamais accessibles</li>
                  <li>• <strong>Mots de passe</strong> ou informations de connexion</li>
                  <li>• <strong>Données personnelles</strong> d'autres utilisateurs</li>
                  <li>• <strong>Informations de paiement</strong> (application gratuite)</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔐 Sécurité et protection</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Chiffrement</strong> : toutes les données sont chiffrées</li>
                  <li>• <strong>Isolation</strong> : vos données ne sont jamais mélangées avec d'autres</li>
                  <li>• <strong>Accès restreint</strong> : seuls les canaux que vous autorisez</li>
                  <li>• <strong>Audit</strong> : logs de tous les accès aux données</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">⚖️ Vos droits RGPD</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Droit d'accès</strong> : voir toutes vos données collectées</li>
                  <li>• <strong>Droit de rectification</strong> : corriger vos données</li>
                  <li>• <strong>Droit d'effacement</strong> : supprimer toutes vos données</li>
                  <li>• <strong>Droit de portabilité</strong> : exporter vos données</li>
                  <li>• <strong>Droit d'opposition</strong> : arrêter le traitement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-4">
              ✅ Engagement de transparence
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Transparence totale</h4>
                  <p className="text-sm text-green-800">
                    Nous vous expliquons exactement quelles données nous collectons et pourquoi.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Contrôle total</h4>
                  <p className="text-sm text-green-800">
                    Vous choisissez quels canaux surveiller et pouvez tout arrêter à tout moment.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Pas de vente de données</h4>
                  <p className="text-sm text-green-800">
                    Nous ne vendons, ne louons, ni ne partageons vos données avec des tiers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Contact et questions</h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Si vous avez des questions sur cette politique de confidentialité ou sur l'utilisation de vos données, 
                  n'hésitez pas à nous contacter.
                </p>
                <div className="text-sm text-yellow-800">
                  <p><strong>Email :</strong> privacy@discord-to-obsidian.com</p>
                  <p><strong>Support :</strong> support@discord-to-obsidian.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold text-purple-900 mb-4">
              👨‍💻 Transparence développeur
            </h2>
            <p className="text-sm text-purple-800 mb-4">
              En tant que développeur de cette application, voici ce que je peux voir :
            </p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-900 mb-2">✅ Ce que je peux voir :</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>Statistiques générales</strong> : nombre d'utilisateurs, serveurs surveillés</li>
                  <li>• <strong>Vos données</strong> : seulement si vous utilisez mon application</li>
                  <li>• <strong>Logs d'audit</strong> : pour la sécurité et le debugging</li>
                  <li>• <strong>Messages publics</strong> : uniquement des canaux que vous autorisez</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h3 className="font-medium text-red-900 mb-2">❌ Ce que je ne peux pas voir :</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• <strong>Vos messages privés</strong> - jamais accessibles</li>
                  <li>• <strong>Autres serveurs</strong> où vous êtes mais où le bot n'est pas</li>
                  <li>• <strong>Données d'autres développeurs</strong> Discord</li>
                  <li>• <strong>Informations de connexion</strong> (mots de passe, etc.)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="privacy-accept"
            checked={hasRead}
            onChange={(e) => setHasRead(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="privacy-accept" className="text-sm text-gray-700">
            J'ai lu et compris la politique de confidentialité. Je consens à l'utilisation de mes données 
            dans les conditions décrites ci-dessus.
          </label>
        </div>
      </div>
    </OnboardingLayout>
  );
}
