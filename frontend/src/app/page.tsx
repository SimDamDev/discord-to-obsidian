'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      // Vérifier si l'utilisateur a déjà complété l'onboarding
      const onboardingCompleted = localStorage.getItem('onboarding-completed');
      if (onboardingCompleted) {
        // Pour le développement, ne pas aller au dashboard
        console.log('✅ Onboarding déjà complété (dashboard désactivé en dev)');
        // router.push('/dashboard');
      } else {
        // Ne pas rediriger automatiquement - laisser l'utilisateur cliquer sur "Commencer"
        console.log('👤 Utilisateur connecté, en attente du clic sur "Commencer"');
        // router.push('/onboarding');
      }
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-center">
          Discord to Obsidian
        </h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Connectez Discord à Obsidian
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Automatisez la création de notes à partir de vos messages Discord
          </p>
          
          {status === 'authenticated' ? (
            <div>
              <p className="text-green-600 mb-4">
                ✅ Connecté en tant que {session?.user?.name}
              </p>
              <button 
                onClick={() => router.push('/onboarding')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Commencer l'onboarding
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">
                Connectez-vous avec Discord pour commencer
              </p>
              <button 
                onClick={() => router.push('/onboarding')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Commencer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Surveillance{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Surveillez vos canaux Discord préférés
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Extraction{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Extrayez automatiquement les liens et contenus
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Création{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Créez des notes Obsidian automatiquement
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h2 className="mb-3 text-2xl font-semibold">
            Synchronisation{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Synchronisez avec votre vault GitHub
          </p>
        </div>
      </div>

      {/* Liens utiles */}
      <div className="text-center mt-8 space-x-6">
        <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 underline">
          🔒 Politique de Confidentialité
        </Link>
        <Link href="/developer" className="text-sm text-gray-500 hover:text-gray-700 underline">
          👨‍💻 Dashboard Développeur
        </Link>
        {status === 'authenticated' && (
          <Link href="/data-management" className="text-sm text-gray-500 hover:text-gray-700 underline">
            📊 Gestion de mes données
          </Link>
        )}
      </div>
    </main>
  )
}
