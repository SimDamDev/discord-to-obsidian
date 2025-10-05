'use client';

// Désactiver le prerendering pour cette page qui utilise des APIs client
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Récupérer les paramètres de l'URL côté client uniquement
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get('step');
    const botInvited = urlParams.get('botInvited');
    const error = urlParams.get('error');
    const code = urlParams.get('code');

    if (error) {
      // En cas d'erreur, rediriger vers l'onboarding avec un message d'erreur
      router.push(`/onboarding?error=${encodeURIComponent(error)}`);
      return;
    }

    if (code || botInvited === 'true') {
      // Le bot a été invité avec succès (code OAuth ou paramètre botInvited)
      // Rediriger vers l'étape actuelle avec le flag botInvited
      const currentStep = step ? parseInt(step) : 1;
      router.push(`/onboarding?step=${currentStep}&botInvited=true`);
      return;
    }

    // Redirection par défaut vers l'onboarding
    router.push('/onboarding');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirection en cours...
        </h2>
        <p className="text-gray-600">
          Vous allez être redirigé vers l'application.
        </p>
      </div>
    </div>
  );
}

