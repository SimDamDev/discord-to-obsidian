'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function AuthAndConsentStep() {
  const { data: session, status } = useSession();
  const { updateStep, nextStep } = useOnboarding();
  const [isConnecting, setIsConnecting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (session?.user?.discordId && consentGiven) {
      // L'utilisateur est connecté et a donné son consentement
      updateStep('authAndConsent', {
        user: session?.user,
        consent: {
          dataProcessing: true,
          discordAccess: true,
          obsidianSync: true,
          givenAt: new Date(),
        },
        connectedAt: new Date(),
      });
    }
  }, [session, consentGiven, updateStep]);

  const handleDiscordConnect = async () => {
    setIsConnecting(true);
    try {
      await signIn('discord', {
        callbackUrl: '/onboarding',
        redirect: false,
      });
    } catch (error) {
      console.error('Erreur lors de la connexion Discord:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsentGiven(event.target.checked);
  };

  const handleNext = () => {
    if (session?.user?.discordId && consentGiven) {
      nextStep();
    }
  };

  const isConnected = !!session?.user?.discordId;
  const isLoading = status === 'loading' || isConnecting;
  const canProceed = isConnected && consentGiven;

  return (
    <OnboardingLayout
      title="Connexion & Consentement"
      description="Connectez-vous avec Discord et acceptez nos conditions d'utilisation"
      icon="🔐"
      onNext={handleNext}
      nextDisabled={!canProceed || isLoading}
      nextText="Continuer"
      showPrevious={false}
    >
      <div className="space-y-6">
        {/* Section Connexion Discord */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-blue-900">
                🔗 Connexion Discord
              </h3>
              <HelpTooltip content="Nous utilisons l'authentification Discord pour accéder à vos serveurs et canaux. Vos données restent privées et sécurisées." />
            </div>
            
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Connexion en cours...</p>
              </div>
            ) : isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">Connecté avec succès !</h4>
                  <p className="text-green-700">
                    Bonjour <strong>{session?.user?.name}</strong> !
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-blue-800 text-sm">
                  Nous avons besoin d'accéder à vos serveurs Discord pour configurer la surveillance.
                </p>
                <Button
                  onClick={handleDiscordConnect}
                  disabled={isConnecting}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Se connecter avec Discord
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Consentement RGPD */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-green-900">
                🛡️ Consentement RGPD
              </h3>
              <HelpTooltip content="Conformément au RGPD, nous vous expliquons clairement comment vos données sont utilisées. Vous gardez le contrôle total." />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={handleConsentChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm text-green-800">
                  <strong>J'accepte que Discord to Obsidian :</strong>
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• Accède aux messages publics des canaux que je sélectionne</li>
                    <li>• Stocke ces messages dans mon vault Obsidian local</li>
                    <li>• Ne partage jamais mes données avec des tiers</li>
                    <li>• Me permette de supprimer toutes mes données à tout moment</li>
                  </ul>
                </label>
              </div>
              
              <div className="text-xs text-green-600 bg-green-100 p-3 rounded">
                <strong>🔒 Sécurité :</strong> Vos données sont chiffrées et stockées localement. 
                Nous ne pouvons pas accéder à vos messages privés ou à vos données personnelles.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations sur les permissions */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-2">
              📋 Permissions requises
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-800 mb-1">✅ Ce que nous pouvons faire :</h5>
                <ul className="text-gray-700 space-y-1">
                  <li>• Lire les messages publics des canaux autorisés</li>
                  <li>• Accéder aux informations de base des serveurs</li>
                  <li>• Créer des notes dans votre vault Obsidian</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-red-800 mb-1">❌ Ce que nous ne pouvons pas faire :</h5>
                <ul className="text-gray-700 space-y-1">
                  <li>• Accéder aux messages privés</li>
                  <li>• Modifier vos serveurs Discord</li>
                  <li>• Partager vos données</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
