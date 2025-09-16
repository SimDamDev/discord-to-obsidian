'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingLayout } from '../shared/OnboardingLayout';
import { useOnboarding } from '../OnboardingProvider';

export function DiscordAuthStep() {
  const { data: session, status } = useSession();
  const { updateStep, nextStep } = useOnboarding();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (session?.user?.discordId) {
      // L'utilisateur est connecté, marquer cette étape comme complétée
      updateStep('discordAuth', {
        user: session.user,
        connectedAt: new Date(),
      });
    }
  }, [session, updateStep]);

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

  const handleNext = () => {
    if (session?.user?.discordId) {
      nextStep();
    }
  };

  const isConnected = !!session?.user?.discordId;
  const isLoading = status === 'loading' || isConnecting;

  return (
    <OnboardingLayout
      title="Connexion Discord"
      description="Connectez-vous avec votre compte Discord pour commencer"
      icon="🎮"
      onNext={handleNext}
      nextDisabled={!isConnected || isLoading}
      nextText="Continuer"
      showPrevious={false}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Connexion en cours...</p>
          </div>
        ) : isConnected ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Connecté avec succès !</h3>
                  <p className="text-green-700">
                    Bonjour <strong>{session.user.name}</strong> !
                  </p>
                  <p className="text-sm text-green-600">
                    ID Discord: {session.user.discordId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Connectez-vous avec Discord
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Nous avons besoin d'accéder à vos serveurs Discord pour configurer la surveillance.
                Vos données restent privées et sécurisées.
              </p>
            </div>

            <Button
              onClick={handleDiscordConnect}
              disabled={isConnecting}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-3 text-lg font-semibold"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Se connecter avec Discord
            </Button>

            <div className="text-sm text-gray-500 max-w-md mx-auto">
              <p>
                En vous connectant, vous acceptez nos{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        )}

        {/* Informations sur les permissions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-blue-900 mb-2">
              Permissions requises
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Lecture des serveurs Discord</li>
              <li>• Lecture des canaux de texte</li>
              <li>• Accès aux informations de base du profil</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Ces permissions sont nécessaires pour configurer la surveillance de vos canaux Discord.
            </p>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
}
