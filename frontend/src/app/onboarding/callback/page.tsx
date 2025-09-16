'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OnboardingCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const step = searchParams.get('step');
    const botInvited = searchParams.get('botInvited');
    const error = searchParams.get('error');
    const code = searchParams.get('code');

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
  }, [router, searchParams]);

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
